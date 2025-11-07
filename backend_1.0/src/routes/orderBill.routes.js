import Router from "express";
import { createDirectBill, updateBill, deleteBill } from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-bill").post( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), createDirectBill);
router.route("/update-bill").put( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), updateBill);
router.route("/delete-bill").delete( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), deleteBill);
export default router;
