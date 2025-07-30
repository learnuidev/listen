const { z } = require("zod");

const PriceSchema = z.object({
  createdAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
  id: z.string().uuid(),
  amountType: z.enum(["free", "fixed"]), // Adjust values if there are more
  isArchived: z.boolean(),
  productId: z.string().uuid(),
  type: z.enum(["one_time"]), // Add more values if applicable
  recurringInterval: z.string().nullable(), // Nullable
  priceCurrency: z.string().optional(), // Present only in some objects
  priceAmount: z.number().optional(), // Present only in some objects
});

const ProductSchema = z.object({
  createdAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  recurringInterval: z.string().nullable(),
  isRecurring: z.boolean(),
  isArchived: z.boolean(),
  organizationId: z.string().uuid(),
  metadata: z.record(z.any()), // Accepts any extra metadata key-value
  prices: z.array(PriceSchema),
  benefits: z.array(z.unknown()), // Adjust if benefit structure is known
  medias: z.array(z.unknown()), // Adjust if media structure is known
  attachedCustomFields: z.array(z.unknown()), // Adjust if known
});

const PaginationSchema = z.object({
  totalCount: z.number(),
  maxPage: z.number(),
});

const ResultSchema = z.object({
  items: z.array(ProductSchema),
  pagination: PaginationSchema,
});

const ListProductsSchema = z.object({
  result: ResultSchema,
});

module.exports = {
  ListProductsSchema,
};
