import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();
const stringArray = z.array(z.string().trim().min(1)).optional();

export const postFrontmatterSchema = z.object({
  title: optionalString,
  status: z.unknown(),
  slug: optionalString,
  author: optionalString,
  publishedAt: optionalString,
  updatedAt: optionalString,
  excerpt: optionalString,
  coverImage: optionalString,
  category: optionalString,
  tags: stringArray,
});

export const authorFrontmatterSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  githubLogin: z.string().trim().min(1),
  githubUserId: z.string().trim().min(1),
  bio: optionalString,
  avatar: optionalString,
});

export const categorySchema = z.object({
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: optionalString,
});

export const tagSchema = z.object({
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: optionalString,
});

export const siteConfigSchema = z.object({
  siteName: z.string().trim().min(1),
  siteUrl: z.string().trim().min(1),
  defaultAuthor: z.string().trim().min(1),
  adminGithubLogin: z.string().trim().min(1),
  adminGithubUserId: z.string().trim().min(1),
  github: z.object({
    owner: z.string().trim().min(1),
    repo: z.string().trim().min(1),
    branch: z.string().trim().min(1),
  }),
  analytics: z.object({
    provider: z.string().trim().min(1),
  }),
  features: z.object({
    aiAssistant: z.boolean(),
    internalLinkSuggestions: z.boolean(),
  }),
});
