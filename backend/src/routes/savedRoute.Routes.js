import { Router } from "express";
import { saveRoute, getRoutes, deleteRoute } from "../controllers/savedRoute.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/save",verifyJWT, saveRoute);
router.get("/",verifyJWT, getRoutes);

router.delete("/:id",verifyJWT, deleteRoute);

export default router;
