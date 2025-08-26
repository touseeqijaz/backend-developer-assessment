import prisma from "../config/database.js";
// POST /api/sales - Record a sale
export const recordSale = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const sale = await prisma.sale.create({
      data: { userId: Number(userId), amount },
    });
    res.json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/sales/bulk - Import multiple sales
export const bulkSales = async (req, res) => {
  try {
    const { sales } = req.body; // array of { userId, amount }
    const created = await prisma.sale.createMany({
      data: sales.map(s => ({ userId: Number(s.userId), amount: s.amount })),
    });
    res.json({ count: created.count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
