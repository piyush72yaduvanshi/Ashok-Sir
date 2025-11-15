import Router from "express";
import { createDirectBill, updateBill, deleteBill, getAllBills, getBillById, getBillByNumber} from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-bill").post( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), createDirectBill);
router.route("/update-bill/:id").put( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), updateBill);
router.route("/delete-bill/:id").delete( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), deleteBill);
router.route("/all-bills").get( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), getAllBills);
router.route("/bill/:id").get( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), getBillById);
router.route("/pdf").post( authenticate, authorize("SUPER_ADMIN", "FRANCHISE_ADMIN"), getBillByNumber);
export default router;
