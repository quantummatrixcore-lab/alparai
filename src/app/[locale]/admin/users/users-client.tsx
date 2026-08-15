"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RoleSelect } from "@/components/admin/role-select";
import { formatDate } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Download,
  Mail,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { QuickActionGrid, type QuickAction } from "@/components/admin/quick-action-grid";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface UsersClientProps {
  users: Array<Record<string, unknown>>;
  userRole: "user" | "moderator" | "admin" | "ceo";
  locale: string;
}

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admins" },
  { value: "moderator", label: "Moderators" },
  { value: "user", label: "Users" },
];

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

export function UsersClient({ users, userRole, locale }: UsersClientProps) {
  const t = useTranslations("admin");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filtered = useMemo(
    () => (roleFilter === "all" ? users : users.filter((u) => u["role"] === roleFilter)),
    [users, roleFilter],
  );

  const adminCount = useMemo(
    () => users.filter((u) => u["role"] === "admin" || u["role"] === "ceo").length,
    [users],
  );
  const moderatorCount = useMemo(
    () => users.filter((u) => u["role"] === "moderator").length,
    [users],
  );
  const userCount = useMemo(() => users.filter((u) => u["role"] === "user").length, [users]);
  const verifiedCount = useMemo(() => users.filter((u) => u["is_verified"]).length, [users]);

  const roleDistribution = [
    { name: "Users", value: userCount },
    { name: "Admins", value: adminCount },
    { name: "Moderators", value: moderatorCount },
  ].filter((d) => d.value > 0);

  // Growth Data (to be fetched from database)
  const growthData = useMemo(() => {
    return [];
  }, []);

  const quickActions: QuickAction[] = [
    { id: "invite", icon: UserPlus, label: "Invite User", onClick: () => {} },
    {
      id: "moderators",
      icon: Shield,
      label: "Moderators",
      description: `${moderatorCount} active`,
      onClick: () => {},
    },
    { id: "export", icon: Download, label: "Export CSV", onClick: () => {} },
    { id: "contact", icon: Mail, label: "Contact All", onClick: () => {} },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  if (!isMounted) {
    return (
      <div className="bg-bg-secondary/40 flex h-96 w-full items-center justify-center rounded-2xl border border-white/5 backdrop-blur-xl">
        <Activity className="text-brand-400 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Premium Dashboard Metrics & Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Core KPI Summary */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:col-span-1">
          <div className="bg-bg-secondary/40 group relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:bg-emerald-500/20" />
            <div className="text-fg-muted mb-4 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase">
                {t("total_users") || "Total Users"}
              </span>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mb-1 flex items-end gap-2 text-4xl font-extrabold text-white">
              {users.length}
              <span className="mb-1 flex items-center text-sm font-bold text-emerald-400">
                <ArrowUpRight className="h-4 w-4" /> 12%
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge
                variant="success"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              >
                {verifiedCount} {t("verified") || "Verified"}
              </Badge>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-4">
            <div className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-5 shadow-lg backdrop-blur-xl">
              <div className="to-brand-500 absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500" />
              <div className="text-fg-muted mb-2 text-[10px] font-bold tracking-wider uppercase">
                {t("admins") || "Admins"}
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <Shield className="h-4 w-4 text-purple-400" /> {adminCount}
              </div>
            </div>
            <div className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-5 shadow-lg backdrop-blur-xl">
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <div className="text-fg-muted mb-2 text-[10px] font-bold tracking-wider uppercase">
                {t("moderators") || "Moderators"}
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> {moderatorCount}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Growth Area Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-bg-secondary/40 flex flex-col rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl lg:col-span-1"
        >
          <h3 className="mb-1 font-bold tracking-tight text-white">User Growth Trend</h3>
          <p className="text-fg-muted mb-6 text-xs">Monthly active registrations</p>
          <div className="min-h-[200px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickMargin={10}
                />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,10,10,0.9)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold", color: "#10b981" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Role Distribution Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-bg-secondary/40 flex flex-col rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl lg:col-span-1"
        >
          <h3 className="mb-1 font-bold tracking-tight text-white">Role Distribution</h3>
          <p className="text-fg-muted mb-2 text-xs">Platform authority segmentation</p>
          <div className="flex min-h-[200px] w-full flex-1 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,10,10,0.9)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {roleDistribution.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-white">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mb-4">
        <CreateUserModal
          triggerText={t("create_new_user_manually") || "Create New User Manually"}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <QuickActionGrid actions={quickActions} columns={4} />
      </motion.div>

      {users.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="border-border-subtle bg-bg-secondary/30 rounded-2xl border px-6 py-16 text-center backdrop-blur-sm"
        >
          <p className="text-fg-muted text-sm">{t("no_users")}</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <SegmentedControl options={roleOptions} value={roleFilter} onChange={setRoleFilter} />

          <Card className="bg-bg-secondary/40 overflow-hidden border-white/5 backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">{t("users")}</caption>
                  <thead>
                    <tr className="border-border-subtle text-fg-muted border-b bg-white/5 text-left text-xs font-semibold tracking-wider uppercase">
                      <th className="p-4">{t("name")}</th>
                      <th className="p-4">{t("email")}</th>
                      <th className="p-4">{t("role")}</th>
                      <th className="p-4">{t("status")}</th>
                      <th className="p-4 text-right">{t("joined")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border-subtle divide-y">
                    <AnimatePresence>
                      {filtered.map((u, i) => (
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={u["id"] as string}
                          className="hover:bg-bg-tertiary/50 transition-colors"
                        >
                          <td className="text-fg-primary p-4 font-medium">
                            {(u["full_name"] as string | null) ?? "—"}
                          </td>
                          <td className="text-fg-muted p-4 font-mono text-xs">
                            {(u["email"] as string) ?? "—"}
                          </td>
                          <td className="p-4">
                            <RoleSelect
                              userId={u["id"] as string}
                              currentRole={(u["role"] as string) ?? "user"}
                              currentUserRole={userRole}
                            />
                          </td>
                          <td className="p-4">
                            {u["is_verified"] ? (
                              <Badge
                                variant="success"
                                dot
                                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              >
                                {t("verified")}
                              </Badge>
                            ) : (
                              <Badge variant="muted" className="border-white/10 bg-white/5">
                                {t("active")}
                              </Badge>
                            )}
                          </td>
                          <td className="text-fg-muted p-4 text-right text-xs">
                            {formatDate(new Date(u["created_at"] as string), locale)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
