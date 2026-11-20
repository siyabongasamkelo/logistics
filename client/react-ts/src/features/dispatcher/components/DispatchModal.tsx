import React, { useState, useEffect } from "react";
import type { DeliveryJob, Vehicle } from "../types/dispatcher.types";

interface DispatchModalProps {
  job: DeliveryJob | null;
  availableVehicles: Vehicle[];
  isDispatching: boolean;
  onClose: () => void;
  onConfirm: (jobId: string, vehicleId: string) => Promise<void>;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  job,
  availableVehicles,
  isDispatching,
  onClose,
  onConfirm,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  useEffect(() => {
    if (job) {
      const suitable = availableVehicles.find(
        (v) => v.capacityKg >= job.weightKg,
      );
      setSelectedVehicleId(suitable ? suitable._id : "");
    }
  }, [job, availableVehicles]);

  if (!job) return null;

  const handleConfirm = async () => {
    if (!selectedVehicleId) return;
    await onConfirm(job._id, selectedVehicleId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">
          Assign Vehicle to Load
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {job.pickupLocation} → {job.dropoffLocation} (
          {job.weightKg.toLocaleString()}kg)
        </p>

        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Available Vehicle
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          >
            <option value="">-- Choose a Ready Truck --</option>
            {availableVehicles.map((v) => {
              const tooSmall = v.capacityKg < job.weightKg;
              return (
                <option key={v._id} value={v._id} disabled={tooSmall}>
                  {v.model} ({v.registration}) - {v.assignedDriverName} [Max{" "}
                  {v.capacityKg}kg]
                  {tooSmall ? " - OVERWEIGHT" : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVehicleId || isDispatching}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isDispatching ? "Assigning..." : "Confirm Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
};
