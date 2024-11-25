import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedUsers = async () => {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("adminadmin", 10); // Ganti dengan password yang aman
    const userPassword = await bcrypt.hash("12341234", 10); // Ganti dengan password yang aman

    // Insert users
    await prisma.user.createMany({
      data: [
        {
          name: "Admin Account",
          email: "admin@admin.com",
          phone: "1234567890",
          password: adminPassword,
          role: "admin",
        },
        {
          name: "User Account",
          email: "user@example.com",
          phone: "0987654321",
          password: userPassword,
          role: "user",
        },
      ],
      skipDuplicates: true,
    });

    console.log("Users seeded successfully!");
  } catch (error) {
    console.error("Error seeding users:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

seedUsers();
