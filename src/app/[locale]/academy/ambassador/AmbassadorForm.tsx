"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AmbassadorFormProps {
  locale: string;
}

export default function AmbassadorForm({}: AmbassadorFormProps) {
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState(2027);
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
        setError("You must be logged in to submit an ambassador application.");
        setLoading(false);
        return;
      }

      const query = supabase.from("student_ambassadors" as unknown as "incidents");
      const { error: insertError } = await (
        query as unknown as {
          insert: (p: unknown) => Promise<{ error: { message: string } | null }>;
        }
      ).insert({
        user_id: user.id,
        university,
        graduation_year: graduationYear,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      setMessage("Student ambassador application submitted successfully!");
      setUniversity("");
      setGraduationYear(2027);
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
          University Name
        </label>
        <input
          type="text"
          required
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="e.g. Istanbul Technical University"
          className="bg-bg-secondary border-border-primary/50 text-fg-primary placeholder-fg-secondary/50 focus:border-accent-soft w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-fg-secondary mb-2 block text-xs font-bold tracking-wider uppercase">
          Expected Graduation Year
        </label>
        <select
          value={graduationYear}
          onChange={(e) => setGraduationYear(Number(e.target.value))}
          className="bg-bg-secondary border-border-primary/50 text-fg-primary focus:border-accent-soft w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 focus:outline-none"
        >
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
          <option value={2028}>2028</option>
          <option value={2029}>2029</option>
          <option value={2030}>2030</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-accent-soft hover:bg-accent-soft/90 disabled:bg-accent-soft/50 text-bg-primary shadow-accent-soft/10 w-full rounded-2xl py-4 text-sm font-bold shadow-md transition duration-200"
      >
        {loading ? "Submitting..." : "Submit Ambassador Application"}
      </button>
    </form>
  );
}
