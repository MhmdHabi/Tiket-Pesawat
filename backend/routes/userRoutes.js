import express from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser, updateUserByAdmin } from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Route untuk membuat pengguna baru
router.post("/users/add", createUser);

// Route untuk mendapatkan semua pengguna
router.get("/users", getUsers);

// Route untuk mendapatkan pengguna berdasarkan ID
router.get("/users/profile", authenticateUser, getUserById);

// Route untuk memperbarui pengguna berdasarkan ID
router.put("/users/update", authenticateUser, updateUser);

router.put("/users/:id", updateUserByAdmin);

// Route untuk menghapus pengguna berdasarkan ID
router.delete("/users/:id", deleteUser);

export default router;
