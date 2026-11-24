import React, { useState, useEffect } from "react";
import { useDispatcher } from "../../dispatcher/context/DispatcherContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriverDashboardProps {
  lockedVehicleId?: string; // Pass user.assignedVehicleId here once real auth is added
  onExitDriverView?: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  lockedVehicleId,
  onExitDriverView,
}) => {
  const {
    vehicles,
    jobs,
    fuelLogs,
    isDispatching,
    error,
    updateStatus,
    submitFuelLog,
  } = useDispatcher();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [odometer, setOdometer] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [fuelSuccess, setFuelSuccess] = useState(false);
  const [podNote, setPodNote] = useState("");

  // Default to locked vehicle, or first truck with an active trip, or first available truck
  useEffect(() => {
    if (lockedVehicleId) {
      setSelectedVehicleId(lockedVehicleId);
      return;
    }
    if (!selectedVehicleId && vehicles.length > 0) {
      const busyTruck = vehicles.find((v) => v.status === "ON_TRIP");
      setSelectedVehicleId(busyTruck ? busyTruck._id : vehicles[0]._id);
    }
  }, [lockedVehicleId, vehicles, selectedVehicleId]);

  const currentVehicle = vehicles.find((v) => v._id === selectedVehicleId);

  const driverJobs = jobs.filter(
    (j) => j.assignedVehicleId === selectedVehicleId,
  );
  const activeMission = driverJobs.find(
    (j) => j.status === "ASSIGNED" || j.status === "IN_TRANSIT",
  );
  const completedMissions = driverJobs.filter((j) => j.status === "DELIVERED");
  const missionFuelLogs = activeMission
    ? fuelLogs.filter((f) => f.jobId === activeMission._id)
    : [];

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMission || !currentVehicle || !liters || !cost || !odometer)
      return;

    setFuelSuccess(false);
    const ok = await submitFuelLog({
      jobId: activeMission._id,
      vehicleId: currentVehicle._id,
      liters: Number(liters),
      cost: Number(cost),
      odometerReading: Number(odometer),
      receiptNote: receiptNote || "Driver Mobile Slip Upload",
    });

    if (ok) {
      setLiters("");
      setCost("");
      setOdometer("");
      setReceiptNote("");
      setFuelSuccess(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-5">
      {/* MOBILE TOP BAR & DRIVER SWITCHER */}
      <Card className="border-zinc-200 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-[11px]">
              DRIVER TERMINAL
            </Badge>
            {onExitDriverView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExitDriverView}
                className="h-7 px-2 text-xs text-zinc-500"
              >
                ← Dispatch View
              </Button>
            )}
          </div>
          <CardTitle className="text-lg pt-1">
            {currentVehicle
              ? currentVehicle.assignedDriverName
              : "Select Driver"}
          </CardTitle>
          <CardDescription className="text-xs">
            {currentVehicle
              ? `${currentVehicle.model} • ${currentVehicle.registration} • ${currentVehicle.currentOdometer.toLocaleString()} km`
              : "Choose a vehicle shift to preview"}
          </CardDescription>
        </CardHeader>

        {!lockedVehicleId && (
          <CardContent className="pt-0">
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger className="w-full h-10 text-xs">
                <SelectValue placeholder="Switch active driver..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v._id} value={v._id} className="text-xs">
                    {v.assignedDriverName} — {v.registration} ({v.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        )}
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}
      {/* ACTIVE ASSIGNED MISSION */}
      {activeMission ? (
        <Card className="border-zinc-900 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-zinc-900 text-white hover:bg-zinc-800">
                {activeMission.status.replace("_", " ")}
              </Badge>
              <span className="text-xs font-semibold text-zinc-500">
                {activeMission.weightKg.toLocaleString()} kg
              </span>
            </div>
            <CardTitle className="text-base leading-snug pt-2">
              {activeMission.pickupLocation} → {activeMission.dropoffLocation}
            </CardTitle>
            <CardDescription className="text-xs">
              Client:{" "}
              <strong className="text-zinc-800">
                {activeMission.clientName}
              </strong>{" "}
              • {activeMission.cargoDescription}
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-3 pt-2">
            {activeMission.status === "ASSIGNED" && (
              <Button
                disabled={isDispatching}
                onClick={() => updateStatus(activeMission._id, "IN_TRANSIT")}
                className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold"
              >
                {isDispatching ? "Updating..." : "Start Trip (Mark In Transit)"}
              </Button>
            )}

            <div className="w-full space-y-1.5 pt-1 border-t border-zinc-100">
              <Label htmlFor="podNote" className="text-xs text-zinc-600">
                Proof of Delivery (Recipient Name / Waybill #)
              </Label>
              <Input
                id="podNote"
                type="text"
                placeholder="e.g. Received by J. Dlamini • WB-902"
                value={podNote}
                onChange={(e) => setPodNote(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <Button
              disabled={isDispatching}
              onClick={async () => {
                const ok = await updateStatus(
                  activeMission._id,
                  "DELIVERED",
                  podNote,
                );
                if (ok) setPodNote("");
              }}
              className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold"
            >
              {isDispatching
                ? "Completing..."
                : "Confirm Delivered & Complete Job"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-dashed border-zinc-300 bg-zinc-50/50">
          <CardContent className="py-10 text-center space-y-1">
            <p className="text-sm font-semibold text-zinc-800">
              No Active Load Assigned
            </p>
            <p className="text-xs text-zinc-500">
              Stand by for dispatch assignment or switch to an active driver
              above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ON-THE-ROAD FUEL & ODOMETER LOGGER */}
      {activeMission && currentVehicle && (
        <Card className="border-zinc-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Log Fuel & Odometer</CardTitle>
            <CardDescription className="text-xs">
              Current truck odometer:{" "}
              <strong>
                {currentVehicle.currentOdometer.toLocaleString()} km
              </strong>{" "}
              (Max tank: {currentVehicle.tankCapacityLiters}L)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleFuelSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="liters" className="text-xs">
                    Liters Filled
                  </Label>
                  <Input
                    id="liters"
                    type="number"
                    placeholder="e.g. 65"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cost" className="text-xs">
                    Total Cost (ZAR)
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="e.g. 1450"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="odometer" className="text-xs">
                  New Odometer Reading (km)
                </Label>
                <Input
                  id="odometer"
                  type="number"
                  placeholder={`Must exceed ${currentVehicle.currentOdometer}`}
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="slip" className="text-xs">
                  Station & Slip Reference
                </Label>
                <Input
                  id="slip"
                  type="text"
                  placeholder="e.g. Engen N2 #4419"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {fuelSuccess && (
                <p className="text-xs font-medium text-emerald-600">
                  ✓ Fuel slip logged and verified against odometer.
                </p>
              )}

              <Button
                type="submit"
                variant="outline"
                disabled={isDispatching}
                className="w-full h-11 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white font-semibold text-xs"
              >
                {isDispatching ? "Submitting..." : "Submit Fuel Receipt"}
              </Button>
            </form>

            {missionFuelLogs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Trip Receipts ({missionFuelLogs.length})
                </p>
                {missionFuelLogs.map((log) => (
                  <div
                    key={log._id}
                    className={`rounded-lg border p-2.5 text-xs ${
                      log.isFlagged
                        ? "border-red-200 bg-red-50 text-red-900"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span>
                        {log.liters}L • R{log.cost.toLocaleString()}
                      </span>
                      <span>{log.odometerReading.toLocaleString()} km</span>
                    </div>
                    {log.isFlagged && (
                      <p className="mt-1 text-[11px] font-semibold text-red-700">
                        ⚠ Flagged: {log.flagReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* COMPLETED SHIFT JOBS */}
      {completedMissions.length > 0 && (
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Completed Trips ({completedMissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedMissions.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-800">
                    {job.pickupLocation} → {job.dropoffLocation}
                  </p>
                  <p className="text-[11px] text-zinc-500">{job.clientName}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 text-[10px]"
                >
                  DELIVERED
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
