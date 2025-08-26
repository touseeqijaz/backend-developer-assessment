import { z } from "zod";
import prisma from "../config/database.js";

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars").max(50, "Name max 50 chars"),
  email: z.string().email("Email format is invalid"),
  region: z.enum(["north", "south", "east", "west"]),
  hire_date: z.string().refine(d => {
    const dt = new Date(d);
    return !isNaN(dt) && dt <= new Date();
  }, "hire_date must be ISO date and not in the future"),
});

export async function validateCreateUser(body) {
  const parse = CreateUserSchema.safeParse(body);
  if (!parse.success) {
    return parse.error.issues.map(i => ({ field: i.path.join("."), message: i.message }));
  }
  // check unique email
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return [{ field: "email", message: "Email must be unique" }];
  }
  return null;
}

// Sale schema
export const CreateSaleSchema = z.object({
  user_id: z.number().int().positive(),
  amount: z.number().positive().refine(v => Number.isInteger(Math.round(v * 100)), "Amount must have max 2 decimal places"),
  date: z.string().refine(d => {
    const dt = new Date(d);
    if (isNaN(dt)) return false;
    const futureLimit = new Date(Date.now() + 365*24*60*60*1000);
    return dt <= futureLimit;
  }, "date must be ISO date and not more than 1 year in future"),
  product_category: z.enum(["software", "hardware", "consulting", "support"]),
  commission_rate: z.number().min(0).max(20).optional(),
});

// return array of {field, message} or null
export async function validateCreateSale(body) {
  const parse = CreateSaleSchema.safeParse(body);
  if (!parse.success) {
    return parse.error.issues.map(i => ({ field: i.path.join("."), message: i.message }));
  }
  // check user exists
  const user = await prisma.user.findUnique({ where: { id: body.user_id } });
  if (!user) return [{ field: "user_id", message: "user_id does not exist" }];

  return null;
}
