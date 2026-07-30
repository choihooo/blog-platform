import type { EditorFrontmatter } from "@blog-platform/editor";
import { Input } from "@blog-platform/design-system";

type Props = {
  frontmatter: EditorFrontmatter;
  onChange?: (frontmatter: EditorFrontmatter) => void;
};

export function FrontmatterPanel({ frontmatter, onChange }: Props) {
  const update = (key: keyof EditorFrontmatter, value: string) =>
    onChange?.({ ...frontmatter, [key]: value });

  return (
    <aside className="space-y-4 border-l border-border p-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-title">
          Title
        </label>
        <Input
          id="editor-title"
          value={frontmatter.title}
          onChange={(event) => update("title", event.currentTarget.value)}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-excerpt">
          Excerpt
        </label>
        <Input
          id="editor-excerpt"
          value={frontmatter.excerpt ?? ""}
          onChange={(event) => update("excerpt", event.currentTarget.value)}
        />
      </div>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{frontmatter.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Slug</dt>
          <dd>{frontmatter.slug ?? "created on save"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cover</dt>
          <dd>{frontmatter.coverImage ?? "none"}</dd>
        </div>
      </dl>
    </aside>
  );
}
