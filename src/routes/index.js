import express from "express";
import userRoutes from "./userRoutes.js";
import saleRoutes from "./saleRoutes.js";
import commissionRoutes from "./commissionRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/sales", saleRoutes);
router.use("/commission", commissionRoutes);

export default router;
