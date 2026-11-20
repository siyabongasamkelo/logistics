import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  registration: string;
  model: string;
  capacityKg: number;
  status: "READY" | "ON_TRIP" | "MAINTENANCE";
  assignedDriverName: string;
  currentOdometer: number;
  tankCapacityLiters: number;
}

export interface IJob extends Document {
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string;
  cargoDescription: string;
  weightKg: number;
  deadline: Date;
  clientPrice: number;
  estimatedFuelCost: number;
  status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED";
  assignedVehicleId?: mongoose.Types.ObjectId;
}

export interface IFuelLog extends Document {
  jobId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  liters: number;
  cost: number;
  odometerReading: number;
  receiptNote: string;
  isFlagged: boolean;
  flagReason?: string;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    registration: { type: String, required: true, uppercase: true },
    model: { type: String, required: true },
    capacityKg: { type: Number, required: true },
    status: {
      type: String,
      enum: ["READY", "ON_TRIP", "MAINTENANCE"],
      default: "READY",
    },
    assignedDriverName: { type: String, required: true },
    currentOdometer: { type: Number, required: true },
    tankCapacityLiters: { type: Number, required: true },
  },
  { timestamps: true },
);

const JobSchema = new Schema<IJob>(
  {
    clientName: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    cargoDescription: { type: String, required: true },
    weightKg: { type: Number, required: true },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 3600 * 1000),
    },
    clientPrice: { type: Number, required: true },
    estimatedFuelCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED"],
      default: "PENDING",
    },
    assignedVehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  },
  { timestamps: true },
);

const FuelLogSchema = new Schema<IFuelLog>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
    odometerReading: { type: Number, required: true },
    receiptNote: { type: String, default: "Mobile Camera Slip" },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true },
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export const Job = mongoose.model<IJob>("Job", JobSchema);
export const FuelLog = mongoose.model<IFuelLog>("FuelLog", FuelLogSchema);
