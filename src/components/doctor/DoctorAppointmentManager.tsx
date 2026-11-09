"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Appointment {
  id: string;
  patientId: string;
  appointmentType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  address?: string | null;
  notes?: string | null;
  patient?: {
    user?: {
      name: string;
      email: string;
    };
  } | null;
}

export default function DoctorAppointmentManager({
  initialAppointments,
  isApproved,
}: {
  initialAppointments: Appointment[];
  isApproved: boolean;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        if (Array.isArray(data.appointments)) {
          setAppointments((prev) => {
            const next = data.appointments;
            if (
              prev.length === next.length &&
              prev.every((p, i) => p.id === next[i]?.id && p.status === next[i]?.status)
            ) {
              return prev; // Reference unchanged -> skips re-render!
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.warn("Polling error:", err);
    }
  }, []);

  useEffect(() => {
    // Only poll periodically, avoid immediate double-rendering on mount
    const timer = setInterval(fetchAppointments, 10000);
    return () => clearInterval(timer);
  }, [fetchAppointments]);

  async function updateStatus(appointmentId: string, status: "CONFIRMED" | "REJECTED" | "COMPLETED") {
    setActionLoadingId(appointmentId);
    setFeedback(null);

    let reason = "";
    if (status === "REJECTED") {
      const promptReason = prompt("Reason for declining appointment request (optional):");
      if (promptReason === null) {
        setActionLoadingId(null);
        return; // User cancelled
      }
      reason = promptReason;
    }

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to set status to ${status}`);

      setFeedback({ message: `Appointment ${status.toLowerCase()} successfully.`, type: "success" });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : "Operation failed", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#24D6A0]" />
          <h2 className="text-lg font-bold text-white">Patient Consultation Requests</h2>
          <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Live Sync</span>
        </div>
        <span className="text-xs text-[#8794AD]">Active Schedule: {appointments.length} Total</span>
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {appointments.length > 0 ? (
        <div className="mt-4 divide-y divide-white/5">
          {appointments.map((apt) => {
            const isPending = apt.status === "PENDING";
            const isConfirmed = apt.status === "CONFIRMED";
            const isCompleted = apt.status === "COMPLETED";
            const isRejected = apt.status === "REJECTED";
            const isCancelled = apt.status === "CANCELLED";

            return (
              <div key={apt.id} className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                      {apt.appointmentType}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isConfirmed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      isPending ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      isCompleted ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30" :
                      isRejected ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white">
                    Patient: {apt.patientName} {apt.patientPhone && `(${apt.patientPhone})`}
                  </p>
                  <p className="text-xs text-[#8794AD]">
                    Date: <strong className="text-white">{apt.scheduledDate}</strong> at <strong className="text-white">{apt.scheduledTime}</strong>
                  </p>
                  {apt.address && (
                    <p className="text-xs text-[#8794AD]">Address: {apt.address}</p>
                  )}
                  {apt.notes && (
                    <p className="text-xs text-amber-200/80 italic">Notes: &quot;{apt.notes}&quot;</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPending && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, "CONFIRMED")}
                        disabled={actionLoadingId === apt.id || !isApproved}
                        className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                      >
                        {actionLoadingId === apt.id ? "Updating..." : "Accept"}
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, "REJECTED")}
                        disabled={actionLoadingId === apt.id}
                        className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => updateStatus(apt.id, "COMPLETED")}
                      disabled={actionLoadingId === apt.id}
                      className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                    >
                      {actionLoadingId === apt.id ? "Updating..." : "Mark Completed"}
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-xs text-cyan-400 font-semibold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      ✓ Consultation Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
            📅
          </div>
          <h3 className="mt-3 text-sm font-bold text-white">No incoming patient bookings yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#8794AD]">
            {isApproved
              ? "Your profile is published and active. When patients book visits, requests appear here immediately."
              : "Once verified by the clinical administrator, your profile will be open for patient bookings."}
          </p>
        </div>
      )}
    </div>
  );
}
