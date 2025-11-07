import Router from "express";
import { createDirectBill } from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-bill").post( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), createDirectBill);
export default router;
