"""Read-only verification of public JSON and rendered article structure after recovery."""
import concurrent.futures
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path


class Article(HTMLParser):
    void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.codes = []
        self.images = []
        self.headings = []
        self.tables = 0
        self.pre = None
        self.heading = None
        self.visible = []
        self.inline_code = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if not self.depth:
            if "prose" in attrs.get("class", "").split():
                self.depth = 1
            return
        if tag not in self.void:
            self.depth += 1
        if tag == "pre":
            self.pre = []
        if tag == "code":
            self.inline_code += 1
        if tag == "img":
            self.images.append(attrs.get("src"))
        if tag == "table":
            self.tables += 1
        if re.fullmatch(r"h[1-6]", tag):
            self.heading = [int(tag[1]), []]

    def handle_data(self, data):
        if not self.depth:
            return
        if self.pre is not None:
            self.pre.append(data)
        elif not self.inline_code:
            self.visible.append(data)
        if self.heading is not None:
            self.heading[1].append(data)

    def handle_endtag(self, tag):
        if not self.depth or tag in self.void:
            return
        if tag == "pre" and self.pre is not None:
            self.codes.append("".join(self.pre))
            self.pre = None
        if tag == "code":
            self.inline_code = max(0, self.inline_code - 1)
        if re.fullmatch(r"h[1-6]", tag) and self.heading is not None:
            self.headings.append((self.heading[0], "".join(self.heading[1])))
            self.heading = None
        self.depth -= 1


def flatten(nodes):
    for node in nodes:
        yield node
        for item in node.get("items", []):
            yield from flatten(item)
        yield from flatten(node.get("children", []))
        for row in node.get("rows", []):
            for cell in row:
                yield from flatten(cell["body"])


def fetch(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        assert response.status == 200
        return response.read().decode()


def main():
    directory = Path(sys.argv[1] if len(sys.argv) > 1 else "_workspace/content-rendering-recovery-20261105")
    origin = sys.argv[2] if len(sys.argv) > 2 else "https://hozorica.com"
    manifest = json.loads((directory / "manifest.json").read_text())
    expected = {entry["id"]: entry for entry in manifest["entries"]}
    api = json.loads(fetch("https://cms.hozorica.com/api/public-content?page=1&limit=100&includeTotal=true"))
    assert api["total"] == len(api["posts"]) == 35
    for post in api["posts"]:
        if post["id"] in expected:
            assert post["content"] == expected[post["id"]]["after"], "Stale API: " + post["slug"]

    def verify(post):
        nodes = list(flatten(json.loads(post["content"])["nodes"]))
        html = fetch(origin + "/blog/" + post["slug"])
        assert 'data-content-schema="1-rich"' in html, "Old renderer: " + post["slug"]
        actual = Article()
        actual.feed(html)
        assert actual.codes == [node["text"] for node in nodes if node["type"] == "codeBlock"], "Code mismatch: " + post["slug"]
        assert actual.tables == sum(node["type"] == "table" for node in nodes), "Table mismatch: " + post["slug"]
        assert actual.images == [node["src"] for node in nodes if node["type"] == "image"], "Image mismatch: " + post["slug"]
        if post["id"] in expected:
            expected_headings = [(node.get("depth", 2), node["text"]) for node in nodes if node["type"] == "heading"]
            allowed_headings = [expected_headings]
            # Canonical rounded articles omit an initial h1 duplicating the page title.
            if expected_headings and expected_headings[0] == (1, post["title"]):
                allowed_headings.append(expected_headings[1:])
            assert actual.headings in allowed_headings, "Heading mismatch: " + post["slug"]
            leaked = [text for text in actual.visible if "```" in text or "**" in text or re.fullmatch(r"\s*#{1,6}\s*", text)]
            assert not leaked, "Markdown leak: " + post["slug"]
        return {"slug": post["slug"], "codeBlocks": len(actual.codes), "tables": actual.tables, "images": len(actual.images), "headings": len(actual.headings), "ok": True}

    def checked(post):
        try:
            return verify(post)
        except Exception as error:
            return {"slug": post["slug"], "ok": False, "error": str(error)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(checked, api["posts"]))
    (directory / "public-verified.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
    failed = [row for row in results if not row["ok"]]
    if failed:
        for row in failed:
            print("FAIL:", row["slug"], row["error"])
        raise SystemExit(1)
    print("PASS:", len(results), "public articles;", sum(row["codeBlocks"] for row in results), "exact rendered code blocks;", sum(row["tables"] for row in results), "tables;", sum(row["images"] for row in results), "body images")


if __name__ == "__main__":
    main()
