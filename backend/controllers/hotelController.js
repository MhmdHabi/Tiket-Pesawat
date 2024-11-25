import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all hotels
export const getHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany();
    res.json(hotels);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Error retrieving hotels" });
  }
};

// Get hotel by ID
export const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
    });
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.json(hotel);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Error retrieving hotel" });
  }
};

export const createHotel = async (req, res) => {
  // Check if file is uploaded
  if (!req.files || !req.files.image) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { name, location, price, rating } = req.body;

  // Convert the price and rating to numbers (ensure they are valid)
  const floatPrice = parseFloat(price);
  const floatRating = parseFloat(rating);
  if (isNaN(floatPrice)) {
    return res.status(422).json({ message: "Invalid price value" });
  }
  if (isNaN(floatRating) || floatRating < 0 || floatRating > 5) {
    return res.status(422).json({ message: "Invalid rating value. Rating must be between 0 and 5" });
  }

  const file = req.files.image;
  const fileSize = file.data.length;
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${Date.now()}${ext}`;
  const imageUrl = `${fileName}`;

  // Allowed file types
  const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];

  // Validate file type
  if (!allowedTypes.includes(ext)) {
    return res.status(422).json({ message: "Invalid image type. Allowed types: .png, .jpg, .jpeg, .gif" });
  }

  // Validate file size (max 5MB)
  if (fileSize > 5000000) {
    return res.status(422).json({ message: "Image must be less than 5MB" });
  }

  // Define the folder path for saving the image
  const imagesPath = path.resolve(__dirname, "../../frontend/public/images-hotels");

  // Ensure the directory exists
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }

  // Move the file to the images-hotels folder
  file.mv(`${imagesPath}/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading file", error: err.message });
    }

    try {
      // Save hotel data to the database
      const newHotel = await prisma.hotel.create({
        data: {
          name,
          location,
          price: floatPrice,
          rating: floatRating, // Store the rating value
          image: imageUrl,
        },
      });

      return res.status(201).json({
        message: "Hotel created successfully",
        hotel: newHotel,
      });
    } catch (error) {
      fs.unlinkSync(`${imagesPath}/${fileName}`);
      return res.status(500).json({ message: "Error saving hotel to the database", error: error.message });
    }
  });
};

// Update hotel
export const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, location, price, rating } = req.body;

  // Convert price and rating to numbers
  const floatPrice = parseFloat(price);
  const floatRating = parseFloat(rating);
  if (isNaN(floatPrice)) {
    return res.status(422).json({ message: "Invalid price value" });
  }
  if (isNaN(floatRating) || floatRating < 0 || floatRating > 5) {
    return res.status(422).json({ message: "Invalid rating value. Rating must be between 0 and 5" });
  }

  let imageUrl = null;
  if (req.files && req.files.image) {
    const file = req.files.image;
    const fileSize = file.data.length;
    const ext = path.extname(file.name).toLowerCase();
    const fileName = `${Date.now()}${ext}`;
    imageUrl = `${fileName}`;

    const allowedTypes = [".png", ".jpg", ".jpeg", ".gif"];
    if (!allowedTypes.includes(ext)) {
      return res.status(422).json({ message: "Invalid image type. Allowed types: .png, .jpg, .jpeg, .gif" });
    }

    if (fileSize > 5000000) {
      return res.status(422).json({ message: "Image must be less than 5MB" });
    }

    const imagesPath = path.resolve(__dirname, "../../frontend/public/images-hotels");

    if (!fs.existsSync(imagesPath)) {
      fs.mkdirSync(imagesPath, { recursive: true });
    }

    file.mv(`${imagesPath}/${fileName}`, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading file", error: err.message });
      }

      try {
        const hotel = await prisma.hotel.findUnique({ where: { id: parseInt(id) } });
        if (!hotel) {
          return res.status(404).json({ message: "Hotel not found" });
        }

        if (hotel.image) {
          const oldImagePath = path.join(imagesPath, path.basename(hotel.image));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        const updatedHotel = await prisma.hotel.update({
          where: { id: parseInt(id) },
          data: {
            name,
            location,
            price: floatPrice,
            rating: floatRating,
            image: imageUrl,
          },
        });

        return res.status(200).json({
          message: "Hotel updated successfully",
          hotel: updatedHotel,
        });
      } catch (error) {
        return res.status(500).json({ message: "Error updating hotel", error: error.message });
      }
    });
  } else {
    try {
      const updatedHotel = await prisma.hotel.update({
        where: { id: parseInt(id) },
        data: {
          name,
          location,
          price: floatPrice,
          rating: floatRating,
        },
      });

      return res.status(200).json({
        message: "Hotel updated successfully",
        hotel: updatedHotel,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error updating hotel", error: error.message });
    }
  }
};

// Delete hotel
export const deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the hotel to delete
    const hotel = await prisma.hotel.findUnique({ where: { id: parseInt(id) } });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Check if the hotel has an image and delete the image file
    if (hotel.image) {
      const imagesPath = path.resolve(__dirname, "../../frontend/public/images-hotels");
      const imagePath = path.join(imagesPath, hotel.image); // Get the full path to the image

      // Delete the image file from the server
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remove image from the server
      }
    }

    // Delete the hotel record from the database
    await prisma.hotel.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting hotel", error: error.message });
  }
};
