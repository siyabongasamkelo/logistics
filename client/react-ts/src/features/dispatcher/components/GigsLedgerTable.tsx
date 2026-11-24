import React from "react";
import type { DeliveryJob, FuelLog, Vehicle } from "../types/dispatcher.types";

interface GigsLedgerTableProps {
  jobs: DeliveryJob[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  totalGrossRevenue: number;
  netProfit: number;
}

export const GigsLedgerTable: React.FC<GigsLedgerTableProps> = ({
  jobs,
  vehicles,
  fuelLogs,
  totalGrossRevenue,
  netProfit,
}) => {
  return (
    <section className="mb-8 rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Gigs & Revenue Ledger ({jobs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Client source, assigned driver, route destination, and per-trip
            margin
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
            Billed: R{totalGrossRevenue.toLocaleString()}
          </span>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-700">
            Net: R{netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Client / Source</th>
              <th className="px-5 py-3.5">Route & Destination</th>
              <th className="px-5 py-3.5">Driver & Truck</th>
              <th className="px-5 py-3.5">Amount Made</th>
              <th className="px-5 py-3.5">Fuel Logged</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const truck = vehicles.find(
                (v) => v._id === job.assignedVehicleId,
              );
              const jobFuel = fuelLogs
                .filter((f) => f.jobId === job._id)
                .reduce((sum, f) => sum + f.cost, 0);

              return (
                <tr key={job._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {job.clientName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {job.cargoDescription} ({job.weightKg}kg)
                    </p>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {job.pickupLocation} →{" "}
                    <span className="font-semibold text-slate-900">
                      {job.dropoffLocation}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {truck ? (
                      <div>
                        <p className="font-semibold text-slate-800">
                          {truck.assignedDriverName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {truck.model} ({truck.registration})
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    R{job.clientPrice.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-600">
                    R{jobFuel.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        job.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : job.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          job.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700"
                            : job.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
                      {job.status === "DELIVERED" && job.podNote && (
                        <p className="text-[11px] text-slate-500">
                          POD: {job.podNote}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
