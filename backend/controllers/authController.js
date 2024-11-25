import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

// Fungsi untuk registrasi pengguna
export const register = async (req, res) => {
  // Destrukturisasi name, email, phone, dan password dari body permintaan
  const { name, email, phone, password } = req.body;

  try {
    // Memeriksa apakah email sudah ada di database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Jika email sudah terdaftar, kirimkan respons 400 (permintaan tidak valid)
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Mengenkripsi password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat pengguna baru di database
    const newUser = await prisma.user.create({
      data: {
        name, // Nama pengguna
        email, // Email pengguna
        phone, // Nomor telepon pengguna
        password: hashedPassword, // Password yang telah dienkripsi
        role: "user", // Peran default pengguna, jika diperlukan
      },
    });

    // Mengirimkan respons sukses dengan data pengguna yang baru dibuat
    res.status(201).json({
      message: "Pengguna berhasil terdaftar",
      user: {
        id: newUser.id, // ID pengguna
        name: newUser.name, // Nama pengguna
        email: newUser.email, // Email pengguna
        phone: newUser.phone, // Nomor telepon pengguna
        role: newUser.role, // Peran pengguna
      },
    });
  } catch (error) {
    // Menangkap dan mencatat kesalahan jika terjadi masalah
    console.error(error);
    // Mengirimkan respons 500 (kesalahan server internal)
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const login = async (req, res) => {
  // Destrukturisasi email, password, dan role dari body permintaan
  const { email, password, role } = req.body;

  try {
    // Mencari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Jika pengguna tidak ditemukan, kirimkan respons 404 (tidak ditemukan)
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    // Memeriksa apakah password yang dimasukkan valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Jika password tidak valid, kirimkan respons 401 (tidak terotorisasi)
      return res.status(401).json({ message: "Kredensial tidak valid" });
    }

    // Memvalidasi role (opsional, jika validasi role diperlukan)
    if (role && user.role !== role) {
      // Jika role tidak sesuai, kirimkan respons 403 (dilarang)
      return res.status(403).json({ message: "Role tidak sesuai" });
    }

    // Membuat token JWT dengan data id, email, dan role pengguna
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY, // Ganti dengan kunci rahasia Anda
      { expiresIn: "30d" }
    );

    // Mengirimkan respons dengan token dan role pengguna
    res.status(200).json({
      message: "Login berhasil",
      token,
      role: user.role, // Role digunakan di frontend untuk menentukan arah navigasi
    });
  } catch (error) {
    // Menangkap dan mencatat kesalahan jika terjadi masalah
    console.error(error);
    // Mengirimkan respons 500 (kesalahan server internal)
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const logout = (req, res) => {
  try {
    // Menggunakan userId yang telah diambil
    const userId = req.userId;

    // Mengirimkan respons sukses logout
    res.status(200).json({ message: "Logout berhasil", userId });
  } catch (error) {
    // Menangkap dan mencatat kesalahan jika terjadi masalah
    console.error(error);
    // Mengirimkan respons 500 (kesalahan server internal)
    res.status(500).json({ message: "Terjadi kesalahan pada server saat logout" });
  }
};
