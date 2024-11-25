import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllBookingHotel = async (req, res) => {
  try {
    // Fetch all booking hotel records with related user, hotel, and payment data
    const bookings = await prisma.bookingHotel.findMany({
      include: {
        user: true, // Includes the user data
        hotel: true, // Includes the hotel data
        payment: true, // Includes the payment data (if it exists)
      },
    });
    // Send response
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching booking hotels:", error.message);
    return res.status(500).json({ error: "Failed to fetch booking data." });
  }
};

export const getAllBookingHotelUser = async (req, res) => {
  try {
    // Extract userId from the JWT
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch all hotel bookings for the logged-in user
    const bookings = await prisma.bookingHotel.findMany({
      where: {
        userId: userId, // Filters by the logged-in user
      },
      include: {
        user: true, // Include user information
        hotel: true, // Include hotel information
        payment: true, // Include payment details if applicable
      },
    });

    // Respond with the bookings
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    // Extract userId from the JWT and bookingId from the request parameters
    const userId = req.userId;
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Ensure bookingId is parsed as an integer
    const parsedBookingId = parseInt(bookingId, 10);

    if (isNaN(parsedBookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Fetch the booking details for the specific bookingId and userId
    const booking = await prisma.bookingHotel.findFirst({
      where: {
        id: parsedBookingId, // Filters by booking ID
        userId: userId, // Ensures the booking belongs to the logged-in user
      },
      include: {
        user: true, // Include user information
        hotel: true, // Include hotel information
        payment: true, // Include payment details if applicable
      },
    });

    // If no booking is found, return a 404 response
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Respond with the booking details
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    res.status(500).json({ error: error.message });
  }
};
