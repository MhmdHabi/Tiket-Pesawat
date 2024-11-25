import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPaymentsHotel = async (req, res) => {
  try {
    // Fetch all payments from the PaymentHotel table
    const payments = await prisma.paymentHotel.findMany({
      include: {
        booking: true, // Include booking data related to the payment
      },
    });

    // Respond with the payment data
    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching hotel payments:", error);
    return res.status(500).json({
      message: "Error fetching hotel payments",
      error: error.message,
    });
  }
};

export const updatePaymentStatusHotel = async (req, res) => {
  try {
    // Extract bookingId and status from the request body
    const { bookingId, status } = req.body;

    // Parse the bookingId as an integer
    const bookingIdInt = parseInt(bookingId, 10);

    // Check if the bookingId is valid
    if (isNaN(bookingIdInt)) {
      return res.status(400).json({
        message: "Invalid bookingId provided. It must be an integer.",
      });
    }

    // Update the payment status in the PaymentHotel table
    const updatedPayment = await prisma.paymentHotel.update({
      where: {
        bookingId: bookingIdInt, // Use the parsed integer
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
    console.error("Error updating hotel payment status:", error);
    return res.status(500).json({
      message: "Error updating hotel payment status",
      error: error.message,
    });
  }
};
