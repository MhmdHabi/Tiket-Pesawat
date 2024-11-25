// routes/bookingPesawatRoutes.js
import express from "express";
import { authenticateUser } from "../middlewares/jwtMiddleware.js";
import { getAllBookingsPesawat, getBookingPesawatById, updateBookingPesawat, deleteBookingPesawat, getAllBookingsPesawatByUser } from "../controllers/bookingPesawatController.js";

const router = express.Router();

// Route untuk membuat pemesanan pesawat
// router.post("/pesawat/booking/add", authenticateUser, createBookingPesawat);

// Route untuk mendapatkan semua pemesanan pesawat
router.get("/pesawat/bookings/index", getAllBookingsPesawat);

// Route untuk mendapatkan semua pemesanan pesawat byuser
router.get("/pesawat/bookings/index/user", authenticateUser, getAllBookingsPesawatByUser);

// Route untuk mendapatkan pemesanan pesawat berdasarkan ID
router.get("/pesawat/booking/:bookingId", authenticateUser, getBookingPesawatById);

// Route untuk mengupdate pemesanan pesawat berdasarkan ID
router.put("/pesawat/booking/update/:id", updateBookingPesawat);

// Route untuk menghapus pemesanan pesawat berdasarkan ID
router.delete("/pesawat/booking/:id", deleteBookingPesawat);

// router.post("/pesawat/book/flight", authenticateUser, bookFlight);

export default router;
