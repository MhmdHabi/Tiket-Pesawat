import express from "express";

import { getPesawats, getPesawatById, createPesawat, updatePesawat, deletePesawat } from "../controllers/pesawatController.js";

const router = express.Router();

// Route untuk mendapatkan daftar pesawat
router.get("/pesawat", getPesawats);

// Route untuk mendapatkan pesawat berdasarkan ID
router.get("/pesawat/:id", getPesawatById);

// Route untuk menambahkan pesawat baru
router.post("/pesawat/add", createPesawat);

// Route untuk mengupdate data pesawat berdasarkan ID
router.put("/pesawat/update/:id", updatePesawat);

// Route untuk menghapus pesawat berdasarkan ID
router.delete("/pesawat/:id", deletePesawat);

export default router;
