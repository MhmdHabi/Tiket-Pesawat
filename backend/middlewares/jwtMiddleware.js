import jwt from "jsonwebtoken";

// Middleware untuk otentikasi pengguna menggunakan JWT
export const authenticateUser = (req, res, next) => {
  // Mengambil token dari header Authorization
  const token = req.headers.authorization?.split(" ")[1];

  // Jika token tidak disediakan
  if (!token) {
    return res.status(401).json({ error: "Token tidak disediakan" });
  }

  try {
    // Memverifikasi token menggunakan SECRET_KEY dari environment variable atau fallback default
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "your_default_secret_key" // Fallback untuk kunci rahasia jika tidak ada di .env
    );

    // Menyimpan userId di request untuk digunakan di endpoint selanjutnya
    req.userId = decoded.id;

    // Melanjutkan ke middleware berikutnya
    next();
  } catch (error) {
    // Menangani kesalahan terkait token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token tidak valid" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token telah kedaluwarsa" });
    }

    // Mengirimkan respons 500 jika ada kesalahan lain pada server
    return res.status(500).json({ error: "Kesalahan pada server", details: error.message });
  }
};
