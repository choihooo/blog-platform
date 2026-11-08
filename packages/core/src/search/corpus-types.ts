export type RagDocument = {
  key: string;
  title: string;
  url: string;
  text: string;
  tags?: string[];
  categories?: string[];
};

export type RagChunk = RagDocument & { id: string };

export type PublicPostRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  tags_json?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  parent_category_name?: string | null;
  parent_category_slug?: string | null;
};
