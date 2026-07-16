import { z } from "zod";

import { CuratedPageStatus } from "@/prisma/enums";

const CreatePageSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    bannerImage: z.string().optional(),
    seoTitle: z.string().max(255).optional(),
    seoDescription: z.string().optional(),
    introContent: z.string().optional(),
    faqContent: z.string().optional(),
    status: z.enum(CuratedPageStatus).optional(),
  }),
});

const UpdatePageSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    bannerImage: z.string().optional(),
    seoTitle: z.string().max(255).optional(),
    seoDescription: z.string().optional(),
    introContent: z.string().optional(),
    faqContent: z.string().optional(),
    status: z.enum(CuratedPageStatus).optional(),
  }),
});

const AddItemsSchema = z.object({
  body: z.object({
    movieIds: z.array(z.number().int().positive()).min(1),
  }),
});

const ReorderItemsSchema = z.object({
  body: z.object({
    itemIds: z.array(z.string().min(1)).min(1),
  }),
});

const PageIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const PublishSchema = z.object({
  body: z.object({
    publishAt: z.string().datetime().optional(),
  }),
});

export const CuratedPageSchema = {
  CreatePageSchema,
  UpdatePageSchema,
  AddItemsSchema,
  ReorderItemsSchema,
  PageIdParamsSchema,
  PublishSchema,
};
