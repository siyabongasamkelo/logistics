import React from "react";

interface AnalyticsKPIsProps {
  totalGrossRevenue: number;
  totalActualFuel: number;
  netProfit: number;
  jobsCount: number;
  fuelLogsCount: number;
  flaggedFuelCount: number;
  completedCount: number;
  onBackToLive: () => void;
}

export const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({
  totalGrossRevenue,
  totalActualFuel,
  netProfit,
  jobsCount,
  fuelLogsCount,
  flaggedFuelCount,
  completedCount,
  onBackToLive,
}) => {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Client revenue ledger, driver trip performance, and fuel theft audit
            logs.
          </p>
        </div>

        <button
          onClick={onBackToLive}
          className="self-start sm:self-auto rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
        >
          ← Return to Live Dispatch
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-amber-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Gross Billed Revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            R{totalGrossRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Across {jobsCount} total client tickets
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Actual Fuel Spend
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            R{totalActualFuel.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {fuelLogsCount} receipts logged
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-emerald-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Net Operating Profit
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            R{netProfit.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Revenue minus verified fuel
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-rose-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
            Fuel Anomaly Alerts
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {flaggedFuelCount} {flaggedFuelCount === 1 ? "Alert" : "Alerts"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {completedCount} trips completed so far
          </p>
        </div>
      </div>
    </>
  );
};
