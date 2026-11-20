import React from "react";
import { useDispatcher } from "../context/DispatcherContext";
import { AnalyticsKPIs } from "./AnalyticsKPIs";
import { GigsLedgerTable } from "./GigsLedgerTable";

interface OperationsAnalyticsProps {
  onBackToLive: () => void;
}

export const OperationsAnalytics: React.FC<OperationsAnalyticsProps> = ({
  onBackToLive,
}) => {
  const { jobs, vehicles, fuelLogs, flaggedFuelCount } = useDispatcher();

  const totalGrossRevenue = jobs.reduce((sum, job) => sum + job.clientPrice, 0);
  const totalActualFuel = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const netProfit = totalGrossRevenue - totalActualFuel;
  const completedCount = jobs.filter((j) => j.status === "DELIVERED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <AnalyticsKPIs
        totalGrossRevenue={totalGrossRevenue}
        totalActualFuel={totalActualFuel}
        netProfit={netProfit}
        jobsCount={jobs.length}
        fuelLogsCount={fuelLogs.length}
        flaggedFuelCount={flaggedFuelCount}
        completedCount={completedCount}
        onBackToLive={onBackToLive}
      />

      <GigsLedgerTable
        jobs={jobs}
        vehicles={vehicles}
        fuelLogs={fuelLogs}
        totalGrossRevenue={totalGrossRevenue}
        netProfit={netProfit}
      />

      {/* TABLE 2: FUEL & AUDIT LOG */}
      <section className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-900">
            Fuel Receipts & Theft Audit Log ({fuelLogs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Tracks driver fuel claims, odometer readings, and automated anomaly
            flags
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Driver & Vehicle</th>
                <th className="px-5 py-3.5">Receipt / Station</th>
                <th className="px-5 py-3.5">Volume & Cost</th>
                <th className="px-5 py-3.5">Odometer</th>
                <th className="px-5 py-3.5">Audit Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fuelLogs.map((log) => {
                const truck = vehicles.find((v) => v._id === log.vehicleId);
                return (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {truck?.assignedDriverName || "Unknown"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {truck?.registration}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {log.receiptNote}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {log.liters}L • R{log.cost.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {log.odometerReading.toLocaleString()} km
                    </td>
                    <td className="px-5 py-4">
                      {log.isFlagged ? (
                        <span className="inline-flex rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                          ⚠ {log.flagReason}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          ✓ Verified Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
