import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  DeliveryJob,
  FuelLog,
  LogFuelPayload,
  Vehicle,
  CreateJobPayload,
  CreateVehiclePayload,
} from "../types/dispatcher.types";
import { dispatcherService } from "../services/dispatcherService";

interface DispatcherContextType {
  vehicles: Vehicle[];
  jobs: DeliveryJob[];
  fuelLogs: FuelLog[];
  availableVehicles: Vehicle[];
  availableJobs: DeliveryJob[];
  activeMissions: DeliveryJob[];
  flaggedFuelCount: number;
  isLoading: boolean;
  isDispatching: boolean;
  error: string | null;
  resolveFuelFlag: (
    fuelLogId: string,
    resolutionNote: string,
  ) => Promise<boolean>;
  dispatchJob: (jobId: string, vehicleId: string) => Promise<boolean>;
  updateStatus: (
    jobId: string,
    status: DeliveryJob["status"],
    podNote?: string,
  ) => Promise<boolean>;
  toggleVehicleStatus: (
    vehicleId: string,
    status: "READY" | "MAINTENANCE",
  ) => Promise<boolean>;
  submitFuelLog: (payload: LogFuelPayload) => Promise<boolean>;
  refreshBoard: () => Promise<void>;
  addJob: (payload: CreateJobPayload) => Promise<boolean>;
  addVehicle: (payload: CreateVehiclePayload) => Promise<boolean>;
}

const DispatcherContext = createContext<DispatcherContextType | undefined>(
  undefined,
);

export const DispatcherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [vehiclesData, jobsData, fuelData] = await Promise.all([
        dispatcherService.getVehicles(),
        dispatcherService.getJobs(),
        dispatcherService.getFuelLogs(),
      ]);
      setVehicles(vehiclesData);
      setJobs(jobsData);
      setFuelLogs(fuelData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dispatch board",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBoard();
  }, [refreshBoard]);

  const dispatchJob = async (
    jobId: string,
    vehicleId: string,
  ): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const { job: updatedJob, vehicle: updatedVehicle } =
        await dispatcherService.assignJobToVehicle({
          jobId,
          vehicleId,
        });
      setJobs((prev) =>
        prev.map((j) => (j._id === updatedJob._id ? updatedJob : j)),
      );
      setVehicles((prev) =>
        prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)),
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dispatch failed");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  // In DispatcherContextType interface:

  // Inside DispatcherProvider:
  const updateStatus = async (
    jobId: string,
    status: DeliveryJob["status"],
    podNote?: string,
  ): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const { job: updatedJob, vehicle: updatedVehicle } =
        await dispatcherService.updateJobStatus(jobId, status, podNote);
      setJobs((prev) =>
        prev.map((j) => (j._id === updatedJob._id ? updatedJob : j)),
      );
      if (updatedVehicle) {
        setVehicles((prev) =>
          prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)),
        );
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const submitFuelLog = async (payload: LogFuelPayload): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const { fuelLog, vehicle: updatedVehicle } =
        await dispatcherService.logFuelExpense(payload);
      setFuelLogs((prev) => [fuelLog, ...prev]);
      setVehicles((prev) =>
        prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)),
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fuel log failed");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const addJob = async (payload: CreateJobPayload): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const created = await dispatcherService.createJob(payload);
      setJobs((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const addVehicle = async (
    payload: CreateVehiclePayload,
  ): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const created = await dispatcherService.createVehicle(payload);
      setVehicles((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vehicle");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const resolveFuelFlag = async (
    fuelLogId: string,
    resolutionNote: string,
  ): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const updatedLog = await dispatcherService.resolveFuelAlert(
        fuelLogId,
        resolutionNote,
      );
      setFuelLogs((prev) =>
        prev.map((log) => (log._id === updatedLog._id ? updatedLog : log)),
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve alert");
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const toggleVehicleStatus = async (
    vehicleId: string,
    status: "READY" | "MAINTENANCE",
  ): Promise<boolean> => {
    try {
      setIsDispatching(true);
      setError(null);
      const updatedVehicle = await dispatcherService.updateVehicleStatus(
        vehicleId,
        status,
      );
      setVehicles((prev) =>
        prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)),
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Vehicle status update failed",
      );
      return false;
    } finally {
      setIsDispatching(false);
    }
  };

  const availableVehicles = vehicles.filter((v) => v.status === "READY");
  const availableJobs = jobs.filter((j) => j.status === "PENDING");
  const activeMissions = jobs.filter(
    (j) => j.status === "ASSIGNED" || j.status === "IN_TRANSIT",
  );
  const flaggedFuelCount = fuelLogs.filter((f) => f.isFlagged).length;

  return (
    <DispatcherContext.Provider
      value={{
        vehicles,
        jobs,
        fuelLogs,
        availableVehicles,
        availableJobs,
        activeMissions,
        flaggedFuelCount,
        isLoading,
        isDispatching,
        error,
        dispatchJob,
        updateStatus,
        submitFuelLog,
        refreshBoard,
        addJob,
        addVehicle,
        resolveFuelFlag,
        toggleVehicleStatus,
      }}
    >
      {children}
    </DispatcherContext.Provider>
  );
};

export const useDispatcher = (): DispatcherContextType => {
  const context = useContext(DispatcherContext);
  if (!context)
    throw new Error("useDispatcher must be used within a DispatcherProvider");
  return context;
};
