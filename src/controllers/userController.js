import prisma from "../config/database.js";

// POST /api/users - Create sales representative
export const createUser = async (req, res) => {
  try {
    const { name, email, region, hire_date } = req.body;
    const user = await prisma.user.create({
      data: { name, email, region, hire_date: new Date(hire_date) },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users - List users with filters
export const listUsers = async (req, res) => {
  try {
    const { region, status } = req.query;
    const filters = {};
    if (region) filters.region = region;
    if (status) filters.status = status;

    const users = await prisma.user.findMany({
      where: filters,
      include: { sales: true, targets: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id/region - Transfer user region
export const transferRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { region } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { region },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
