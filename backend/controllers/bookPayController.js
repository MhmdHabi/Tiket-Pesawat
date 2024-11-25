import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath

const prisma = new PrismaClient();

export const bookFlight = async (req, res) => {
  try {
    // Validasi apakah file diterima
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, gender, country, birthday, bank, jadwalId } = req.body;
    const userId = req.userId; // Assuming the user ID is extracted from JWT
    const file = req.files.receipt; // Extract the file from req.files
    const fileSize = file.data.length;
    const ext = path.extname(file.name).toLowerCase();
    const fileName = `${Date.now()}${ext}`;
    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];

    // Validasi tipe file
    if (!allowedTypes.includes(ext)) {
      return res.status(422).json({ message: "Invalid image type" });
    }

    // Validasi ukuran file
    if (fileSize > 5000000) {
      return res.status(422).json({ message: "Image must be less than 5MB" });
    }

    // Menggunakan fileURLToPath untuk memastikan path yang benar
    const __filename = fileURLToPath(import.meta.url); // Mendapatkan path file saat ini
    const __dirname = path.dirname(__filename); // Mendapatkan direktori dari file saat ini
    const imageDir = path.resolve(__dirname, "../../frontend/public/images-payment-airlines");

    // Pastikan folder images-payment-airlines ada
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Pindahkan file gambar ke folder frontend
    file.mv(`${imageDir}/${fileName}`, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading file", error: err.message });
      }

      // Validasi jadwal penerbangan
      const jadwal = await prisma.jadwalPenerbangan.findUnique({
        where: { id: parseInt(jadwalId, 10) },
      });

      if (!jadwal) {
        return res.status(404).json({ message: "Flight schedule not found" });
      }

      const totalPrice = jadwal.price; // Total price based on the schedule

      // Create booking
      const booking = await prisma.bookingPesawat.create({
        data: {
          userId,
          jadwalId: parseInt(jadwalId),
          name,
          gender,
          country,
          birthday: new Date(birthday),
          totalPrice: totalPrice,
        },
      });

      // Create payment
      const payment = await prisma.paymentPesawat.create({
        data: {
          bookingId: booking.id,
          receipt: fileName, // Menyimpan nama file receipt
          bank,
        },
      });

      return res.status(201).json({
        message: "Booking and payment successfully created",
        booking,
        payment,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const bookHotel = async (req, res) => {
  try {
    // Validasi apakah file diterima
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { checkInDate, checkOutDate, rooms, hotelId, bank, totalPrice } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // Assuming the JWT is passed in Authorization header as Bearer token

    // Convert totalPrice to Float if it's provided as a string
    const formattedTotalPrice = parseFloat(totalPrice);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Decode JWT to extract userId
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Fetch user details using userId from the database (Optional)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const file = req.files.receipt; // Extract the file from req.files
    const fileSize = file.data.length;
    const ext = path.extname(file.name).toLowerCase();
    const fileName = `${Date.now()}${ext}`;
    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];

    // Validasi tipe file
    if (!allowedTypes.includes(ext)) {
      return res.status(422).json({ message: "Invalid image type" });
    }

    // Validasi ukuran file
    if (fileSize > 5000000) {
      return res.status(422).json({ message: "Image must be less than 5MB" });
    }

    // Menggunakan fileURLToPath untuk memastikan path yang benar
    const __filename = fileURLToPath(import.meta.url); // Mendapatkan path file saat ini
    const __dirname = path.dirname(__filename); // Mendapatkan direktori dari file saat ini
    const imageDir = path.resolve(__dirname, "../../frontend/public/images-payment-hotels");

    // Pastikan folder images-payment-hotels ada
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Pindahkan file gambar ke folder frontend
    file.mv(`${imageDir}/${fileName}`, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading file", error: err.message });
      }

      // Validasi hotel
      const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId, 10) },
      });

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      // Total price based on the hotel price

      // Create booking
      const booking = await prisma.bookingHotel.create({
        data: {
          userId,
          hotelId: parseInt(hotelId),
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          rooms,
          totalPrice: formattedTotalPrice,
        },
      });

      // Create payment
      const payment = await prisma.paymentHotel.create({
        data: {
          bookingId: booking.id,
          receipt: fileName, // Menyimpan nama file receipt
          bank,
        },
      });

      return res.status(201).json({
        message: "Hotel booking and payment successfully created",
        booking,
        payment,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
