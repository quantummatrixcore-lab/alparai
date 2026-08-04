"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface FellowshipFormProps {
  locale: string;
}

export default function FellowshipForm({}: FellowshipFormProps) {
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to submit a fellowship application.");
        setLoading(false);
        return;
      }

      const query = supabase.from("fellowship_applications" as unknown as "incidents");
      const { error: insertError } = await (
        query as unknown as {
          insert: (p: unknown) => Promise<{ error: { message: string } | null }>;
        }
      ).insert({
        user_id: user.id,
        institution,
        department,
        proposal,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      setMessage("Fellowship application submitted successfully for review!");
      setInstitution("");
      setDepartment("");
      setProposal("");
    } catch (err: unknown) {
      console.error(err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to submit application. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-accent-soft/10 border-accent-soft/20 text-accent-soft rounded-2xl border p-4 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="text-fg-secondary mb-2 block text-xs font-bold tracking-wider uppercase">
          Academic Institution
        </label>
        <input
          type="text"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="e.g. Stanford University"
          className="bg-bg-secondary border-border-primary/50 text-fg-primary placeholder-fg-secondary/50 focus:border-accent-soft w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-fg-secondary mb-2 block text-xs font-bold tracking-wider uppercase">
          Department / Field of Study
        </label>
        <input
          type="text"
          required
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Computer Science / AI Safety Group"
          className="bg-bg-secondary border-border-primary/50 text-fg-primary placeholder-fg-secondary/50 focus:border-accent-soft w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-fg-secondary mb-2 block text-xs font-bold tracking-wider uppercase">
          Research Proposal Summary
        </label>
        <textarea
          required
          rows={4}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Describe your research objectives, expected models to audit, and resource requirements..."
          className="bg-bg-secondary border-border-primary/50 text-fg-primary placeholder-fg-secondary/50 focus:border-accent-soft w-full resize-none rounded-2xl border px-4 py-3 text-sm transition duration-200 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-accent-soft hover:bg-accent-soft/90 disabled:bg-accent-soft/50 text-bg-primary shadow-accent-soft/10 w-full rounded-2xl py-4 text-sm font-bold shadow-md transition duration-200"
      >
        {loading ? "Submitting..." : "Submit Fellowship Application"}
      </button>
    </form>
  );
}
