import type { CuratedPageStatus } from "@/prisma/enums";

export interface CuratedPageResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  bannerImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  introContent: string | null;
  faqContent: string | null;
  schemaMarkup: string | null;
  status: CuratedPageStatus;
  publishAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: CuratedPageItemResponse[];
  itemCount: number;
  totalItems?: number;
}

export interface CuratedPageItemResponse {
  id: string;
  movieId: number;
  order: number;
  createdAt: Date;
}
