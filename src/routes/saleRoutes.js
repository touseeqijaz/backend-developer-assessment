import express from "express";
import { recordSale, bulkSales } from "../controllers/saleController.js";

const router = express.Router();

router.post("/", recordSale);
router.post("/bulk", bulkSales);

export default router;
