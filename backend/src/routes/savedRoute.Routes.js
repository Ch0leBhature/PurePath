import { Router } from "express";
import { saveRoute, getRoutes, deleteRoute } from "../controllers/savedRoute.controller.js";

const router = Router();

router.post("/save", saveRoute);
router.get("/", getRoutes);
router.delete("/:id", deleteRoute);

export default router;
