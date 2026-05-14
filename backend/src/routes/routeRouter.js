import { Router } from "express";
import { getLocData } from "../services/routeService";

const router=Router();

router.post("/api",getLocData);

export default router;
