import type {
  DeliveryJob,
  DispatchPayload,
  Vehicle,
  FuelLog,
  LogFuelPayload,
  CreateJobPayload,
  CreateVehiclePayload,
} from "../types/dispatcher.types";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

let mockFuelLogs: FuelLog[] = [
  {
    _id: "fuel_01",
    jobId: "job_103",
    vehicleId: "veh_03",
    liters: 85,
    cost: 1950,
    odometerReading: 210620,
    receiptNote: "Engen N2 Richards Bay - Slip #8841",
    isFlagged: true,
    flagReason: "Abnormal consumption: 2.5 km/L (Expected ~4.5 km/L)",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

// Mock database state (simulates MongoDB collections)
let mockVehicles: Vehicle[] = [
  {
    _id: "veh_01",
    registration: "NRB 442-190",
    model: "Isuzu NPR 400",
    capacityKg: 4000,
    status: "READY",
    assignedDriverName: "Sipho Mthembu",
    currentOdometer: 142500,
    tankCapacityLiters: 100,
  },
  {
    _id: "veh_02",
    registration: "ND 881-004",
    model: "Hino 300 Series",
    capacityKg: 3500,
    status: "READY",
    assignedDriverName: "Thabo Ndlovu",
    currentOdometer: 98200,
    tankCapacityLiters: 80,
  },
  {
    _id: "veh_03",
    registration: "NRB 109-772",
    model: "Mercedes-Benz Atego",
    capacityKg: 8000,
    status: "ON_TRIP",
    assignedDriverName: "Bongani Khumalo",
    currentOdometer: 210400,
    tankCapacityLiters: 180,
  },
  {
    _id: "veh_04",
    registration: "ND 332-519",
    model: "Toyota Dyna",
    capacityKg: 2500,
    status: "MAINTENANCE",
    assignedDriverName: "Unassigned",
    currentOdometer: 175000,
    tankCapacityLiters: 70,
  },
];

let mockJobs: DeliveryJob[] = [
  {
    _id: "job_101",
    clientName: "Zululand Hardware & Timber",
    pickupLocation: "Empangeni Rail Depot",
    dropoffLocation: "Richards Bay Harbour Yard",
    cargoDescription: "Palletized Cement & Steel",
    weightKg: 3200,
    deadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    clientPrice: 4500,
    estimatedFuelCost: 650,
    status: "PENDING",
  },
  {
    _id: "job_102",
    clientName: "KZN Coastal Fresh Produce",
    pickupLocation: "Mtunzini Farms",
    dropoffLocation: "Durban Clairwood Market",
    cargoDescription: "Refrigerated Crates",
    weightKg: 2100,
    deadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    clientPrice: 6800,
    estimatedFuelCost: 1400,
    status: "PENDING",
  },
  {
    _id: "job_103",
    clientName: "Alton Industrial Supplies",
    pickupLocation: "Richards Bay Alton",
    dropoffLocation: "Ballito Business Park",
    cargoDescription: "Machinery Parts",
    weightKg: 5500,
    deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    clientPrice: 8200,
    estimatedFuelCost: 1600,
    status: "IN_TRANSIT",
    assignedVehicleId: "veh_03",
  },
];

export const dispatcherService = {
  // GET /api/dispatcher/vehicles
  async getVehicles(): Promise<Vehicle[]> {
    await delay();
    return [...mockVehicles];
  },

  // GET /api/dispatcher/jobs
  async getJobs(): Promise<DeliveryJob[]> {
    await delay();
    return [...mockJobs];
  },

  // POST /api/dispatcher/assign
  async assignJobToVehicle(
    payload: DispatchPayload,
  ): Promise<{ job: DeliveryJob; vehicle: Vehicle }> {
    await delay(500);

    const jobIndex = mockJobs.findIndex((j) => j._id === payload.jobId);
    const vehicleIndex = mockVehicles.findIndex(
      (v) => v._id === payload.vehicleId,
    );

    if (jobIndex === -1 || vehicleIndex === -1) {
      throw new Error("Job or Vehicle not found");
    }

    const job = mockJobs[jobIndex];
    const vehicle = mockVehicles[vehicleIndex];

    if (vehicle.status !== "READY") {
      throw new Error("Selected vehicle is not available");
    }

    if (job.weightKg > vehicle.capacityKg) {
      throw new Error(
        `Cargo (${job.weightKg}kg) exceeds vehicle limit (${vehicle.capacityKg}kg)`,
      );
    }

    const updatedJob: DeliveryJob = {
      ...job,
      status: "ASSIGNED",
      assignedVehicleId: vehicle._id,
    };

    const updatedVehicle: Vehicle = {
      ...vehicle,
      status: "ON_TRIP",
    };

    mockJobs[jobIndex] = updatedJob;
    mockVehicles[vehicleIndex] = updatedVehicle;

    return { job: updatedJob, vehicle: updatedVehicle };
  },

  // GET /api/dispatcher/fuel-logs
  async getFuelLogs(): Promise<FuelLog[]> {
    await delay(300);
    return [...mockFuelLogs];
  },

  // PATCH /api/dispatcher/jobs/:id/status
  async updateJobStatus(
    jobId: string,
    status: DeliveryJob["status"],
  ): Promise<{ job: DeliveryJob; vehicle?: Vehicle }> {
    await delay(400);
    const jobIndex = mockJobs.findIndex((j) => j._id === jobId);
    if (jobIndex === -1) throw new Error("Job not found");

    const updatedJob: DeliveryJob = { ...mockJobs[jobIndex], status };
    mockJobs[jobIndex] = updatedJob;

    // If delivered, automatically release the vehicle back to READY
    let updatedVehicle: Vehicle | undefined;
    if (status === "DELIVERED" && updatedJob.assignedVehicleId) {
      const vIndex = mockVehicles.findIndex(
        (v) => v._id === updatedJob.assignedVehicleId,
      );
      if (vIndex !== -1) {
        updatedVehicle = { ...mockVehicles[vIndex], status: "READY" };
        mockVehicles[vIndex] = updatedVehicle;
      }
    }

    return { job: updatedJob, vehicle: updatedVehicle };
  },

  // POST /api/dispatcher/fuel-logs
  async logFuelExpense(
    payload: LogFuelPayload,
  ): Promise<{ fuelLog: FuelLog; vehicle: Vehicle }> {
    await delay(450);
    const vIndex = mockVehicles.findIndex((v) => v._id === payload.vehicleId);
    if (vIndex === -1) throw new Error("Vehicle not found");

    const vehicle = mockVehicles[vIndex];
    const kmDriven = payload.odometerReading - vehicle.currentOdometer;
    const kmPerLiter = payload.liters > 0 ? kmDriven / payload.liters : 0;

    // Automated Theft & Anomaly Guardrails
    let isFlagged = false;
    let flagReason: string | undefined;

    if (payload.liters > vehicle.tankCapacityLiters) {
      isFlagged = true;
      flagReason = `Exceeds max tank size (${payload.liters}L > ${vehicle.tankCapacityLiters}L)`;
    } else if (kmDriven <= 0) {
      isFlagged = true;
      flagReason = `Invalid odometer (${payload.odometerReading}km <= previous ${vehicle.currentOdometer}km)`;
    } else if (kmPerLiter < 2.2) {
      isFlagged = true;
      flagReason = `Suspicious efficiency: ${kmPerLiter.toFixed(1)} km/L (Possible siphon)`;
    }

    const newLog: FuelLog = {
      _id: `fuel_${Date.now()}`,
      ...payload,
      isFlagged,
      flagReason,
      createdAt: new Date().toISOString(),
    };

    mockFuelLogs = [newLog, ...mockFuelLogs];

    // Update vehicle odometer
    const updatedVehicle: Vehicle = {
      ...vehicle,
      currentOdometer: Math.max(
        vehicle.currentOdometer,
        payload.odometerReading,
      ),
    };
    mockVehicles[vIndex] = updatedVehicle;

    return { fuelLog: newLog, vehicle: updatedVehicle };
  },

  // POST /api/dispatcher/jobs
  async createJob(payload: CreateJobPayload): Promise<DeliveryJob> {
    await delay(400);
    const newJob: DeliveryJob = {
      _id: `job_${Date.now()}`,
      ...payload,
      deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      status: "PENDING",
    };
    mockJobs = [newJob, ...mockJobs];
    return newJob;
  },

  // POST /api/dispatcher/vehicles
  async createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
    await delay(400);
    const newVehicle: Vehicle = {
      _id: `veh_${Date.now()}`,
      ...payload,
      status: "READY",
    };
    mockVehicles = [newVehicle, ...mockVehicles];
    return newVehicle;
  },
};
