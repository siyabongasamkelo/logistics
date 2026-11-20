import React, { useState } from "react";
import type { CreateJobPayload } from "../types/dispatcher.types";

interface CreateJobModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateJobPayload) => Promise<boolean>;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
}) => {
  const [clientName, setClientName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [clientPrice, setClientPrice] = useState("");
  const [estimatedFuelCost, setEstimatedFuelCost] = useState("");

  if (!isOpen) return null;

  const estProfit =
    (Number(clientPrice) || 0) - (Number(estimatedFuelCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onCreate({
      clientName,
      pickupLocation,
      dropoffLocation,
      cargoDescription,
      weightKg: Number(weightKg),
      clientPrice: Number(clientPrice),
      estimatedFuelCost: Number(estimatedFuelCost),
    });

    if (ok) {
      setClientName("");
      setPickupLocation("");
      setDropoffLocation("");
      setCargoDescription("");
      setWeightKg("");
      setClientPrice("");
      setEstimatedFuelCost("");
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
            New Delivery Ticket
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
          Log an incoming client order directly into the dispatch queue.
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Client Name (e.g. Richards Bay Minerals)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
            required
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Pickup (e.g. Empangeni)"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Dropoff (e.g. Durban Port)"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Cargo (e.g. Steel Coils)"
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Weight in kg (e.g. 2800)"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="number"
              placeholder="Client Rate ZAR (e.g. 5200)"
              value={clientPrice}
              onChange={(e) => setClientPrice(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Est. Fuel ZAR (e.g. 900)"
              value={estimatedFuelCost}
              onChange={(e) => setEstimatedFuelCost(e.target.value)}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Live Margin Preview */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-200/80 text-xs">
          <span className="text-slate-500 font-medium">
            Projected Net Margin:
          </span>
          <span
            className={`font-bold ${estProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            R{estProfit.toLocaleString()}
          </span>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
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
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};
