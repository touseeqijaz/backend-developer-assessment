import express from "express";
import { getCommission } from "../controllers/commissionController.js";

const router = express.Router();

router.get("/:userId/:month/:year", getCommission);

export default router;
