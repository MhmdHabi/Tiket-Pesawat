// routes/bookingPesawatRoutes.js
import express from "express";
import { authenticateUser } from "../middlewares/jwtMiddleware.js";
import { bookFlight, bookHotel } from "../controllers/bookPayController.js";

const router = express.Router();

router.post("/pesawat/book/flight/create", authenticateUser, bookFlight);

router.post("/hotel/book/hotel/create", authenticateUser, bookHotel);

export default router;
