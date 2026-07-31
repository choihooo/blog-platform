import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blog-platform/design-system";
import { ArrowUpRight, Plus } from "lucide-react";

import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { AccessState, CmsShell } from "../../components/shell/index";
import { listPostSummaries, type PostSummary } from "../../lib/editor/editor-loader";

type PostsPageSearchParams = {
  q?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function PostsPageView({
  decision,
  posts = [],
  query = "",
}: {
  decision: AccessDecision;
  posts?: PostSummary[];
  query?: string;
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  return (
    <CmsShell activePath="/posts" session={decision.session} title="Posts">
      <section className="space-y-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Content library</p>
            <h2 className="mt-1 text-3xl font-semibold">모든 글</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {query
                ? `"${query}" 검색 결과 ${posts.length}개`
                : `D1 데이터베이스의 초안과 발행 글 ${posts.length}개`}
            </p>
          </div>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            href="/posts/new"
          >
            <Plus aria-hidden="true" size={16} />새 초안
          </a>
        </div>
        <form action="/posts" className="flex max-w-2xl gap-2">
          <Input
            aria-label="Search posts"
            className="h-10"
            defaultValue={query}
            name="q"
            placeholder="제목, slug, 상태, 본문 검색"
            type="search"
          />
          <Button type="submit" variant="secondary">
            검색
          </Button>
          {query ? (
            <Button asChild type="button" variant="ghost">
              <a href="/posts">초기화</a>
            </Button>
          ) : null}
        </form>
        <div className="rounded-lg border border-border bg-card">
          {posts.length > 0 ? (
            <Table className="min-w-[46rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[16rem] whitespace-nowrap">제목</TableHead>
                  <TableHead className="whitespace-nowrap">상태</TableHead>
                  <TableHead className="whitespace-nowrap">경로</TableHead>
                  <TableHead className="whitespace-nowrap">바로가기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.path} className="hover:bg-muted/60">
                    <TableCell className="min-w-[16rem]">
                      <a
                        className="block min-w-0 truncate font-medium"
                        href={`/posts/${post.slug}`}
                      >
                        {post.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {post.path}
                    </TableCell>
                    <TableCell>
                      <a
                        className="inline-flex items-center gap-2 text-muted-foreground transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
                        href={`/posts/${post.slug}`}
                        aria-label={`${post.title}로 이동`}
                      >
                        열기
                        <ArrowUpRight aria-hidden="true" size={16} />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="font-medium">표시할 글이 없습니다.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? "검색어를 바꾸거나 초기화해보세요."
                  : "D1 연결을 확인하거나 첫 초안을 만들어보세요."}
              </p>
            </div>
          )}
        </div>
      </section>
    </CmsShell>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: Promise<PostsPageSearchParams>;
}) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({} as PostsPageSearchParams));
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const [decision, posts] = await Promise.all([
    requireCmsAccess(),
    listPostSummaries(undefined, { query }),
  ]);
  return <PostsPageView decision={decision} posts={posts} query={query} />;
}
