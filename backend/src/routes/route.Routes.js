import { Router } from "express";
import { getRoute } from "../controllers/route.controller.js";

const router=Router();

router.post("/getRoute",getRoute);

export default router;
