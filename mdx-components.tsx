import type { MDXComponents } from "mdx/types";
import { PostHeader } from "@/components/PostHeader";
import { CodeBlock } from "@/components/CodeBlock";

// 여기에 등록한 컴포넌트는 모든 .mdx 파일에서 import 없이 바로 쓸 수 있다.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    PostHeader,
    pre: CodeBlock,
    ...components,
  };
}
