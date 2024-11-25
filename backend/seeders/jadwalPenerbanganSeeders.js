import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateRandomDate = (baseDate, daysInFuture) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysInFuture);
  return date;
};

const generateRandomTime = () => {
  const hours = String(Math.floor(Math.random() * 24)).padStart(2, "0");
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Update generateRandomPrice to return integer values in the range of 700,000 - 1,000,000
const generateRandomPrice = () => {
  return Math.floor(Math.random() * 300000 + 700000); // Random price between 700,000 and 1,000,000
};

const generateRandomFlightData = (date) => {
  const origins = [
    "Jakarta",
    "Surabaya",
    "Bali",
    "Medan",
    "Yogyakarta",
    "Bandung",
    "Malang",
    "Makassar",
    "Lombok",
    "Palembang",
    "Balikpapan",
    "Pontianak",
    "Semarang",
    "Makassar",
    "Solo",
    "Denpasar",
    "Batam",
    "Aceh",
    "Tangerang",
    "Manado",
    "Ambon",
    "Kupang",
    "Makassar",
    "Cirebon",
    "Jambi",
    "Banjarmasin",
  ];
  const destinations = [
    "Bandung",
    "Malang",
    "Makassar",
    "Lombok",
    "Palembang",
    "Surabaya",
    "Medan",
    "Yogyakarta",
    "Jakarta",
    "Denpasar",
    "Balikpapan",
    "Pontianak",
    "Semarang",
    "Solo",
    "Batam",
    "Aceh",
    "Tangerang",
    "Manado",
    "Ambon",
    "Kupang",
    "Banjarmasin",
    "Pekanbaru",
    "Mataram",
    "Bangka Belitung",
    "Cirebon",
    "Jambi",
    "Batu",
    "Gorontalo",
    "Ternate",
  ];
  const flightClasses = ["Economy", "Business", "First Class"];
  const aircraftIds = [1, 2, 3, 4, 5]; // Assuming you have these aircraft IDs

  return {
    pesawatId: aircraftIds[Math.floor(Math.random() * aircraftIds.length)],
    flightDate: date,
    departureTime: generateRandomTime(),
    arrivalTime: generateRandomTime(),
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    origin: origins[Math.floor(Math.random() * origins.length)],
    class: flightClasses[Math.floor(Math.random() * flightClasses.length)],
    price: generateRandomPrice(), // Price in integer format (rupiah)
  };
};

const createFlightSchedules = async () => {
  const baseDate = new Date("2024-11-21"); // Starting date for the schedule
  const daysToGenerate = 60; // Total days to generate
  const flightsPerDay = 20; // Flights per day
  const totalFlights = daysToGenerate * flightsPerDay;

  let createdFlights = 0;

  for (let i = 0; i < daysToGenerate; i++) {
    const flightDate = generateRandomDate(baseDate, i); // Date for the specific day
    const flightSchedulesForDay = [];

    // Generate 20 flight schedules per day
    for (let j = 0; j < flightsPerDay; j++) {
      flightSchedulesForDay.push(generateRandomFlightData(flightDate));
    }

    // Insert the generated schedules into the database
    try {
      await prisma.jadwalPenerbangan.createMany({
        data: flightSchedulesForDay,
      });
      createdFlights += flightSchedulesForDay.length;
      console.log(`Created ${flightSchedulesForDay.length} flight schedules for ${flightDate.toISOString().split("T")[0]}`);
    } catch (error) {
      console.error(`Error creating flight schedules for ${flightDate.toISOString().split("T")[0]}:`, error);
    }
  }

  console.log(`Successfully created ${createdFlights}/${totalFlights} flight schedules.`);
};

createFlightSchedules().finally(async () => {
  await prisma.$disconnect();
});
