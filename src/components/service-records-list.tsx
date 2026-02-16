"use client";

import { useState } from "react";
import Link from "next/link";

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

interface ServiceRecordsListProps {
  records: ServiceRecord[];
  currentCategory: string;
  isLoggedIn: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "fluid", label: "Fluids" },
  { value: "engine_drivetrain", label: "Engine/Drivetrain" },
  { value: "consumable", label: "Consumables" },
  { value: "inspection", label: "Inspections" },
  { value: "other", label: "Other" },
];

export function ServiceRecordsList({
  records,
  currentCategory,
  isLoggedIn,
}: ServiceRecordsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ??
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
      record.partsBrand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search service records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-input w-full rounded border px-4 py-2"
        />
      </div>

      {/* Category Tabs */}
      <div className="border-input mb-6 flex gap-2 border-b">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/vehicle/history?category=${cat.value}`}
            className={`px-4 py-2 ${
              currentCategory === cat.value
                ? "border-primary text-primary border-b-2 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <p className="text-muted-foreground">No service records found.</p>
        ) : (
          filteredRecords.map((record) => (
            <ServiceRecordCard
              key={record.id}
              record={record}
              isLoggedIn={isLoggedIn}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ServiceRecordCard({
  record,
  isLoggedIn,
}: {
  record: ServiceRecord;
  isLoggedIn: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border-border bg-card rounded-lg border p-4 shadow-sm">
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span>{formatDate(record.serviceDate)}</span>
            <span>•</span>
            <span>{record.mileage.toLocaleString()} miles</span>
          </div>
          <h3 className="mt-1 text-xl font-semibold">{record.title}</h3>
          <div className="mt-2 flex items-center gap-4 text-sm">
            {record.partsBrand && (
              <span className="text-muted-foreground">{record.partsBrand}</span>
            )}
            {record.totalCost && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-primary font-medium">
                  ${parseFloat(record.totalCost).toFixed(2)} total
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80"
          >
            {isExpanded ? "Hide Details" : "View Details"}
          </button>
          {isLoggedIn && (
            <>
              <button className="text-muted-foreground hover:text-foreground">
                Edit
              </button>
              <button className="text-destructive hover:text-destructive/80">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-border mt-4 border-t pt-4">
          {record.location && (
            <div className="mb-2">
              <span className="font-semibold">Location: </span>
              {record.location}
            </div>
          )}
          {record.description && (
            <div className="mb-2">
              <span className="font-semibold">Description: </span>
              {record.description}
            </div>
          )}
          {record.partNumber && (
            <div className="mb-2">
              <span className="font-semibold">Part Number: </span>
              {record.partNumber}
            </div>
          )}
          {(record.laborCost ?? record.partsCost) && (
            <div className="border-border mt-3 border-t pt-3">
              <div className="font-semibold">Cost Breakdown:</div>
              {record.partsCost && (
                <div className="mt-1">
                  Parts: ${parseFloat(record.partsCost).toFixed(2)}
                </div>
              )}
              {record.laborCost && (
                <div className="mt-1">
                  Labor: ${parseFloat(record.laborCost).toFixed(2)}
                </div>
              )}
            </div>
          )}
          {record.notes && (
            <div className="mt-3">
              <span className="font-semibold">Notes: </span>
              {record.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
