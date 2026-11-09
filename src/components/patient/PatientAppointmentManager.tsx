"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  appointmentType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  patientName: string;
  doctor?: {
    user: {
      name: string;
      email: string;
      phone?: string;
    };
  } | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function PatientAppointmentManager({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Poll latest appointments & notifications without forcing unnecessary re-renders
  const pollData = useCallback(async () => {
    try {
      const [aptRes, notifRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/notifications"),
      ]);

      if (aptRes.ok && isMountedRef.current) {
        const aptData = await aptRes.json();
        if (Array.isArray(aptData.appointments)) {
          setAppointments((prev) => {
            const next = aptData.appointments;
            if (
              prev.length === next.length &&
              prev.every((p, i) => p.id === next[i]?.id && p.status === next[i]?.status)
            ) {
              return prev; // No visual change -> preserve identity to prevent flashing!
            }
            return next;
          });
        }
      }

      if (notifRes.ok && isMountedRef.current) {
        const notifData = await notifRes.json();
        const incomingNotifs = notifData.notifications || [];
        setNotifications((prev) => {
          if (
            prev.length === incomingNotifs.length &&
            prev.every((n, i) => n.id === incomingNotifs[i]?.id && n.isRead === incomingNotifs[i]?.isRead)
          ) {
            return prev; // No change -> preserve identity!
          }
          return incomingNotifs;
        });

        const newUnread = notifData.unreadCount || 0;
        setUnreadCount((prev) => (prev === newUnread ? prev : newUnread));
      }
    } catch (err) {
      console.warn("Polling error:", err);
    }
  }, []);

  useEffect(() => {
    // Only poll periodically, avoid immediate double-rendering on mount
    const interval = setInterval(pollData, 10000);
    return () => clearInterval(interval);
  }, [pollData]);

  // Handle Cancel Appointment
  async function handleCancel(appointmentId: string) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setLoadingActionId(appointmentId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", reason: "Cancelled by patient from dashboard." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel appointment.");

      setStatusMessage("Appointment successfully cancelled.");
      await pollData();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setLoadingActionId(null);
    }
  }

  // Mark all notifications read
  async function markAllNotificationsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="p-3 bg-blue-500/20 border border-blue-400/40 rounded-xl text-xs text-blue-200 font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white hover:text-cyan-300">✕</button>
        </div>
      )}

      {/* Real-time Appointments Section */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16C9E8]" />
            <h2 className="text-lg font-bold text-white">Your Appointments &amp; Consultations</h2>
            <span className="text-[10px] bg-white/10 text-cyan-300 px-2 py-0.5 rounded-full font-mono">Live Sync</span>
          </div>
          <Link href="/find-a-doctor" className="text-xs font-semibold text-[#16C9E8] hover:underline">
            + Book New
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="mt-4 divide-y divide-white/5">
            {appointments.map((apt) => {
              const isPending = apt.status === "PENDING";
              const isConfirmed = apt.status === "CONFIRMED";
              const isCancelled = apt.status === "CANCELLED";
              const isRejected = apt.status === "REJECTED";
              const isCompleted = apt.status === "COMPLETED";

              return (
                <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
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

                    <p className="mt-2 text-sm font-semibold text-white">
                      Doctor: {apt.doctor?.user?.name ? `Dr. ${apt.doctor.user.name}` : "Doctor Assigned"}
                    </p>
                    <p className="text-xs text-[#8794AD]">
                      Scheduled: <strong>{apt.scheduledDate}</strong> at <strong>{apt.scheduledTime}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(isPending || isConfirmed) && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={loadingActionId === apt.id}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                      >
                        {loadingActionId === apt.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-blue-300 font-semibold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        Consultation Completed
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
              🩺
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">No active appointments yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[#8794AD]">
              Browse verified doctors and book an in-person home visit or online video consultation.
            </p>
            <Link
              href="/find-a-doctor"
              className="mt-4 inline-block rounded-xl bg-[#16C9E8]/20 border border-[#16C9E8]/40 px-4 py-2 text-xs font-bold text-[#65DFF0] hover:bg-[#16C9E8]/30"
            >
              Browse Available Doctors
            </Link>
          </div>
        )}
      </div>

      {/* Real-time In-App Notification Center */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">In-App Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-3 text-xs transition border ${
                  n.isRead
                    ? "bg-white/5 border-white/5 opacity-80"
                    : "bg-cyan-500/10 border-cyan-500/30 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{n.title}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-[#A2AEC3] leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#8794AD] text-center py-4">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
