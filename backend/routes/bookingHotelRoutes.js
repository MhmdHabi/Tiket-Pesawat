import express from "express";
import { authenticateUser } from "../middlewares/jwtMiddleware.js";
import { getAllBookingHotel, getAllBookingHotelUser, getBookingById } from "../controllers/bookingHotelController.js";

const router = express.Router();

router.get("/hotel/booking/index/admin", getAllBookingHotel);

router.get("/hotel/booking/index", authenticateUser, getAllBookingHotelUser);

router.get("/hotel/booking/:bookingId", authenticateUser, getBookingById);

export default router;
