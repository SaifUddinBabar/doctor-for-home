"use client";

import { useState } from "react";

export interface AdminDoctorItem {
  id: string;
  specialization: string;
  qualifications: string | null;
  bmdcNumber: string;
  experienceYears: number;
  consultationFee: number;
  verificationStatus: string;
  verificationNotes: string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: Date | string;
  };
}

interface Props {
  initialDoctors: AdminDoctorItem[];
}

export default function AdminDoctorVerificationTable({ initialDoctors }: Props) {
  const [doctors, setDoctors] = useState<AdminDoctorItem[]>(initialDoctors);
  const [filter, setFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = doctors.filter((doc) => {
    if (filter === "ALL") return true;
    return doc.verificationStatus === filter;
  });

  async function handleStatusChange(doctorId: string, newStatus: string) {
    setLoadingId(doctorId);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update doctor verification status.");

      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, verificationStatus: newStatus } : d))
      );
      setMessage(`Doctor successfully marked as ${newStatus}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error updating status.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16C9E8]" />
            Doctor Verification &amp; BMDC Credential Approval
          </h2>
          <p className="mt-1 text-xs text-[#8794AD]">
            Review professional BMDC registration licenses before permitting clinical consultations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white/5 p-1 text-xs">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filter === tab ? "bg-[#16C9E8] text-[#080D23]" : "text-[#A2AEC3] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[#8794AD]">
              <th className="pb-3 font-semibold">Doctor Name</th>
              <th className="pb-3 font-semibold">BMDC Number</th>
              <th className="pb-3 font-semibold">Specialization</th>
              <th className="pb-3 font-semibold">Experience</th>
              <th className="pb-3 font-semibold">Fee (BDT)</th>
              <th className="pb-3 font-semibold">Current Status</th>
              <th className="pb-3 font-semibold text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? (
              filtered.map((doc) => {
                const isPending = doc.verificationStatus === "PENDING";
                const isApproved = doc.verificationStatus === "APPROVED";
                const isRejected = doc.verificationStatus === "REJECTED";
                const isSuspended = doc.verificationStatus === "SUSPENDED";
                const isLoading = loadingId === doc.id;

                return (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4">
                      <p className="font-bold text-white">Dr. {doc.user.name}</p>
                      <p className="text-[11px] text-[#8794AD]">{doc.user.email}</p>
                    </td>
                    <td className="py-4">
                      <span className="font-mono font-bold text-[#65DFF0] bg-white/5 px-2 py-0.5 rounded">
                        {doc.bmdcNumber}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-white">{doc.specialization}</td>
                    <td className="py-4 text-[#CBD5E5]">{doc.experienceYears} Yrs</td>
                    <td className="py-4 font-semibold text-[#24D6A0]">{doc.consultationFee} ৳</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300"
                            : isPending
                            ? "bg-amber-500/20 text-amber-300"
                            : isSuspended
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isApproved
                              ? "bg-emerald-400"
                              : isPending
                              ? "bg-amber-400 animate-pulse"
                              : "bg-rose-400"
                          }`}
                        />
                        {doc.verificationStatus}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isApproved && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(doc.id, "APPROVED")}
                            className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
                          >
                            {isLoading ? "..." : "Approve"}
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(doc.id, "REJECTED")}
                            className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 font-bold text-rose-300 hover:bg-rose-500/30 transition disabled:opacity-50"
                          >
                            {isLoading ? "..." : "Reject"}
                          </button>
                        )}
                        {isApproved && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(doc.id, "SUSPENDED")}
                            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
                          >
                            {isLoading ? "..." : "Suspend"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#8794AD]">
                  No doctors found matching the &quot;{filter}&quot; filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
