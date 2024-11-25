import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import pesawatRoutes from "./routes/pesawatRoutes.js";
import bookingPesawatRoutes from "./routes/bookingPesawatRoutes.js";
import jadwalPenerbanganRoutes from "./routes/jadwalPenerbanganRoutes.js";
import paymentPesawatRoutes from "./routes/paymentPesawatRoutes.js";
import bookPayRoutes from "./routes/bookPayRoutes.js";
import bookingHotelRoutes from "./routes/bookingHotelRoutes.js";
import paymentHotelRoutes from "./routes/paymentHotelRoutes.js";

dotenv.config(); // Konfigurasi dotenv untuk menggunakan variabel dari .env

const app = express();

// Atur CORS untuk mengizinkan permintaan hanya dari origin tertentu
const corsOptions = {
  origin: "http://localhost:5173", // Ganti dengan URL aplikasi frontend Anda
  methods: ["GET", "POST", "PUT", "DELETE"], // Tentukan metode yang diizinkan
  allowedHeaders: ["Content-Type", "Authorization"], // Tentukan header yang diizinkan
  credentials: true, // Jika Anda ingin mengirimkan cookie
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload());

// Routes
app.use(userRoutes);
app.use(authRoutes);
app.use(hotelRoutes);
app.use(pesawatRoutes);
app.use(jadwalPenerbanganRoutes);
app.use(bookingPesawatRoutes);
app.use(paymentPesawatRoutes);
app.use(bookPayRoutes);
app.use(bookingHotelRoutes);
app.use(paymentHotelRoutes);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server running on port ${process.env.APP_PORT}`);
});
