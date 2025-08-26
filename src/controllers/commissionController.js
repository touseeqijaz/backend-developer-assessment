import { calculateCommission } from "../services/saleService.js";
import prisma from "../config/database.js";

// GET /api/commission/:userId/:month/:year
export const getCommission = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    const result = await calculateCommission(Number(userId), Number(month), Number(year));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/sales/bulk
export const bulkSales = async (req, res) => {
  try {
    const { sales } = req.body;
    const results = [];
    const errors = [];

    for (const s of sales) {
      if (s.amount <= 0) {
        errors.push({ record: s, error: "Invalid amount" });
        continue;
      }
      const user = await prisma.user.findUnique({ where: { id: s.userId } });
      if (!user) {
        errors.push({ record: s, error: "User not found" });
        continue;
      }
      if (!s.date || new Date(s.date) > new Date("2025-12-31")) {
        errors.push({ record: s, error: "Invalid date" });
        continue;
      }

      const sale = await prisma.sale.create({
        data: {
          userId: s.userId,
          amount: s.amount,
          createdAt: new Date(s.date)
        }
      });
      results.push(sale);
    }

    res.json({ inserted: results.length, errors });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
