import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
const prisma = new PrismaClient();
import { fileURLToPath } from "url"; // Import fileURLToPath from the 'url' module

// Get the current directory of the module using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all Pesawats
export const getPesawats = async (req, res) => {
  try {
    const pesawats = await prisma.pesawat.findMany();
    res.json(pesawats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific Pesawat by ID
export const getPesawatById = async (req, res) => {
  const { id } = req.params;
  try {
    const pesawat = await prisma.pesawat.findUnique({
      where: { id: parseInt(id) },
    });
    if (pesawat) {
      res.json(pesawat);
    } else {
      res.status(404).json({ message: "Pesawat not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new Pesawat
export const createPesawat = async (req, res) => {
  if (!req.files || !req.files.logo) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const name = req.body.airline;
  const file = req.files.logo;
  const fileSize = file.data.length;
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${Date.now()}${ext}`;
  const url = `${fileName}`;
  const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];

  // Validasi tipe file
  if (!allowedTypes.includes(ext)) {
    return res.status(422).json({ message: "Invalid image type" });
  }

  // Validasi ukuran file
  if (fileSize > 5000000) {
    return res.status(422).json({ message: "Image must be less than 5MB" });
  }

  // Tentukan path folder public/images-airlines di frontend
  const frontendImagesPath = path.resolve(__dirname, "../../frontend/public/images-airlines");

  // Pastikan folder images-airlines ada
  if (!fs.existsSync(frontendImagesPath)) {
    fs.mkdirSync(frontendImagesPath, { recursive: true });
  }

  // Pindahkan file gambar ke folder frontend
  file.mv(`${frontendImagesPath}/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading file", error: err.message });
    }

    try {
      // Menyimpan data pesawat ke database
      const pesawat = await prisma.pesawat.create({
        data: {
          airline: name,
          logo: url,
        },
      });

      return res.status(201).json({ message: "Pesawat created successfully", pesawat });
    } catch (error) {
      // Hapus file yang sudah diupload jika terjadi kesalahan di database
      fs.unlinkSync(`${frontendImagesPath}/${fileName}`);
      return res.status(500).json({ message: "Error saving pesawat to database", error: error.message });
    }
  });
};

// Update an existing Pesawat
export const updatePesawat = async (req, res) => {
  const { id } = req.params;

  // Cek apakah ada file logo yang diupload
  const file = req.files ? req.files.logo : null;
  const name = req.body.airline;

  // Validasi file logo jika ada
  let fileName = null;
  let url = null;
  if (file) {
    const fileSize = file.data.length;
    const ext = path.extname(file.name).toLowerCase();
    fileName = `${Date.now()}${ext}`;
    url = `${fileName}`;
    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];

    // Validasi tipe file
    if (!allowedTypes.includes(ext)) {
      return res.status(422).json({ message: "Invalid image type" });
    }

    // Validasi ukuran file
    if (fileSize > 5000000) {
      return res.status(422).json({ message: "Image must be less than 5MB" });
    }
  }

  try {
    // Cari pesawat berdasarkan ID di database
    const pesawat = await prisma.pesawat.findUnique({
      where: { id: parseInt(id) },
    });

    // Jika pesawat tidak ditemukan
    if (!pesawat) {
      return res.status(404).json({ message: "Pesawat not found" });
    }

    // Tentukan jalur untuk mengakses gambar di backend
    const frontendImagesPath = path.resolve(__dirname, "../../frontend/public/images-airlines");

    // Jika ada logo baru, hapus logo lama
    if (file) {
      const oldFilePath = path.join(frontendImagesPath, path.basename(pesawat.logo));
      if (fs.existsSync(oldFilePath)) {
        // Hapus file gambar lama menggunakan unlinkSync
        fs.unlinkSync(oldFilePath);
      }

      // Pastikan folder images-airlines ada
      if (!fs.existsSync(frontendImagesPath)) {
        fs.mkdirSync(frontendImagesPath, { recursive: true });
      }

      // Pindahkan file logo baru ke folder images-airlines
      await file.mv(path.join(frontendImagesPath, fileName));
    } else {
      // Jika tidak ada file logo baru, pertahankan URL logo lama
      url = pesawat.logo;
    }

    // Perbarui record pesawat dengan data baru
    const updatedPesawat = await prisma.pesawat.update({
      where: { id: parseInt(id) },
      data: {
        airline: name,
        logo: url,
      },
    });

    return res.status(200).json({ message: "Pesawat updated successfully", pesawat: updatedPesawat });
  } catch (error) {
    console.error("Error in updatePesawat:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const deletePesawat = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari pesawat berdasarkan ID di database
    const pesawat = await prisma.pesawat.findUnique({
      where: { id: parseInt(id) },
    });

    // Jika pesawat tidak ditemukan
    if (!pesawat) {
      return res.status(404).json({ message: "Pesawat not found" });
    }

    // Tentukan jalur untuk mengakses gambar di backend
    const frontendImagesPath = path.resolve(__dirname, "../../frontend/public/images-airlines");

    // Bangun path file gambar berdasarkan URL yang ada di database
    const filePath = path.join(frontendImagesPath, path.basename(pesawat.logo));
    console.log("Deleting file at:", filePath); // Debugging: Print the path of the file being deleted

    // Cek apakah file gambar ada
    if (fs.existsSync(filePath)) {
      try {
        // Hapus file gambar secara sinkron
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} has been deleted.`);
      } catch (err) {
        console.error("Error during file deletion:", err);
        return res.status(500).json({ message: "Error deleting image", error: err.message });
      }
    } else {
      console.log(`File ${filePath} not found.`); // Debugging: Check if the file exists
      return res.status(404).json({ message: "Image file not found" });
    }

    // Hapus data pesawat dari database
    await prisma.pesawat.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "Pesawat and image deleted successfully" });
  } catch (error) {
    console.error("Error in deletePesawat:", error);
    return res.status(500).json({ message: error.message });
  }
};
