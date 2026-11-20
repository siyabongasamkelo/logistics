import React, { useState } from "react";
import type { CreateVehiclePayload } from "../types/dispatcher.types";

interface AddVehicleModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateVehiclePayload) => Promise<boolean>;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
}) => {
  const [model, setModel] = useState("");
  const [registration, setRegistration] = useState("");
  const [assignedDriverName, setAssignedDriverName] = useState("");
  const [capacityKg, setCapacityKg] = useState("");
  const [tankCapacityLiters, setTankCapacityLiters] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onCreate({
      model,
      registration: registration.toUpperCase(),
      assignedDriverName,
      capacityKg: Number(capacityKg),
      tankCapacityLiters: Number(tankCapacityLiters),
      currentOdometer: Number(currentOdometer),
    });

    if (ok) {
      setModel("");
      setRegistration("");
      setAssignedDriverName("");
      setCapacityKg("");
      setTankCapacityLiters("");
      setCurrentOdometer("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Add Fleet Vehicle
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Register a new truck and set baseline tank & odometer limits for theft
          tracking.
        </p>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Model (e.g. Isuzu FTR 850)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Plate (e.g. NRB 512-880)"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs uppercase focus:border-indigo-600 focus:outline-none"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Assigned Driver (e.g. Mandla Zulu)"
            value={assignedDriverName}
            onChange={(e) => setAssignedDriverName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
            required
          />

          <div className="grid grid-cols-3 gap-2.5">
            <input
              type="number"
              placeholder="Max Load (kg)"
              value={capacityKg}
              onChange={(e) => setCapacityKg(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Tank Size (L)"
              value={tankCapacityLiters}
              onChange={(e) => setTankCapacityLiters(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Odometer (km)"
              value={currentOdometer}
              onChange={(e) => setCurrentOdometer(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
};
