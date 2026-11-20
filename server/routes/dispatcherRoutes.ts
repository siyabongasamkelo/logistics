import { Router } from "express";
import {
  getVehicles,
  createVehicle,
  getJobs,
  createJob,
  assignJobToVehicle,
  updateJobStatus,
  getFuelLogs,
  logFuelExpense,
} from "../controllers/dispatcherController";

const router = Router();

router.get("/vehicles", getVehicles);
router.post("/vehicles", createVehicle);

router.get("/jobs", getJobs);
router.post("/jobs", createJob);
router.post("/assign", assignJobToVehicle);
router.patch("/jobs/:id/status", updateJobStatus);

router.get("/fuel-logs", getFuelLogs);
router.post("/fuel-logs", logFuelExpense);

export default router;
