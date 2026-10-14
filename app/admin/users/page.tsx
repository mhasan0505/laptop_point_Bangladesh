"use client";

import * as React from "react";
import {
  PageHeader,
  SectionCard,
  DataTable,
  StatusBadge,
  FormField,
  ConfirmDialog,
} from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "marketing" | "support";
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<string | null>(null);

  // Create User Modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: "",
    email: "",
    role: "manager" as "owner" | "manager" | "marketing" | "support",
    password: "",
  });
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  // Reset Password Modal
  const [resetTarget, setResetTarget] = React.useState<AdminUserRecord | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [resetSubmitting, setResetSubmitting] = React.useState(false);
  const [resetError, setResetError] = React.useState<string | null>(null);

  // Role Change Modal
  const [roleTarget, setRoleTarget] = React.useState<AdminUserRecord | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<"owner" | "manager" | "marketing" | "support">("manager");
  const [roleSubmitting, setRoleSubmitting] = React.useState(false);

  // Confirm Action (Activate/Deactivate/Delete)
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "toggle-active" | "delete";
    user: AdminUserRecord;
  } | null>(null);
  const [confirmSubmitting, setConfirmSubmitting] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied: only owners can manage admin users.");
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Access denied: only owners can manage admin users.");
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load users");
        }
        const data = await res.json();
        if (!ignore) setUsers(data.users || []);
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Error loading users");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle Create User
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", role: "manager", password: "" });
      setNotification(`Created admin user ${data.user?.email}`);
      fetchUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;
    setResetSubmitting(true);
    setResetError(null);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setNotification(`Password successfully reset for ${resetTarget.email}`);
      setResetTarget(null);
      setNewPassword("");
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setRoleSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      setNotification(`Updated role for ${roleTarget.email} to ${selectedRole}`);
      setRoleTarget(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Role update failed");
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Handle Toggle Active or Delete
  const handleConfirm = async () => {
    if (!confirmAction) return;
    setConfirmSubmitting(true);
    try {
      if (confirmAction.type === "toggle-active") {
        const nextActive = !confirmAction.user.active;
        const res = await fetch(`/api/admin/users/${confirmAction.user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: nextActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        setNotification(`Account ${nextActive ? "activated" : "deactivated"} for ${confirmAction.user.email}`);
      } else if (confirmAction.type === "delete") {
        const res = await fetch(`/api/admin/users/${confirmAction.user.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");
        setNotification(`Deleted user ${confirmAction.user.email}`);
      }
      setConfirmAction(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setConfirmSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Admin Users"
        description="Manage system administrator accounts, security credentials, and access roles."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "System" },
          { label: "Users" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                fetchUsers();
              }}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin User
            </Button>
          </div>
        }
      />

      {notification && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-success/30 bg-success-soft text-success text-xs animate-in fade-in-50">
          <span>{notification}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setNotification(null)}
            className="h-5 px-1 text-[11px]"
          >
            Dismiss
          </Button>
        </div>
      )}

      <SectionCard title="Active Administrators" description="Accounts authorized to access the Laptop Point BD control panel">
        <DataTable
          data={users}
          keyExtractor={(u) => u.id}
          loading={loading}
          error={error}
          onRetry={fetchUsers}
          searchPlaceholder="Search by name, email, or role..."
          searchKey={(u) => `${u.name} ${u.email} ${u.role}`}
          columns={[
            {
              key: "name",
              header: "User",
              sortable: true,
              render: (u) => (
                <div>
                  <div className="font-semibold text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              sortable: true,
              render: (u) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(u.role);
                    setRoleTarget(u);
                  }}
                  className="h-6 px-2 text-xs font-semibold capitalize"
                  title="Click to change role"
                >
                  {u.role}
                </Button>
              ),
            },
            {
              key: "active",
              header: "Status",
              sortable: true,
              render: (u) => (
                <StatusBadge
                  status={u.active ? "active" : "inactive"}
                  label={u.active ? "Active" : "Disabled"}
                  size="sm"
                />
              ),
            },
            {
              key: "lastLoginAt",
              header: "Last Login",
              sortable: true,
              render: (u) => (
                <span className="text-xs text-muted-foreground">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (u) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewPassword("");
                      setResetError(null);
                      setResetTarget(u);
                    }}
                    title="Reset Password"
                    className="h-7 px-2 text-xs"
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        type: "toggle-active",
                        user: u,
                      })
                    }
                    className="h-7 px-2 text-xs"
                    title={u.active ? "Disable account" : "Enable account"}
                  >
                    {u.active ? (
                      <UserX className="h-3.5 w-3.5 text-warning" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5 text-success" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        type: "delete",
                        user: u,
                      })
                    }
                    className="h-7 px-2 text-xs text-danger hover:text-danger hover:bg-danger-soft"
                    title="Delete Account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </SectionCard>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {createError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-lg border border-danger/30 bg-danger-soft text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <FormField label="Full Name" required>
              <Input
                required
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                placeholder="e.g. Sarah Connor"
              />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                required
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="admin@laptoppointbd.com"
              />
            </FormField>

            <FormField label="Role" required description="Determines administrative permissions">
              <Select
                value={createForm.role}
                onValueChange={(val: string | null) => {
                  if (val) setCreateForm({ ...createForm, role: val as "owner" | "manager" | "marketing" | "support" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner (Full system control)</SelectItem>
                  <SelectItem value="manager">Manager (Products & Orders)</SelectItem>
                  <SelectItem value="marketing">Marketing (Deals & Banners)</SelectItem>
                  <SelectItem value="support">Support (Orders view & updates)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Temporary Password"
              required
              description="Minimum 8 characters. User will use this to sign in."
            >
              <Input
                required
                type="password"
                minLength={8}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                placeholder="••••••••••••"
              />
            </FormField>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={createSubmitting}
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSubmitting}>
                {createSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Update access level for <strong className="text-foreground">{roleTarget?.email}</strong>:
            </p>
            <Select
              value={selectedRole}
              onValueChange={(v: string | null) => {
                if (v) setSelectedRole(v as "owner" | "manager" | "marketing" | "support");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={roleSubmitting}
              onClick={() => setRoleTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={roleSubmitting}
              onClick={handleRoleChange}
            >
              {roleSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {resetError && (
              <div className="p-2.5 text-xs rounded-lg border border-danger/30 bg-danger-soft text-danger">
                {resetError}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Set a new password for <strong className="text-foreground">{resetTarget?.email}</strong>.
            </p>
            <FormField label="New Password" required>
              <Input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={resetSubmitting}
              onClick={() => setResetTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={resetSubmitting || newPassword.length < 8}
              onClick={handleResetPassword}
            >
              {resetSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate / Delete Action */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? "Delete Admin Account"
            : confirmAction?.user.active
            ? "Deactivate Account"
            : "Activate Account"
        }
        description={
          confirmAction?.type === "delete"
            ? `Are you sure you want to permanently delete the admin account for ${confirmAction?.user.email}? This action cannot be undone.`
            : `Are you sure you want to ${
                confirmAction?.user.active ? "disable" : "enable"
              } access for ${confirmAction?.user.email}?`
        }
        confirmText={
          confirmAction?.type === "delete"
            ? "Delete Account"
            : confirmAction?.user.active
            ? "Deactivate"
            : "Activate"
        }
        variant={confirmAction?.type === "delete" ? "danger" : "warning"}
        loading={confirmSubmitting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
