import bcrypt from "bcrypt";
import path from "path"; // Import the path module
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk menambahkan pengguna baru
export const createUser = async (req, res) => {
  const { name, email, phone, password, role = "user" } = req.body; // Menambahkan role dengan default "user"

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role, // Menambahkan role
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk mendapatkan semua pengguna
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bookingsPesawat: true, // Menambahkan relasi dengan BookingPesawat
        bookingsHotel: true, // Menambahkan relasi dengan BookingHotel
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk mendapatkan pengguna berdasarkan ID
export const getUserById = async (req, res) => {
  try {
    // Menggunakan userId yang telah disimpan oleh middleware authenticateUser
    const userId = req.userId;

    // Validasi jika userId tidak ada
    if (!userId) {
      return res.status(400).json({ error: "User ID tidak ditemukan" });
    }

    // Query pengguna berdasarkan ID dengan relasi dengan bookingsPesawat dan bookingsHotel
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        bookingsPesawat: true, // Relasi dengan BookingPesawat
        bookingsHotel: true, // Relasi dengan BookingHotel
      },
    });

    // Jika pengguna tidak ditemukan
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Kirim data pengguna
    res.status(200).json(user);
  } catch (error) {
    // Menangani kesalahan lain pada server
    console.error(error); // Untuk keperluan debugging
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ error: "Kesalahan pada kueri database" });
    }

    // Mengirimkan respons kesalahan internal server jika tidak ada penanganan khusus
    res.status(500).json({ error: "Terjadi kesalahan pada server", details: error.message });
  }
};

// Fungsi untuk memperbarui pengguna berdasarkan ID
export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password, role } = req.body;

  try {
    // Prepare the update data object
    let updateData = {};

    // Only include fields that are provided
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (password) {
      // If password is provided, hash it and include it in the update data
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) updateData.role = role;

    // Update the user in the database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Return the success response
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    // Return the error response
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.userId; // Get userId from authenticateUser middleware
  const { name, email, phone, gender, role, birthday, country, password } = req.body;

  try {
    let imagePath = null;

    // Check if a file is uploaded
    const file = req.files ? req.files.image : null;

    // Validate and process the image
    if (file) {
      const fileSize = file.data.length;
      const ext = path.extname(file.name).toLowerCase();
      const fileName = `${Date.now()}${ext}`;
      const url = `${fileName}`;
      const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];
      const frontendImagesPath = path.resolve(__dirname, "../../frontend/public/images-users");

      // Validate file type
      if (!allowedTypes.includes(ext)) {
        return res.status(422).json({ message: "Invalid image type" });
      }

      // Validate file size
      if (fileSize > 5000000) {
        return res.status(422).json({ message: "Image must be less than 5MB" });
      }

      // Ensure the target folder exists
      if (!fs.existsSync(frontendImagesPath)) {
        fs.mkdirSync(frontendImagesPath, { recursive: true });
      }

      // Check if an old image exists in the database and delete it
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && user.image) {
        const oldImagePath = path.join(frontendImagesPath, path.basename(user.image));
        console.log("Checking if old image exists:", oldImagePath); // Log old image path
        if (fs.existsSync(oldImagePath)) {
          console.log("Deleting old image:", oldImagePath); // Log image being deleted
          fs.unlinkSync(oldImagePath); // Delete old image
        }
      }

      // Save the new file to the folder
      imagePath = `${url}`;
      const filePath = path.join(frontendImagesPath, url);
      await file.mv(filePath); // Move file to folder
    }

    // Prepare the updated data object
    let updatedData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(gender && { gender }),
      ...(birthday && { birthday: new Date(birthday) }),
      ...(country && { country }),
      ...(role && { role }),
      ...(imagePath && { image: imagePath }), // Update image if available
    };

    // Check if password needs to be updated
    if (password) {
      // Hash the new password before updating
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword; // Add hashed password to update data
    }

    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    // Return success response
    return res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk menghapus pengguna berdasarkan ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
