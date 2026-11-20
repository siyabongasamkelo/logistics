import React, { useState } from "react";
import type {
  DeliveryJob,
  FuelLog,
  LogFuelPayload,
  Vehicle,
} from "../types/dispatcher.types";

interface MissionDrawerProps {
  mission: DeliveryJob | null;
  vehicle?: Vehicle;
  fuelLogs: FuelLog[];
  isSubmitting: boolean;
  onClose: () => void;
  onUpdateStatus: (
    jobId: string,
    status: DeliveryJob["status"],
  ) => Promise<boolean>;
  onLogFuel: (payload: LogFuelPayload) => Promise<boolean>;
}

export const MissionDrawer: React.FC<MissionDrawerProps> = ({
  mission,
  vehicle,
  fuelLogs,
  isSubmitting,
  onClose,
  onUpdateStatus,
  onLogFuel,
}) => {
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [odometer, setOdometer] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  if (!mission || !vehicle) return null;

  const missionLogs = fuelLogs.filter((log) => log.jobId === mission._id);

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liters || !cost || !odometer) return;

    const ok = await onLogFuel({
      jobId: mission._id,
      vehicleId: vehicle._id,
      liters: Number(liters),
      cost: Number(cost),
      odometerReading: Number(odometer),
      receiptNote: receiptNote || "Mobile Camera Slip Uploaded",
    });

    if (ok) {
      setLiters("");
      setCost("");
      setOdometer("");
      setReceiptNote("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl border-l border-slate-200">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              {mission.status.replace("_", " ")}
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {mission.pickupLocation} → {mission.dropoffLocation}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {vehicle.model} ({vehicle.registration}) • Driver:{" "}
              <strong>{vehicle.assignedDriverName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* 1. TRIP STATUS CONTROLS */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Update Mission Stage
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {mission.status === "ASSIGNED" && (
              <button
                disabled={isSubmitting}
                onClick={() => onUpdateStatus(mission._id, "IN_TRANSIT")}
                className="col-span-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Mark as In Transit
              </button>
            )}
            <button
              disabled={isSubmitting}
              onClick={async () => {
                const done = await onUpdateStatus(mission._id, "DELIVERED");
                if (done) onClose();
              }}
              className="col-span-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              Confirm Delivered & Free Truck
            </button>
          </div>
        </div>

        {/* 2. MAP SLOT (READY FOR LEAFLET ON DAY 3) */}
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-xs font-semibold text-slate-600">
            Live Route & GPS Telemetry
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Last Odometer: {vehicle.currentOdometer.toLocaleString()} km • Tank
            Max: {vehicle.tankCapacityLiters}L
          </p>
        </div>

        {/* 3. DRIVER FUEL & RECEIPT LOGGER */}
        <form
          onSubmit={handleFuelSubmit}
          className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200/80"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Log Fuel & Receipt Proof
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Liters (e.g. 60)"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              required
            />
            <input
              type="number"
              placeholder="Cost ZAR (e.g. 1350)"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              required
            />
            <input
              type="number"
              placeholder={`Odometer (> ${vehicle.currentOdometer})`}
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              required
            />
            <input
              type="text"
              placeholder="Station / Slip # (e.g. Shell N2 #402)"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            {isSubmitting ? "Verifying Math..." : "Submit Fuel Receipt"}
          </button>
        </form>

        {/* 4. FUEL LOGS & ANOMALY FLAGS */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Logged Fuel Receipts ({missionLogs.length})
          </h3>
          <div className="space-y-2.5">
            {missionLogs.map((log) => (
              <div
                key={log._id}
                className={`rounded-xl p-3 border text-xs ${
                  log.isFlagged
                    ? "bg-rose-50/80 border-rose-200 text-rose-900"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>
                    {log.liters}L • R{log.cost.toLocaleString()}
                  </span>
                  <span>{log.odometerReading.toLocaleString()} km</span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {log.receiptNote}
                </p>
                {log.isFlagged && (
                  <p className="mt-1.5 font-semibold text-rose-700">
                    ⚠ {log.flagReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
