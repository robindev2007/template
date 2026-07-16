import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { CuratedPagesService } from "./curated-pages.service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const create = catchAsync(async (req, res) => {
  const {
    title,
    description,
    bannerImage,
    seoTitle,
    seoDescription,
    introContent,
    faqContent,
    status,
  } = req.body;
  const result = await CuratedPagesService.create({
    title,
    slug: slugify(title),
    description,
    bannerImage,
    seoTitle,
    seoDescription,
    introContent,
    faqContent,
    status,
  });
  sendResponse.created(res, "Page created", result);
});

const list = catchAsync(async (req, res) => {
  const status = req.query["status"] as string | undefined;
  const search = req.query["search"] as string | undefined;
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));

  const result = await CuratedPagesService.list({
    status: status as any,
    search,
    page,
    limit,
  });
  sendResponse.paginated(res, result.data, { page, limit, total: result.total }, "Pages retrieved");
});

const getById = catchAsync(async (req, res) => {
  const itemPage = Math.max(1, Number(req.query["itemPage"]) || 1);
  const itemLimit = Math.min(100, Math.max(1, Number(req.query["itemLimit"]) || 20));
  const result = await CuratedPagesService.getById(req.params["id"] as string, itemPage, itemLimit);
  sendResponse.ok(res, "Page retrieved", result);
});

const update = catchAsync(async (req, res) => {
  const body = { ...req.body };
  if (body.title) body.slug = slugify(body.title);
  const result = await CuratedPagesService.update(req.params["id"] as string, body);
  sendResponse.ok(res, "Page updated", result);
});

const remove = catchAsync(async (req, res) => {
  await CuratedPagesService.remove(req.params["id"] as string);
  sendResponse.ok(res, "Page deleted");
});

const addItems = catchAsync(async (req, res) => {
  const { movieIds } = req.body;
  const result = await CuratedPagesService.addItems(req.params["id"] as string, movieIds);
  sendResponse.ok(res, "Items added", result);
});

const removeItem = catchAsync(async (req, res) => {
  await CuratedPagesService.removeItem(req.params["id"] as string, req.params["itemId"] as string);
  sendResponse.ok(res, "Item removed");
});

const reorderItems = catchAsync(async (req, res) => {
  const { itemIds } = req.body;
  const result = await CuratedPagesService.reorderItems(req.params["id"] as string, itemIds);
  sendResponse.ok(res, "Items reordered", result);
});

const publish = catchAsync(async (req, res) => {
  const { publishAt } = req.body;
  const result = await CuratedPagesService.publish(req.params["id"] as string, publishAt);
  sendResponse.ok(res, "Page published", result);
});

export const CuratedPagesController = {
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
