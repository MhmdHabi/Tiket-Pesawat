// routes/userRoutes.js

import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Rute untuk registrasi pengguna
router.post("/register", register);

// Rute untuk login pengguna
router.post("/login", login);
router.post("/logout", authenticateUser, logout);

export default router;
