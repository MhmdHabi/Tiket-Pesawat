import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPayment = async (req, res) => {
  try {
    // Fetch all payments from the PaymentPesawat table
    const payments = await prisma.paymentPesawat.findMany({
      include: {
        booking: true, // Include booking data related to the payment
      },
    });

    // Respond with the payment data
    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ message: "Error fetching payments", error });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    // Parse the bookingId as an integer
    const { bookingId, status } = req.body;
    const bookingIdInt = parseInt(bookingId, 10); // Ensure the bookingId is an integer

    // Check if the bookingId is valid
    if (isNaN(bookingIdInt)) {
      return res.status(400).json({
        message: "Invalid bookingId provided. It must be an integer.",
      });
    }

    // Update the payment status using Prisma
    const updatedPayment = await prisma.paymentPesawat.update({
      where: {
        bookingId: bookingIdInt, // Use the parsed integer here
      },
      data: {
        status: status, // Update the status
      },
    });

    // Return the updated payment information
    return res.status(200).json({
      message: "Payment status updated successfully",
      updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      message: "Error updating payment status",
      error: error.message,
    });
  }
};
