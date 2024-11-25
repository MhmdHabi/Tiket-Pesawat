import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all flight schedules
export const getAllJadwalPenerbangan = async (req, res) => {
  try {
    const jadwalPenerbangan = await prisma.jadwalPenerbangan.findMany({
      include: {
        pesawat: true, // Include pesawat information
      },
    });
    res.status(200).json(jadwalPenerbangan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get flight schedule by ID
export const getJadwalPenerbanganById = async (req, res) => {
  const { id } = req.params;
  try {
    const jadwalPenerbangan = await prisma.jadwalPenerbangan.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        pesawat: true, // Include pesawat information
      },
    });
    if (!jadwalPenerbangan) {
      return res.status(404).json({ message: "Flight schedule not found" });
    }
    res.status(200).json(jadwalPenerbangan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createJadwalPenerbangan = async (req, res) => {
  try {
    // Pastikan req.body memiliki semua field yang diperlukan
    const { pesawatId, flightDate, departureTime, arrivalTime, destination, origin, class: flightClass, price } = req.body;

    // Validasi input
    if (!pesawatId || !flightDate || !departureTime || !arrivalTime || !destination || !origin || !flightClass || !price) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validasi dan parsing tanggal
    const parsedFlightDate = new Date(flightDate);

    if (isNaN(parsedFlightDate)) {
      return res.status(400).json({ error: "Invalid date or time format." });
    }

    // Membuat jadwal penerbangan baru
    const newJadwalPenerbangan = await prisma.jadwalPenerbangan.create({
      data: {
        pesawatId: parseInt(pesawatId, 10), // Konversi ke integer jika diperlukan
        flightDate: parsedFlightDate,
        departureTime,
        arrivalTime,
        destination,
        origin,
        class: flightClass,
        price: parseFloat(price),
      },
    });

    res.status(201).json(newJadwalPenerbangan);
  } catch (error) {
    console.error("Error creating flight schedule:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing flight schedule
export const updateJadwalPenerbangan = async (req, res) => {
  const { id } = req.params;
  const { pesawatId, flightDate, departureTime, arrivalTime, destination, origin, class: flightClass, price } = req.body;

  try {
    // Pastikan req.body memiliki semua field yang diperlukan
    if (!pesawatId || !flightDate || !departureTime || !arrivalTime || !destination || !origin || !flightClass || !price) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validasi dan parsing tanggal
    const parsedFlightDate = new Date(flightDate);

    if (isNaN(parsedFlightDate)) {
      return res.status(400).json({ error: "Invalid date or time format." });
    }

    // Update jadwal penerbangan yang ada
    const updatedJadwalPenerbangan = await prisma.jadwalPenerbangan.update({
      where: {
        id: parseInt(id), // Pastikan id dalam bentuk integer
      },
      data: {
        pesawatId: parseInt(pesawatId, 10), // Konversi ke integer jika diperlukan
        flightDate: parsedFlightDate,
        departureTime,
        arrivalTime,
        destination,
        origin,
        class: flightClass,
        price: parseFloat(price), // Pastikan harga dalam bentuk float
      },
    });

    res.status(200).json(updatedJadwalPenerbangan);
  } catch (error) {
    console.error("Error updating flight schedule:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a flight schedule by ID
export const deleteJadwalPenerbangan = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedJadwalPenerbangan = await prisma.jadwalPenerbangan.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Flight schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchJadwalPenerbangan = async (req, res) => {
  try {
    const { origin, destination, flightDate, class: flightClass } = req.query;

    // Create filter for the search query
    const searchFilters = {};

    // Filter by origin
    if (origin) {
      searchFilters.origin = { contains: origin, mode: "insensitive" };
    }

    // Filter by destination
    if (destination) {
      searchFilters.destination = { contains: destination, mode: "insensitive" };
    }

    // Filter by flight date
    if (flightDate) {
      const parsedDate = new Date(flightDate);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ error: "Invalid date format." });
      }
      searchFilters.flightDate = {
        gte: parsedDate,
        lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
      };
    }

    // Filter by class
    if (flightClass) {
      searchFilters.class = { contains: flightClass, mode: "insensitive" };
    }

    // Searching for flight schedules with the filters
    const jadwalPenerbangan = await prisma.jadwalPenerbangan.findMany({
      where: searchFilters,
      include: {
        pesawat: true, // Include pesawat details if necessary
      },
    });

    if (jadwalPenerbangan.length === 0) {
      return res.status(404).json({ message: "No flights found." });
    }

    res.status(200).json(jadwalPenerbangan);
  } catch (error) {
    console.error("Error searching for flight schedules:", error);
    res.status(500).json({ error: error.message });
  }
};
