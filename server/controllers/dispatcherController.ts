import { Request, Response } from "express";
import { Vehicle, Job, FuelLog } from "../models/FleetModels";

// GET /api/dispatcher/vehicles
export const getVehicles = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vehicles", err });
  }
};

// POST /api/dispatcher/vehicles
export const createVehicle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, status: "READY" });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: "Failed to create vehicle", err });
  }
};

// GET /api/dispatcher/jobs
export const getJobs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", err });
  }
};

// POST /api/dispatcher/jobs
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.create({ ...req.body, status: "PENDING" });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: "Failed to create job", err });
  }
};

// POST /api/dispatcher/assign
export const assignJobToVehicle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { jobId, vehicleId } = req.body as {
      jobId: string;
      vehicleId: string;
    };

    const [job, vehicle] = await Promise.all([
      Job.findById(jobId),
      Vehicle.findById(vehicleId),
    ]);

    if (!job || !vehicle) {
      res.status(404).json({ message: "Job or Vehicle not found" });
      return;
    }

    if (vehicle.status !== "READY") {
      res.status(400).json({ message: "Selected vehicle is not available" });
      return;
    }

    if (job.weightKg > vehicle.capacityKg) {
      res.status(400).json({
        message: `Cargo (${job.weightKg}kg) exceeds vehicle limit (${vehicle.capacityKg}kg)`,
      });
      return;
    }

    job.status = "ASSIGNED";
    job.assignedVehicleId = vehicle._id as typeof job.assignedVehicleId;
    vehicle.status = "ON_TRIP";

    await Promise.all([job.save(), vehicle.save()]);

    res.json({ job, vehicle });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign vehicle", err });
  }
};

// PATCH /api/dispatcher/jobs/:id/status
export const updateJobStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, podNote } = req.body as {
      status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED";
      podNote?: string;
    };

    const job = await Job.findById(id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    job.status = status;

    let updatedVehicle = undefined;
    if (status === "DELIVERED") {
      job.podNote = podNote?.trim() || "Signed at Dropoff Gate";
      job.deliveredAt = new Date();

      if (job.assignedVehicleId) {
        updatedVehicle = await Vehicle.findByIdAndUpdate(
          job.assignedVehicleId,
          { status: "READY" },
          { new: true },
        );
      }
    }

    await job.save();

    res.json({ job, vehicle: updatedVehicle });
  } catch (err) {
    res.status(500).json({ message: "Failed to update job status", err });
  }
};

// GET /api/dispatcher/fuel-logs
export const getFuelLogs = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const logs = await FuelLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fuel logs", err });
  }
};

// POST /api/dispatcher/fuel-logs
export const logFuelExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { jobId, vehicleId, liters, cost, odometerReading, receiptNote } =
      req.body as {
        jobId: string;
        vehicleId: string;
        liters: number;
        cost: number;
        odometerReading: number;
        receiptNote?: string;
      };

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    const kmDriven = odometerReading - vehicle.currentOdometer;
    const kmPerLiter = liters > 0 ? kmDriven / liters : 0;

    let isFlagged = false;
    let flagReason: string | undefined;

    if (liters > vehicle.tankCapacityLiters) {
      isFlagged = true;
      flagReason = `Exceeds max tank size (${liters}L > ${vehicle.tankCapacityLiters}L)`;
    } else if (kmDriven <= 0) {
      isFlagged = true;
      flagReason = `Invalid odometer (${odometerReading}km <= previous ${vehicle.currentOdometer}km)`;
    } else if (kmPerLiter < 2.2) {
      isFlagged = true;
      flagReason = `Suspicious efficiency: ${kmPerLiter.toFixed(1)} km/L (Possible siphon)`;
    }

    const fuelLog = await FuelLog.create({
      jobId,
      vehicleId,
      liters,
      cost,
      odometerReading,
      receiptNote: receiptNote || "Mobile Camera Slip Uploaded",
      isFlagged,
      flagReason,
    });

    vehicle.currentOdometer = Math.max(
      vehicle.currentOdometer,
      odometerReading,
    );
    await vehicle.save();

    res.status(201).json({ fuelLog, vehicle });
  } catch (err) {
    res.status(500).json({ message: "Failed to log fuel expense", err });
  }
};

// PATCH /api/dispatcher/fuel-logs/:id/resolve
export const resolveFuelAlert = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { resolutionNote } = req.body as { resolutionNote: string };

    if (!resolutionNote || !resolutionNote.trim()) {
      res.status(400).json({ message: "Please provide a resolution note" });
      return;
    }

    const fuelLog = await FuelLog.findByIdAndUpdate(
      id,
      {
        isFlagged: false,
        resolutionNote: resolutionNote.trim(),
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (!fuelLog) {
      res.status(404).json({ message: "Fuel log not found" });
      return;
    }

    res.json(fuelLog);
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve fuel alert", err });
  }
};

// PATCH /api/dispatcher/vehicles/:id/status
export const updateVehicleStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body as { status: "READY" | "MAINTENANCE" };

    if (status !== "READY" && status !== "MAINTENANCE") {
      res.status(400).json({ message: "Status must be READY or MAINTENANCE" });
      return;
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    if (vehicle.status === "ON_TRIP") {
      res.status(400).json({
        message: "Cannot change status while vehicle is currently on a trip",
      });
      return;
    }

    vehicle.status = status;
    await vehicle.save();

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: "Failed to update vehicle status", err });
  }
};
