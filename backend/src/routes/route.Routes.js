import { Router } from "express";
import { getRoute } from "../controllers/route.controller.js";
import { getAqi } from "../controllers/route.controller.js";
const router=Router();

router.post("/api",getAqi);
router.post("/",getRoute);

export default router;
