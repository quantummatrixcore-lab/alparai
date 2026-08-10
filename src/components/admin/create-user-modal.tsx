"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { createUserByAdmin } from "@/actions/admin-users";
import { UserPlus, Loader2 } from "lucide-react";

export function CreateUserModal({
  triggerText = "Invite User",
  onUserCreated,
}: {
  triggerText?: string;
  onUserCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "moderator" | "admin" | "ceo">("user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      toast.error("Email and Name are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createUserByAdmin({ email, fullName, role });
      if (res.ok) {
        toast.success(`User ${fullName} created successfully`);
        setOpen(false);
        // Reset form
        setEmail("");
        setFullName("");
        setRole("user");
        if (onUserCreated) onUserCreated();
      } else {
        toast.error(res.error || "Failed to create user");
      }
    } catch (_err: unknown) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "moderator", label: "Moderator" },
    { value: "admin", label: "Admin" },
    { value: "ceo", label: "CEO" },
  ];

  return (
    <>
      <Button
        variant="outline"
        className="border-brand-500/20 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 flex gap-2"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        {triggerText}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create New User"
        description="Manually create a new user account bypassing registration."
      >
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Atatürk"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-white/10 bg-black/50"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ataturk@alparai.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-black/50"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "moderator" | "admin" | "ceo")}
              disabled={isLoading}
              options={roleOptions}
              className="border-white/10 bg-black/50"
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="border-white/10 bg-transparent text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
