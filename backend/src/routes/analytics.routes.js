const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Super Admin - All franchises analytics
router.get(
  "/all-franchises",
  authenticate,
  authorize("SUPER_ADMIN"),
  analyticsController.getAllFranchisesAnalytics
);

// Revenue reports
router.get(
  "/revenue-report",
  authenticate,
  analyticsController.getRevenueReport
);

// Individual franchise analytics
router.get(
  "/:franchiseId",
  authenticate,
  analyticsController.getFranchiseAnalytics
);

module.exports = router;
