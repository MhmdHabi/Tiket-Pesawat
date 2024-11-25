import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllBookingsPesawat = async (req, res) => {
  try {
    const bookings = await prisma.bookingPesawat.findMany({
      include: {
        user: true,
        jadwal: true,
        payment: true,
      },
    });

    // Respond with the booking data along with payment information
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllBookingsPesawatByUser = async (req, res) => {
  try {
    // Extract userId from the JWT
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch bookings specific to the user, including related pesawat data
    const bookings = await prisma.bookingPesawat.findMany({
      where: {
        userId: userId, // Filter by userId
      },
      include: {
        user: true,
        jadwal: {
          include: {
            pesawat: true, // Include pesawat data from the jadwal
          },
        },
        payment: true,
      },
    });

    // Respond with the booking data, including pesawat information
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a flight booking by ID
export const getBookingPesawatById = async (req, res) => {
  try {
    // Ekstrak userId dari JWT dan bookingId dari parameter permintaan
    const userId = req.userId; // Assume this is extracted from JWT
    const { bookingId } = req.params; // Booking ID from the request

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Pastikan bookingId berupa integer
    const parsedBookingId = parseInt(bookingId, 10);

    if (isNaN(parsedBookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Ambil detail booking berdasarkan bookingId dan userId
    const booking = await prisma.bookingPesawat.findFirst({
      where: {
        id: parsedBookingId, // Filter berdasarkan ID booking
        userId: userId, // Pastikan booking milik user yang login
      },
      include: {
        user: true, // Sertakan informasi user
        payment: true, // Sertakan detail pembayaran jika ada
        jadwal: {
          include: {
            pesawat: true, // Sertakan informasi pesawat dari jadwal
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ambil informasi dari jadwal dan pesawat
    const jadwal = booking.jadwal;
    const pesawat = jadwal ? jadwal.pesawat : null;

    // Responkan data booking, termasuk pesawat dari jadwal
    return res.status(200).json({
      id: booking.id,
      name: booking.name,
      gender: booking.gender,
      country: booking.country,
      birthday: booking.birthday,
      totalPrice: booking.totalPrice,
      bookingDate: booking.bookingDate,
      user: booking.user,
      payment: booking.payment,
      jadwal: {
        id: jadwal.id,
        flightDate: jadwal.flightDate,
        departureTime: jadwal.departureTime,
        arrivalTime: jadwal.arrivalTime,
        destination: jadwal.destination,
        origin: jadwal.origin,
        class: jadwal.class,
        price: jadwal.price,
        pesawatId: jadwal.pesawatId,
        pesawat: pesawat, // Menyertakan data pesawat dari jadwal
      },
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a flight booking
export const updateBookingPesawat = async (req, res) => {
  const { id } = req.params;
  const { seats, jadwalId } = req.body;

  try {
    const updatedBooking = await prisma.bookingPesawat.update({
      where: { id: parseInt(id) },
      data: {
        seats,
        jadwalId,
      },
    });

    return res.status(200).json({
      message: "Booking updated successfully.",
      updatedBooking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update booking." });
  }
};

// Delete a flight booking
export const deleteBookingPesawat = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBooking = await prisma.bookingPesawat.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      message: "Booking deleted successfully.",
      deletedBooking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete booking." });
  }
};

export const bookFlight = async (req, res) => {
  try {
    const { jadwalId, name, gender, country, birthday, bank } = req.body;
    const userId = req.userId; // Assuming the user ID is extracted from JWT
    const file = req.files?.file; // Extract the file from req.files

    // Validate receipt image existence
    if (!file) {
      return res.status(400).json({ message: "Receipt image is required" });
    }

    // Validate the flight schedule
    const jadwal = await prisma.jadwalPenerbangan.findUnique({
      where: { id: parseInt(jadwalId, 10) },
    });

    if (!jadwal) {
      return res.status(404).json({ message: "Flight schedule not found" });
    }

    const totalPrice = jadwal.price; // Total price based on the schedule

    // Validate and save the receipt image
    const ext = path.extname(file.name).toLowerCase();
    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];
    if (!allowedTypes.includes(ext)) {
      return res.status(422).json({ message: "Invalid receipt image type" });
    }

    if (file.data.length > 5000000) {
      return res.status(422).json({ message: "Receipt must be less than 5MB" });
    }

    const receiptFileName = `${Date.now()}${ext}`;
    const imageDir = path.resolve(__dirname, "../../frontend/public/images-payment-airlines");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    fs.writeFileSync(path.join(imageDir, receiptFileName), file.data);

    // Create booking
    const booking = await prisma.bookingPesawat.create({
      data: {
        userId,
        jadwalId: parseInt(jadwalId, 10),
        name,
        gender,
        country,
        birthday: new Date(birthday),
        totalPrice,
      },
    });

    // Create payment
    const payment = await prisma.paymentPesawat.create({
      data: {
        bookingId: booking.id,
        receipt: receiptFileName,
        bank,
      },
    });

    return res.status(201).json({
      message: "Booking and payment successfully created",
      booking,
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
