import express from "express";
import {
  addMonitored,
  removeMonitored,
  listMonitored,
  getCurrentAqi,
} from "../controllers/aqi.controller.js";

const router = express.Router();

router.post("/monitor", addMonitored);
router.delete("/monitor", removeMonitored);
router.post("/current", getCurrentAqi);
router.get("/monitored", listMonitored);

export default router;
