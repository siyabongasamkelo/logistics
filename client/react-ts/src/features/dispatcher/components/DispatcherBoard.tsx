import React, { useState } from "react";
import { useDispatcher } from "../context/DispatcherContext";
import type { DeliveryJob } from "../types/dispatcher.types";
import { Navbar } from "./Navbar";
import { DispatchModal } from "./DispatchModal";
import { MissionDrawer } from "./MissionDrawer";
import { CreateJobModal } from "./CreateJobModal";
import { AddVehicleModal } from "./AddVehicleModal";
import { OperationsAnalytics } from "./OperationsAnalytics";

export const DispatcherBoard: React.FC = () => {
  const {
    vehicles,
    fuelLogs,
    availableVehicles,
    availableJobs,
    activeMissions,
    flaggedFuelCount,
    isLoading,
    isDispatching,
    error,
    dispatchJob,
    updateStatus,
    submitFuelLog,
    addJob,
    addVehicle,
  } = useDispatcher();

  const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null);
  const [inspectingMission, setInspectingMission] =
    useState<DeliveryJob | null>(null);
  const [activeRole, setActiveRole] = useState<"OWNER" | "DISPATCHER">(
    "DISPATCHER",
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [activeView, setActiveView] = useState<"LIVE" | "ANALYTICS">("LIVE");

  const handleConfirmDispatch = async (jobId: string, vehicleId: string) => {
    const success = await dispatchJob(jobId, vehicleId);
    if (success) setSelectedJob(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Loading Fleet Command Center...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {activeView === "ANALYTICS" ? (
        <OperationsAnalytics onBackToLive={() => setActiveView("LIVE")} />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {/* ...your existing 3-column board... */}
        </main>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dispatch Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Match incoming freight requests with available fleet capacity in
              real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="relative">
              <button
                onClick={() => setIsNewMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <span>+ New</span>
                <span className="text-[10px] opacity-80">▾</span>
              </button>

              {isNewMenuOpen && (
                <div
                  onMouseLeave={() => setIsNewMenuOpen(false)}
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 z-40"
                >
                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setIsCreateOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span>📦</span> New Delivery Ticket
                  </button>
                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setIsAddVehicleOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span>🚚</span> Add Fleet Vehicle
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 shadow-xs border border-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-slate-500">Pending Loads:</span>
              <span className="text-slate-900 font-bold">
                {availableJobs.length}
              </span>
            </div>
            {flaggedFuelCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3.5 py-2 shadow-xs border border-rose-200 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                <span>Fuel Alerts:</span>
                <span className="font-bold">{flaggedFuelCount}</span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 shadow-xs border border-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Ready Trucks:</span>
              <span className="text-slate-900 font-bold">
                {availableVehicles.length}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* COLUMN 1: AVAILABLE JOBS */}
          <section className="rounded-2xl bg-slate-100/70 p-4 sm:p-5 border border-slate-200/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Incoming Requests
              </h2>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {availableJobs.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {availableJobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
                  All jobs dispatched
                </div>
              )}
              {availableJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl bg-white p-4 shadow-xs border border-slate-200/80 hover:border-indigo-200 transition"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {job.weightKg.toLocaleString()} kg
                    </span>
                    {activeRole === "OWNER" && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +R
                        {(
                          job.clientPrice - job.estimatedFuelCost
                        ).toLocaleString()}{" "}
                        est.
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug">
                    {job.pickupLocation} → {job.dropoffLocation}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.clientName} • {job.cargoDescription}
                  </p>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                  >
                    Assign Vehicle
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 2: ACTIVE MISSIONS */}
          <section className="rounded-2xl bg-slate-100/70 p-4 sm:p-5 border border-slate-200/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Active Missions
              </h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                {activeMissions.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {activeMissions.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
                  No active missions
                </div>
              )}
              {activeMissions.map((mission) => {
                const truck = vehicles.find(
                  (v) => v._id === mission.assignedVehicleId,
                );
                return (
                  <div
                    key={mission._id}
                    className="rounded-xl bg-white p-4 shadow-xs border-l-4 border-l-indigo-600 border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition"
                    onClick={() => setInspectingMission(mission)}
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[11px] font-bold tracking-wide text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                        {mission.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        {truck?.registration}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 leading-snug">
                      {mission.pickupLocation} → {mission.dropoffLocation}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5">
                      Driver:{" "}
                      <strong className="text-slate-700">
                        {truck?.assignedDriverName || "Unassigned"}
                      </strong>{" "}
                      • {truck?.model}
                    </p>
                    {/* <label>Inspect & Fuel →</label> */}
                  </div>
                );
              })}
            </div>
          </section>

          {/* COLUMN 3: FLEET STATUS */}
          <section className="rounded-2xl bg-slate-100/70 p-4 sm:p-5 border border-slate-200/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Fleet & Vehicles
              </h2>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {vehicles.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {vehicles.map((vehicle) => {
                const badgeStyle =
                  vehicle.status === "READY"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                    : vehicle.status === "ON_TRIP"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                      : "bg-rose-50 text-rose-700 border-rose-200/80";

                return (
                  <div
                    key={vehicle._id}
                    className="rounded-xl bg-white p-4 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {vehicle.model}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">
                          {vehicle.registration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {vehicle.assignedDriverName} • Max{" "}
                        {vehicle.capacityKg.toLocaleString()}kg
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeStyle}`}
                    >
                      {vehicle.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <DispatchModal
        job={selectedJob}
        availableVehicles={availableVehicles}
        isDispatching={isDispatching}
        onClose={() => setSelectedJob(null)}
        onConfirm={handleConfirmDispatch}
      />

      <MissionDrawer
        mission={
          activeMissions.find((m) => m._id === inspectingMission?._id) || null
        }
        vehicle={vehicles.find(
          (v) => v._id === inspectingMission?.assignedVehicleId,
        )}
        fuelLogs={fuelLogs}
        isSubmitting={isDispatching}
        onClose={() => setInspectingMission(null)}
        onUpdateStatus={updateStatus}
        onLogFuel={submitFuelLog}
      />

      <CreateJobModal
        isOpen={isCreateOpen}
        isSubmitting={isDispatching}
        onClose={() => setIsCreateOpen(false)}
        onCreate={addJob}
      />

      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        isSubmitting={isDispatching}
        onClose={() => setIsAddVehicleOpen(false)}
        onCreate={addVehicle}
      />
    </div>
  );
};
