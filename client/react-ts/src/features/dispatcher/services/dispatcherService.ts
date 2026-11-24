import axios from "axios";
import type {
  DeliveryJob,
  DispatchPayload,
  Vehicle,
  FuelLog,
  LogFuelPayload,
  CreateJobPayload,
  CreateVehiclePayload,
} from "../types/dispatcher.types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/dispatcher";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const extractError = (err: unknown, fallback: string): never => {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.message;
    throw new Error(serverMsg || err.message || fallback);
  }
  throw err instanceof Error ? err : new Error(fallback);
};
export const dispatcherService = {
  // GET /api/dispatcher/vehicles
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data } = await api.get<Vehicle[]>("/vehicles");
      return data;
    } catch (err) {
      return extractError(err, "Failed to fetch vehicles");
    }
  },

  // POST /api/dispatcher/vehicles
  async createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
    try {
      const { data } = await api.post<Vehicle>("/vehicles", payload);
      return data;
    } catch (err) {
      return extractError(err, "Failed to create vehicle");
    }
  },

  // GET /api/dispatcher/jobs
  async getJobs(): Promise<DeliveryJob[]> {
    try {
      const { data } = await api.get<DeliveryJob[]>("/jobs");
      return data;
    } catch (err) {
      return extractError(err, "Failed to fetch jobs");
    }
  },

  // POST /api/dispatcher/jobs
  async createJob(payload: CreateJobPayload): Promise<DeliveryJob> {
    try {
      const { data } = await api.post<DeliveryJob>("/jobs", payload);
      return data;
    } catch (err) {
      return extractError(err, "Failed to create job");
    }
  },
  // POST /api/dispatcher/assign
  async assignJobToVehicle(
    payload: DispatchPayload,
  ): Promise<{ job: DeliveryJob; vehicle: Vehicle }> {
    try {
      const { data } = await api.post<{ job: DeliveryJob; vehicle: Vehicle }>(
        "/assign",
        payload,
      );
      return data;
    } catch (err) {
      return extractError(err, "Failed to assign vehicle");
    }
  },

  // PATCH /api/dispatcher/jobs/:id/status
  async updateJobStatus(
    jobId: string,
    status: DeliveryJob["status"],
    podNote?: string,
  ): Promise<{ job: DeliveryJob; vehicle?: Vehicle }> {
    try {
      const { data } = await api.patch<{
        job: DeliveryJob;
        vehicle?: Vehicle;
      }>(`/jobs/${jobId}/status`, { status, podNote });
      return data;
    } catch (err) {
      return extractError(err, "Failed to update job status");
    }
  },

  // GET /api/dispatcher/fuel-logs
  async getFuelLogs(): Promise<FuelLog[]> {
    try {
      const { data } = await api.get<FuelLog[]>("/fuel-logs");
      return data;
    } catch (err) {
      return extractError(err, "Failed to fetch fuel logs");
    }
  },

  // POST /api/dispatcher/fuel-logs
  async logFuelExpense(
    payload: LogFuelPayload,
  ): Promise<{ fuelLog: FuelLog; vehicle: Vehicle }> {
    try {
      const { data } = await api.post<{ fuelLog: FuelLog; vehicle: Vehicle }>(
        "/fuel-logs",
        payload,
      );
      return data;
    } catch (err) {
      return extractError(err, "Failed to log fuel expense");
    }
  },

  // PATCH /api/dispatcher/fuel-logs/:id/resolve
  async resolveFuelAlert(
    fuelLogId: string,
    resolutionNote: string,
  ): Promise<FuelLog> {
    try {
      const { data } = await api.patch<FuelLog>(
        `/fuel-logs/${fuelLogId}/resolve`,
        { resolutionNote },
      );
      return data;
    } catch (err) {
      return extractError(err, "Failed to resolve fuel alert");
    }
  },

  // PATCH /api/dispatcher/vehicles/:id/status
  async updateVehicleStatus(
    vehicleId: string,
    status: "READY" | "MAINTENANCE",
  ): Promise<Vehicle> {
    try {
      const { data } = await api.patch<Vehicle>(
        `/vehicles/${vehicleId}/status`,
        { status },
      );
      return data;
    } catch (err) {
      return extractError(err, "Failed to update vehicle status");
    }
  },
};
