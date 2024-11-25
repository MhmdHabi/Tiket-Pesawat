import express from "express";
import { getAllPaymentsHotel, updatePaymentStatusHotel } from "../controllers/paymentHotelController.js";

const router = express.Router();

router.get("/hotel/payments/index", getAllPaymentsHotel);
router.put("/hotel/payments/status", updatePaymentStatusHotel);

export default router;
