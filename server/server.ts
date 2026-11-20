import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
import dispatcherRoutes from "./routes/dispatcherRoutes";
import { Vehicle, Job, FuelLog } from "./models/FleetModels";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/dispatcher", dispatcherRoutes);

// Auto-seed realistic demo data if database is empty
const seedIfEmpty = async () => {
  const count = await Vehicle.countDocuments();
  if (count > 0) return;

  const [v1, _v2, v3] = await Vehicle.create([
    {
      registration: "NRB 442-190",
      model: "Isuzu NPR 400",
      capacityKg: 4000,
      status: "READY",
      assignedDriverName: "Sipho Mthembu",
      currentOdometer: 142500,
      tankCapacityLiters: 100,
    },
    {
      registration: "ND 881-004",
      model: "Hino 300 Series",
      capacityKg: 3500,
      status: "READY",
      assignedDriverName: "Thabo Ndlovu",
      currentOdometer: 98200,
      tankCapacityLiters: 80,
    },
    {
      registration: "NRB 109-772",
      model: "Mercedes-Benz Atego",
      capacityKg: 8000,
      status: "ON_TRIP",
      assignedDriverName: "Bongani Khumalo",
      currentOdometer: 210400,
      tankCapacityLiters: 180,
    },
  ]);

  const [, activeJob] = await Job.create([
    {
      clientName: "Zululand Hardware & Timber",
      pickupLocation: "Empangeni Rail Depot",
      dropoffLocation: "Richards Bay Harbour Yard",
      cargoDescription: "Palletized Cement & Steel",
      weightKg: 3200,
      clientPrice: 4500,
      estimatedFuelCost: 650,
      status: "PENDING",
    },
    {
      clientName: "Alton Industrial Supplies",
      pickupLocation: "Richards Bay Alton",
      dropoffLocation: "Ballito Business Park",
      cargoDescription: "Machinery Parts",
      weightKg: 5500,
      clientPrice: 8200,
      estimatedFuelCost: 1600,
      status: "IN_TRANSIT",
      assignedVehicleId: v3._id,
    },
  ]);

  await FuelLog.create({
    jobId: activeJob._id,
    vehicleId: v3._id,
    liters: 85,
    cost: 1950,
    odometerReading: 210620,
    receiptNote: "Engen N2 Richards Bay - Slip #8841",
    isFlagged: true,
    flagReason: "Abnormal consumption: 2.5 km/L (Expected ~4.5 km/L)",
  });

  console.log("Seeded initial fleet demo data");
};

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "";

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
