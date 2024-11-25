import express from "express";
import { getAllPayment, updatePaymentStatus } from "../controllers/paymentPesawatController.js";
// import { authenticateUser } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.get("/pesawat/payments/index", getAllPayment);
router.put("/pesawat/payments/status", updatePaymentStatus);

export default router;
