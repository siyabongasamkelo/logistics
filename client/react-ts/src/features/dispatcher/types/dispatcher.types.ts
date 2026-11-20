export type VehicleStatus = "READY" | "ON_TRIP" | "MAINTENANCE";
export type JobStatus = "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED";

export interface Vehicle {
  _id: string;
  registration: string;
  model: string;
  capacityKg: number;
  status: VehicleStatus;
  assignedDriverName: string;
  currentOdometer: number;
  tankCapacityLiters: number;
}

export interface DeliveryJob {
  _id: string;
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string;
  cargoDescription: string;
  weightKg: number;
  deadline: string; // ISO string
  clientPrice: number;
  estimatedFuelCost: number;
  status: JobStatus;
  assignedVehicleId?: string;
}

export interface DispatchPayload {
  jobId: string;
  vehicleId: string;
}

export interface FuelLog {
  _id: string;
  jobId: string;
  vehicleId: string;
  liters: number;
  cost: number;
  odometerReading: number;
  receiptNote: string;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface LogFuelPayload {
  jobId: string;
  vehicleId: string;
  liters: number;
  cost: number;
  odometerReading: number;
  receiptNote: string;
}

export interface CreateJobPayload {
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string;
  cargoDescription: string;
  weightKg: number;
  clientPrice: number;
  estimatedFuelCost: number;
}

export interface CreateVehiclePayload {
  registration: string;
  model: string;
  capacityKg: number;
  assignedDriverName: string;
  currentOdometer: number;
  tankCapacityLiters: number;
}
