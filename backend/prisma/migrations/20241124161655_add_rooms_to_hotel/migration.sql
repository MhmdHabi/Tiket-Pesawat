/*
  Warnings:

  - Added the required column `rooms` to the `BookingHotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookinghotel` ADD COLUMN `rooms` VARCHAR(191) NOT NULL;
