import express from "express";

import { getHotels, createHotel, updateHotel, deleteHotel, getHotelById } from "../controllers/hotelController.js";

const router = express.Router();

// Route untuk mendapatkan daftar hotel
router.get("/hotel", getHotels);

// Route untuk mendapatkan hotel berdasarkan ID
router.get("/hotel/:id", getHotelById);

// Route untuk menambahkan hotel baru
router.post("/hotel/add", createHotel);

// Route untuk mengupdate data hotel berdasarkan ID
router.put("/hotel/:id", updateHotel);

// Route untuk menghapus hotel berdasarkan ID
router.delete("/hotel/:id", deleteHotel);

export default router;
