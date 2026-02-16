"use client";

import { useState, useTransition } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteServiceRecord } from "~/server/actions/service-records";

interface ServiceRecord {
  id: number;
  vehicleId: number;
  title: string;
  category: string;
  serviceDate: string;
  mileage: number;
  location: string | null;
  description: string | null;
  partsBrand: string | null;
  partNumber: string | null;
  laborCost: string | null;
  partsCost: string | null;
  totalCost: string | null;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  fluid: {
    label: "Fluid",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  engine_drivetrain: {
    label: "Engine/Drivetrain",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  consumable: {
    label: "Consumable",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  inspection: {
    label: "Inspection",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  other: { label: "Other", className: "bg-muted text-muted-foreground" },
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "fluid", label: "Fluids" },
  { value: "engine_drivetrain", label: "Engine/Drivetrain" },
  { value: "consumable", label: "Consumables" },
  { value: "inspection", label: "Inspections" },
  { value: "other", label: "Other" },
];

interface OwnerServiceRecordsListProps {
  records: ServiceRecord[];
}

export function OwnerServiceRecordsList({ records: initialRecords }: OwnerServiceRecordsListProps) {
  const [records, setRecords] = useState(initialRecords);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = (recordId: number) => {
    if (!confirm("Delete this service record? This cannot be undone.")) return;

    setRecords((prev) => prev.filter((r) => r.id !== recordId));

    const formData = new FormData();
    formData.set("recordId", String(recordId));

    startTransition(async () => {
      await deleteServiceRecord(formData);
    });
  };

  const filtered = records.filter((r) => {
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (r.partsBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border border-input px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
        />
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-input pb-px">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`whitespace-nowrap px-4 py-2 text-sm ${
              activeCategory === cat.value
                ? "border-b-2 border-primary font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No service records found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <ServiceRecordRow
              key={record.id}
              record={record}
              onDelete={handleDelete}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceRecordRow({
  record,
  onDelete,
  isPending,
}: {
  record: ServiceRecord;
  onDelete: (id: number) => void;
  isPending: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cat = CATEGORY_STYLES[record.category] ?? CATEGORY_STYLES.other!;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.className}`}>
              {cat.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(record.serviceDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-muted-foreground">
              {record.mileage.toLocaleString()} mi
            </span>
            {record.totalCost && (
              <span className="text-xs font-medium text-primary">
                ${parseFloat(record.totalCost).toFixed(2)}
              </span>
            )}
          </div>
          <h3 className="mt-1 font-semibold">{record.title}</h3>
          {record.description && !isExpanded && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {record.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => onDelete(record.id)}
            disabled={isPending}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Delete record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          {record.location && (
            <div>
              <span className="font-medium">Location: </span>
              {record.location}
            </div>
          )}
          {record.description && (
            <div>
              <span className="font-medium">Description: </span>
              {record.description}
            </div>
          )}
          {record.partsBrand && (
            <div>
              <span className="font-medium">Parts Brand: </span>
              {record.partsBrand}
            </div>
          )}
          {record.partNumber && (
            <div>
              <span className="font-medium">Part Number: </span>
              {record.partNumber}
            </div>
          )}
          {(record.laborCost ?? record.partsCost) && (
            <div className="rounded bg-muted/50 p-2">
              <div className="font-medium">Cost Breakdown</div>
              {record.partsCost && (
                <div className="text-muted-foreground">
                  Parts: ${parseFloat(record.partsCost).toFixed(2)}
                </div>
              )}
              {record.laborCost && (
                <div className="text-muted-foreground">
                  Labor: ${parseFloat(record.laborCost).toFixed(2)}
                </div>
              )}
            </div>
          )}
          {record.notes && (
            <div>
              <span className="font-medium">Notes: </span>
              {record.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
