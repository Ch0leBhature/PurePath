import { Router } from "express";
import { getRoute } from "../controllers/route.controller.js";
import { getAqi } from "../controllers/route.controller.js";
import apiLimiter from "../middleware/rateLimiter.js";
import { routeAnalyzeSchema, validateBody } from "../middleware/validate.js";
const router=Router();

router.post("/api", apiLimiter, validateBody(routeAnalyzeSchema), getAqi);
router.post("/", apiLimiter, validateBody(routeAnalyzeSchema), getRoute);

export default router;
