import prisma from "@/lib/prisma";

export interface AdminProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
  isActive?: "all" | "true" | "false";
  inStock?: boolean;
  isFeatured?: boolean;
  hasDiscount?: boolean;
  isNew?: boolean;
  orderBy?: string;
  minPrice?: number;
  maxPrice?: number;
}

const ORDER_BY_MAP: Record<string, Record<string, string>> = {
  "createdAt:desc": { createdAt: "desc" },
  "createdAt:asc": { createdAt: "asc" },
  "price:asc": { price: "asc" },
  "price:desc": { price: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  "name:asc": { name: "asc" },
  "name:desc": { name: "desc" },
  name_asc: { name: "asc" },
  "stock:asc": { stock: "asc" },
  "stock:desc": { stock: "desc" },
  newest: { createdAt: "desc" },
};

export async function getAdminProducts(params: AdminProductParams = {}) {
  const {
    page = 1,
    limit = 20,
    search = "",
    categoryId,
    brandId,
    isActive = "all",
    inStock,
    isFeatured,
    hasDiscount,
    isNew,
    orderBy = "createdAt:desc",
    minPrice,
    maxPrice,
  } = params;

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (isActive === "true") where.isActive = true;
  else if (isActive === "false") where.isActive = false;
  // "all" → filtre yok

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { category: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (categoryId) {
    const childCats = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });
    where.categoryId = { in: [categoryId, ...childCats.map((c) => c.id)] };
  }

  if (brandId) where.brandId = brandId;
  if (inStock) where.stock = { gt: 0 };
  if (isFeatured) where.isFeatured = true;
  if (hasDiscount) where.comparePrice = { not: null };
  if (isNew) where.isNew = true;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  const orderByClause = ORDER_BY_MAP[orderBy] ?? { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
      skip,
      take: limit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: orderByClause as any,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    // JSON serialize için Prisma Date nesneleri string'e dönüştürülüyor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: products as any[],
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
