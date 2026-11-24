import React, { useState } from "react";
import { useDispatcher } from "../context/DispatcherContext";
import type { FuelLog } from "../types/dispatcher.types";
import { AnalyticsKPIs } from "./AnalyticsKPIs";
import { GigsLedgerTable } from "./GigsLedgerTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OperationsAnalyticsProps {
  onBackToLive: () => void;
}

export const OperationsAnalytics: React.FC<OperationsAnalyticsProps> = ({
  onBackToLive,
}) => {
  const {
    jobs,
    vehicles,
    fuelLogs,
    flaggedFuelCount,
    isDispatching,
    resolveFuelFlag,
  } = useDispatcher();

  const [resolvingLog, setResolvingLog] = useState<FuelLog | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const totalGrossRevenue = jobs.reduce((sum, job) => sum + job.clientPrice, 0);
  const totalActualFuel = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const netProfit = totalGrossRevenue - totalActualFuel;
  const completedCount = jobs.filter((j) => j.status === "DELIVERED").length;

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingLog || !resolutionNote.trim()) return;

    const ok = await resolveFuelFlag(resolvingLog._id, resolutionNote);
    if (ok) {
      setResolvingLog(null);
      setResolutionNote("");
    }
  };

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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                            ⚠ {log.flagReason}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setResolvingLog(log);
                              setResolutionNote("");
                            }}
                            className="h-7 border-slate-300 px-2.5 text-[11px] font-semibold hover:bg-slate-900 hover:text-white"
                          >
                            Resolve
                          </Button>
                        </div>
                      ) : log.resolutionNote ? (
                        <div className="space-y-1">
                          <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                            ✓ Reviewed & Cleared
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Note: {log.resolutionNote}
                          </p>
                        </div>
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

      {/* RESOLUTION DIALOG */}
      <Dialog
        open={!!resolvingLog}
        onOpenChange={(open) => !open && setResolvingLog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              Resolve Fuel Consumption Alert
            </DialogTitle>
            <DialogDescription className="text-xs">
              {resolvingLog?.flagReason}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmResolve} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="resolutionNote" className="text-xs">
                Driver Explanation / Office Review Outcome
              </Label>
              <Input
                id="resolutionNote"
                placeholder="e.g. Spoke to Bongani — 3hr delay idling at Harbour gate"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setResolvingLog(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isDispatching || !resolutionNote.trim()}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {isDispatching ? "Saving..." : "Save & Clear Alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
