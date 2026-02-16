"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X, Power } from "lucide-react";
import {
  updateMaintenanceItem,
  deleteMaintenanceItem,
  toggleMaintenanceItemActive,
  addMaintenanceItem,
  applyConservativePreset,
  resetToFactoryDefaults,
} from "~/server/actions/maintenance";

interface MaintenanceItem {
  id: number;
  vehicleId: number;
  title: string;
  category: string;
  description: string | null;
  intervalMiles: number | null;
  intervalMonths: number | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  lastServicedDate: string | null;
  lastServicedMileage: number | null;
  isActive: boolean;
}

type DueStatus = "overdue" | "due-soon" | "upcoming" | "ok";

interface ItemWithStatus extends MaintenanceItem {
  dueStatus: DueStatus;
  milesUntilDue: number | null;
  daysUntilDue: number | null;
}

interface Props {
  items: MaintenanceItem[];
  currentMileage: number;
  vehicleId: number;
  isOwner: boolean;
  showAll?: boolean;
}

function computeStatus(item: MaintenanceItem, currentMileage: number): ItemWithStatus {
  let dueStatus: DueStatus = "ok";
  let milesUntilDue: number | null = null;
  let daysUntilDue: number | null = null;

  if (item.nextDueMileage !== null) {
    milesUntilDue = item.nextDueMileage - currentMileage;
    if (milesUntilDue <= 0) dueStatus = "overdue";
    else if (milesUntilDue <= 1000) dueStatus = "due-soon";
    else if (milesUntilDue <= 5000) dueStatus = "upcoming";
  }

  if (item.nextDueDate) {
    const diff = Math.ceil(
      (new Date(item.nextDueDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    daysUntilDue = diff;
    if (diff <= 0) dueStatus = "overdue";
    else if (diff <= 30 && dueStatus !== "overdue") dueStatus = "due-soon";
    else if (
      diff <= 90 &&
      dueStatus !== "overdue" &&
      dueStatus !== "due-soon"
    )
      dueStatus = "upcoming";
  }

  return { ...item, dueStatus, milesUntilDue, daysUntilDue };
}

const STATUS_ORDER: Record<DueStatus, number> = {
  overdue: 0,
  "due-soon": 1,
  upcoming: 2,
  ok: 3,
};

const STATUS_STYLES: Record<DueStatus, string> = {
  overdue: "bg-destructive/10 text-destructive",
  "due-soon": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  upcoming: "bg-primary/10 text-primary",
  ok: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<DueStatus, string> = {
  overdue: "Overdue",
  "due-soon": "Due Soon",
  upcoming: "Upcoming",
  ok: "OK",
};

const CATEGORY_STYLES: Record<string, string> = {
  fluid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  engine_drivetrain:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  consumable:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  inspection:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
};

const CATEGORY_LABELS: Record<string, string> = {
  fluid: "Fluid",
  engine_drivetrain: "Engine/Drivetrain",
  consumable: "Consumable",
  inspection: "Inspection",
  other: "Other",
};

const inputClass =
  "w-full rounded border border-input bg-transparent px-2 py-1 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";
const selectClass =
  "w-full rounded border border-input bg-transparent px-2 py-1 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

export function MaintenanceScheduleTable({
  items: initialItems,
  currentMileage,
  vehicleId,
  isOwner,
  showAll = false,
}: Props) {
  const [localItems, setLocalItems] = useState<MaintenanceItem[]>(initialItems);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMiles, setEditMiles] = useState("");
  const [editMonths, setEditMonths] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("fluid");
  const [newMiles, setNewMiles] = useState("");
  const [newMonths, setNewMonths] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const itemsWithStatus = useMemo(
    () => localItems.map((item) => computeStatus(item, currentMileage)),
    [localItems, currentMileage],
  );

  const displayed = useMemo(() => {
    let list = itemsWithStatus;
    if (!showAll) {
      list = list.filter((i) => i.isActive && i.dueStatus !== "ok");
    }
    return [...list].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      const sd = STATUS_ORDER[a.dueStatus] - STATUS_ORDER[b.dueStatus];
      if (sd !== 0) return sd;
      if (a.milesUntilDue !== null && b.milesUntilDue !== null)
        return a.milesUntilDue - b.milesUntilDue;
      if (a.daysUntilDue !== null && b.daysUntilDue !== null)
        return a.daysUntilDue - b.daysUntilDue;
      return a.title.localeCompare(b.title);
    });
  }, [itemsWithStatus, showAll]);

  function startEdit(item: ItemWithStatus) {
    setEditingId(item.id);
    setEditMiles(item.intervalMiles?.toString() ?? "");
    setEditMonths(item.intervalMonths?.toString() ?? "");
  }

  function handleSaveEdit(itemId: number) {
    const miles = editMiles ? parseInt(editMiles) : null;
    const months = editMonths ? parseInt(editMonths) : null;
    // Optimistic update
    setLocalItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, intervalMiles: miles, intervalMonths: months }
          : i,
      ),
    );
    setEditingId(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("itemId", String(itemId));
      if (editMiles) fd.set("intervalMiles", editMiles);
      if (editMonths) fd.set("intervalMonths", editMonths);
      await updateMaintenanceItem(fd);
    });
  }

  function handleToggle(itemId: number) {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isActive: !i.isActive } : i)),
    );
    startTransition(async () => {
      const fd = new FormData();
      fd.set("itemId", String(itemId));
      await toggleMaintenanceItemActive(fd);
    });
  }

  function handleDelete(itemId: number) {
    if (!confirm("Remove this maintenance item? This cannot be undone.")) return;
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      const fd = new FormData();
      fd.set("itemId", String(itemId));
      await deleteMaintenanceItem(fd);
    });
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vehicleId", String(vehicleId));
      fd.set("title", newTitle.trim());
      fd.set("category", newCategory);
      if (newMiles) fd.set("intervalMiles", newMiles);
      if (newMonths) fd.set("intervalMonths", newMonths);
      const inserted = await addMaintenanceItem(fd);
      if (inserted) {
        setLocalItems((prev) => [...prev, inserted]);
      }
      setNewTitle("");
      setNewMiles("");
      setNewMonths("");
      setNewCategory("fluid");
      setShowAddForm(false);
    });
  }

  function handleConservativePreset() {
    if (!confirm("Apply 25% more conservative intervals to all active items?"))
      return;
    // Optimistic
    setLocalItems((prev) =>
      prev.map((i) => ({
        ...i,
        intervalMiles:
          i.isActive && i.intervalMiles
            ? Math.floor(i.intervalMiles * 0.75)
            : i.intervalMiles,
      })),
    );
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vehicleId", String(vehicleId));
      await applyConservativePreset(fd);
    });
  }

  function handleResetFactory() {
    if (
      !confirm(
        "Reset to factory defaults? All current items will be replaced. This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vehicleId", String(vehicleId));
      await resetToFactoryDefaults(fd);
      router.refresh();
    });
  }

  const isEmpty = displayed.length === 0 && !showAddForm;

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : ""}>
      {/* Owner preset toolbar */}
      {isOwner && showAll && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConservativePreset}
            disabled={isPending}
            className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            25% More Conservative
          </button>
          <button
            type="button"
            onClick={handleResetFactory}
            disabled={isPending}
            className="rounded border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            Reset to Factory
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {showAll
            ? "No maintenance items yet."
            : "All caught up! No upcoming maintenance."}
          {isOwner && showAll && (
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-2 text-primary underline"
            >
              Add your first item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((item) => (
            <MaintenanceRow
              key={item.id}
              item={item}
              isOwner={isOwner}
              showAll={showAll}
              isEditing={editingId === item.id}
              editMiles={editMiles}
              editMonths={editMonths}
              onEditMilesChange={setEditMiles}
              onEditMonthsChange={setEditMonths}
              onEdit={() => startEdit(item)}
              onSave={() => handleSaveEdit(item.id)}
              onCancel={() => setEditingId(null)}
              onToggle={() => handleToggle(item.id)}
              onDelete={() => handleDelete(item.id)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Add item */}
      {isOwner && showAll && (
        <div className="mt-3">
          {showAddForm ? (
            <form
              onSubmit={handleAddItem}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="mb-3 text-sm font-medium">New Maintenance Item</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Title *
                  </label>
                  <input
                    className={inputClass}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Engine Oil Change"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Category *
                  </label>
                  <select
                    className={selectClass}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="fluid">Fluid</option>
                    <option value="engine_drivetrain">Engine/Drivetrain</option>
                    <option value="consumable">Consumable</option>
                    <option value="inspection">Inspection</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Every (mi)
                    </label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="100"
                      value={newMiles}
                      onChange={(e) => setNewMiles(e.target.value)}
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Every (mo)
                    </label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      value={newMonths}
                      onChange={(e) => setNewMonths(e.target.value)}
                      placeholder="—"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isPending || !newTitle.trim()}
                  className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check size={14} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-1.5 rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Plus size={16} /> Add Maintenance Item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MaintenanceRow({
  item,
  isOwner,
  showAll,
  isEditing,
  editMiles,
  editMonths,
  onEditMilesChange,
  onEditMonthsChange,
  onEdit,
  onSave,
  onCancel,
  onToggle,
  onDelete,
  isPending,
}: {
  item: ItemWithStatus;
  isOwner: boolean;
  showAll: boolean;
  isEditing: boolean;
  editMiles: string;
  editMonths: string;
  onEditMilesChange: (v: string) => void;
  onEditMonthsChange: (v: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const catStyle = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.other!;
  const catLabel = CATEGORY_LABELS[item.category] ?? item.category;
  const inactive = !item.isActive;

  function formatDueInfo() {
    const parts: string[] = [];
    if (item.milesUntilDue !== null) {
      parts.push(
        item.milesUntilDue <= 0
          ? `${Math.abs(item.milesUntilDue).toLocaleString()} mi overdue`
          : `${item.milesUntilDue.toLocaleString()} mi`,
      );
    }
    if (item.daysUntilDue !== null) {
      parts.push(
        item.daysUntilDue <= 0
          ? `${Math.abs(item.daysUntilDue)} days overdue`
          : `${item.daysUntilDue} days`,
      );
    }
    return parts.join(" / ");
  }

  function formatInterval() {
    const parts: string[] = [];
    if (item.intervalMiles) parts.push(`${item.intervalMiles.toLocaleString()} mi`);
    if (item.intervalMonths) parts.push(`${item.intervalMonths} mo`);
    return parts.join(" / ") || "—";
  }

  return (
    <div
      className={`rounded-lg border border-border bg-card p-3 shadow-sm transition-opacity ${
        inactive ? "opacity-50" : ""
      }`}
    >
      {!isEditing ? (
        <div className="flex items-start gap-3">
          {/* Status + info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {!inactive && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.dueStatus]}`}
                >
                  {STATUS_LABELS[item.dueStatus]}
                </span>
              )}
              {inactive && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Inactive
                </span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catStyle}`}>
                {catLabel}
              </span>
            </div>
            <p className="mt-1 font-medium leading-tight">{item.title}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {!inactive && item.dueStatus !== "ok" && (
                <span>{formatDueInfo()}</span>
              )}
              <span>Every {formatInterval()}</span>
              {item.lastServicedDate && (
                <span>
                  Last:{" "}
                  {new Date(item.lastServicedDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  {item.lastServicedMileage &&
                    ` @ ${item.lastServicedMileage.toLocaleString()} mi`}
                </span>
              )}
            </div>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={onEdit}
                disabled={isPending}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Edit intervals"
              >
                <Pencil size={15} />
              </button>
              {showAll && (
                <>
                  <button
                    onClick={onToggle}
                    disabled={isPending}
                    className={`rounded p-1.5 disabled:opacity-50 ${
                      item.isActive
                        ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "text-primary hover:bg-primary/10"
                    }`}
                    aria-label={item.isActive ? "Deactivate" : "Activate"}
                    title={item.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power size={15} />
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={isPending}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Inline edit form */
        <div>
          <p className="mb-2 font-medium">{item.title}</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Every (mi)
              </label>
              <input
                className={`${inputClass} w-28`}
                type="number"
                min="0"
                step="100"
                value={editMiles}
                onChange={(e) => onEditMilesChange(e.target.value)}
                placeholder="—"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Every (mo)
              </label>
              <input
                className={`${inputClass} w-20`}
                type="number"
                min="0"
                value={editMonths}
                onChange={(e) => onEditMonthsChange(e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={isPending}
                className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check size={14} /> Save
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1 rounded border border-input px-3 py-1.5 text-sm hover:bg-muted"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
