import express from "express";
import { createUser, listUsers, transferRegion } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", listUsers);
router.put("/:id/region", transferRegion);

export default router;
