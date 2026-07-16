import { StatusCodes } from "@/core/constants";
import { prisma } from "@/core/database";
import { throwError } from "@/core/utils/app-error";
import { CuratedPageStatus } from "@/prisma/enums";

import type { CuratedPageItemResponse, CuratedPageResponse } from "./curated-pages.types";

const pageSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  bannerImage: true,
  seoTitle: true,
  seoDescription: true,
  introContent: true,
  faqContent: true,
  schemaMarkup: true,
  status: true,
  publishAt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const itemSelect = {
  id: true,
  movieId: true,
  order: true,
  createdAt: true,
} as const;

function toResponse(
  page: Record<string, unknown>,
  items: { id: string; movieId: number; order: number; createdAt: Date }[] = [],
): CuratedPageResponse {
  return {
    ...page,
    status: page?.["status"] as CuratedPageStatus,
    items: items.map((item) => ({
      id: item.id,
      movieId: item.movieId,
      order: item.order,
      createdAt: item.createdAt,
    })),
    itemCount: items.length,
  } as CuratedPageResponse;
}

async function getItemsPaginated(pageId: string, itemPage: number, itemLimit: number) {
  const [items, totalItems] = await Promise.all([
    prisma.curatedPageItem.findMany({
      where: { pageId },
      select: itemSelect,
      orderBy: { order: "asc" },
      skip: (itemPage - 1) * itemLimit,
      take: itemLimit,
    }),
    prisma.curatedPageItem.count({ where: { pageId } }),
  ]);
  return { items, totalItems };
}

const create = async (payload: {
  title: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  introContent?: string;
  faqContent?: string;
  status?: CuratedPageStatus;
}): Promise<CuratedPageResponse> => {
  const titleExists = await prisma.curatedPage.findUnique({ where: { title: payload.title } });
  if (titleExists) {
    throwError(StatusCodes.CONFLICT, "A page with this title already exists.");
  }

  const slugExists = await prisma.curatedPage.findUnique({ where: { slug: payload.slug } });
  if (slugExists) {
    throwError(StatusCodes.CONFLICT, "A page with this slug already exists.");
  }

  const isPublished = payload.status === CuratedPageStatus.PUBLISHED;
  const now = isPublished ? new Date() : undefined;

  const page = await prisma.curatedPage.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      description: payload.description ?? null,
      bannerImage: payload.bannerImage ?? null,
      seoTitle: payload.seoTitle ?? null,
      seoDescription: payload.seoDescription ?? null,
      introContent: payload.introContent ?? null,
      faqContent: payload.faqContent ?? null,
      status: payload.status ?? CuratedPageStatus.DRAFT,
      publishedAt: now ?? null,
      schemaMarkup: isPublished
        ? JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: payload.title,
            description: payload.description,
            url: `/pages/${payload.slug}`,
            datePublished: now!.toISOString(),
            dateModified: now!.toISOString(),
          })
        : null,
    },
    select: pageSelect,
  });

  return toResponse(page, []);
};

const list = async (params: {
  status?: CuratedPageStatus;
  search?: string;
  page: number;
  limit: number;
}): Promise<{ data: CuratedPageResponse[]; total: number }> => {
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [pages, total] = await Promise.all([
    prisma.curatedPage.findMany({
      where,
      select: pageSelect,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.curatedPage.count({ where }),
  ]);

  const data = pages.map((p) => toResponse(p, []));
  return { data, total };
};

const getById = async (
  id: string,
  itemPage = 1,
  itemLimit = 20,
): Promise<CuratedPageResponse & { totalItems: number }> => {
  const page = await prisma.curatedPage.findUnique({
    where: { id },
    select: pageSelect,
  });

  if (!page) {
    throwError(StatusCodes.NOT_FOUND, "Page not found.");
  }

  const { items, totalItems } = await getItemsPaginated(id, itemPage, itemLimit);

  return { ...toResponse(page, items), totalItems };
};

const update = async (
  id: string,
  payload: {
    title?: string;
    slug?: string;
    description?: string;
    bannerImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    introContent?: string;
    faqContent?: string;
  },
): Promise<CuratedPageResponse> => {
  const existing = await prisma.curatedPage.findUnique({ where: { id } });
  if (!existing) {
    throwError(StatusCodes.NOT_FOUND, "Page not found.");
  }

  if (payload.slug && payload.slug !== existing.slug) {
    const slugExists = await prisma.curatedPage.findUnique({ where: { slug: payload.slug } });
    if (slugExists) {
      throwError(StatusCodes.CONFLICT, "A page with this slug already exists.");
    }
  }

  const page = await prisma.curatedPage.update({
    where: { id },
    data: payload,
    select: pageSelect,
  });

  return toResponse(page, []);
};

const remove = async (id: string): Promise<void> => {
  const existing = await prisma.curatedPage.findUnique({ where: { id } });
  if (!existing) {
    throwError(StatusCodes.NOT_FOUND, "Page not found.");
  }

  await prisma.curatedPage.delete({ where: { id } });
};

const addItems = async (id: string, movieIds: number[]): Promise<CuratedPageItemResponse[]> => {
  const page = await prisma.curatedPage.findUnique({ where: { id }, select: { id: true } });
  if (!page) {
    throwError(StatusCodes.NOT_FOUND, "Page not found.");
  }

  const maxOrder = await prisma.curatedPageItem.aggregate({
    where: { pageId: id },
    _max: { order: true },
  });

  let nextOrder = (maxOrder._max.order ?? 0) + 1;

  await prisma.curatedPageItem.createMany({
    data: movieIds.map((movieId) => ({
      pageId: id,
      movieId,
      order: nextOrder++,
    })),
  });

  const items = await prisma.curatedPageItem.findMany({
    where: { pageId: id },
    select: itemSelect,
    orderBy: { order: "asc" },
  });

  return items;
};

const removeItem = async (pageId: string, itemId: string): Promise<void> => {
  const item = await prisma.curatedPageItem.findUnique({ where: { id: itemId } });
  if (!item || item.pageId !== pageId) {
    throwError(StatusCodes.NOT_FOUND, "Item not found.");
  }

  await prisma.curatedPageItem.delete({ where: { id: itemId } });
};

const reorderItems = async (
  pageId: string,
  itemIds: string[],
): Promise<CuratedPageItemResponse[]> => {
  const existing = await prisma.curatedPageItem.findMany({
    where: { pageId },
    select: { id: true, movieId: true },
  });

  const itemMap = new Map(existing.map((i) => [i.id, i.movieId]));
  const missing = itemIds.filter((id) => !itemMap.has(id));
  if (missing.length > 0) {
    throwError(StatusCodes.BAD_REQUEST, `Items not found on this page: ${missing.join(", ")}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.curatedPageItem.deleteMany({ where: { pageId } });
    await tx.curatedPageItem.createMany({
      data: itemIds.map((id, index) => ({
        id,
        pageId,
        movieId: itemMap.get(id)!,
        order: index,
      })),
    });
  });

  const items = await prisma.curatedPageItem.findMany({
    where: { pageId },
    select: itemSelect,
    orderBy: { order: "asc" },
  });

  return items;
};

const publish = async (id: string, publishAt?: string): Promise<CuratedPageResponse> => {
  const page = await prisma.curatedPage.findUnique({ where: { id } });
  if (!page) {
    throwError(StatusCodes.NOT_FOUND, "Page not found.");
  }

  const status = publishAt ? CuratedPageStatus.SCHEDULED : CuratedPageStatus.PUBLISHED;
  const now = new Date();
  const publishDate = publishAt ? new Date(publishAt) : now;

  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.seoTitle || page.title,
    description: page.seoDescription || page.description,
    url: `/pages/${page.slug}`,
    datePublished: page.publishedAt ?? now.toISOString(),
    dateModified: now.toISOString(),
  });

  const updated = await prisma.curatedPage.update({
    where: { id },
    data: {
      status,
      publishAt: publishAt ? publishDate : null,
      publishedAt: status === CuratedPageStatus.PUBLISHED ? now : null,
      schemaMarkup,
    },
    select: pageSelect,
  });

  return toResponse(updated, []);
};

export const CuratedPagesService = {
  create,
  list,
  getById,
  update,
  remove,
  addItems,
  removeItem,
  reorderItems,
  publish,
};
