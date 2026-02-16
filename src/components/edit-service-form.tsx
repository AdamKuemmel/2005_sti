"use client";

import { useState } from "react";
import { updateServiceRecord } from "~/server/actions/service-records";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
}

interface StepPhoto {
  id: number;
  fileUrl: string;
  fileKey: string | null;
}

interface RecordStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string | null;
  photos: StepPhoto[];
}

interface RecordDocument {
  id: number;
  fileUrl: string;
  fileKey: string | null;
  fileType: string;
}

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
  notes: string | null;
  steps: RecordStep[];
  documents: RecordDocument[];
}

interface Step {
  id: string;
  title: string;
  description: string;
  photos: { fileUrl: string; fileKey: string }[];
}

interface ServiceDocumentUpload {
  fileUrl: string;
  fileKey: string;
  fileType: string;
}

interface EditServiceFormProps {
  record: ServiceRecord;
  vehicle: Vehicle;
}

const SERVICE_TITLES = {
  fluid: [
    "Engine Oil Change",
    "Transmission Fluid Change",
    "Front Differential Fluid Change",
    "Rear Differential Fluid Change",
    "Coolant Flush",
    "Brake Fluid Flush",
    "Power Steering Fluid Change",
    "Clutch Fluid Change",
  ],
  engine_drivetrain: [
    "Spark Plugs",
    "Timing Belt",
    "Serpentine Belt",
    "Water Pump",
    "Thermostat",
    "Clutch Replacement",
    "Alternator",
    "Starter",
    "Fuel Pump",
    "Fuel Filter",
    "Turbo Inspection/Service",
    "Valve Cover Gaskets",
    "Head Gaskets",
  ],
  consumable: [
    "Air Filter",
    "Cabin Air Filter",
    "Brake Pads - Front",
    "Brake Pads - Rear",
    "Brake Rotors - Front",
    "Brake Rotors - Rear",
    "Tires - All Four",
    "Tire Rotation",
    "Wheel Alignment",
    "Windshield Wipers",
    "Battery",
  ],
  inspection: [
    "Annual Safety Inspection",
    "Pre-Purchase Inspection",
    "Emissions Test",
    "General Inspection",
    "Diagnostic Scan",
  ],
  other: ["Detailing", "Undercoating", "Rust Prevention", "Custom"],
};

const PARTS_BRANDS = {
  fluid: [
    "Subaru OEM",
    "Motul",
    "Mobil 1",
    "Castrol",
    "Valvoline",
    "Pennzoil",
    "Royal Purple",
    "Amsoil",
  ],
  engine_drivetrain: [
    "Subaru OEM",
    "NGK",
    "Denso",
    "Gates",
    "ACDelco",
    "Bosch",
    "Aisin",
    "Exedy",
  ],
  consumable: [
    "Subaru OEM",
    "Michelin",
    "Bridgestone",
    "Continental",
    "Brembo",
    "StopTech",
    "EBC",
    "Hawk",
    "K&N",
    "Mann Filter",
    "Bosch",
  ],
  other: ["N/A"],
};

const LOCATIONS = [
  "DIY - Home Garage",
  "Subaru Dealership",
  "Independent Mechanic",
  "Specialty Shop",
  "Quick Lube",
  "Tire Shop",
];

const selectClassName =
  "border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function EditServiceForm({ record, vehicle }: EditServiceFormProps) {
  const [category, setCategory] = useState(record.category);
  const [customTitle, setCustomTitle] = useState(true);
  const [customBrand, setCustomBrand] = useState(true);
  const [mileageValue, setMileageValue] = useState(record.mileage);
  const [steps, setSteps] = useState<Step[]>(
    record.steps.map((s) => ({
      id: crypto.randomUUID(),
      title: s.title,
      description: s.description ?? "",
      photos: s.photos.map((p) => ({
        fileUrl: p.fileUrl,
        fileKey: p.fileKey ?? "",
      })),
    })),
  );
  const [documents, setDocuments] = useState<ServiceDocumentUpload[]>(
    record.documents.map((d) => ({
      fileUrl: d.fileUrl,
      fileKey: d.fileKey ?? "",
      fileType: d.fileType,
    })),
  );

  const mileageDelta = mileageValue - vehicle.currentMileage;

  const titleOptions =
    SERVICE_TITLES[category as keyof typeof SERVICE_TITLES] ?? [];
  const brandOptions =
    PARTS_BRANDS[category as keyof typeof PARTS_BRANDS] ?? ["N/A"];

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", description: "", photos: [] },
    ]);
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function updateStep(id: string, updates: Partial<Omit<Step, "id">>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }

  const stepsJson = JSON.stringify(
    steps.map((s, i) => ({
      stepNumber: i + 1,
      title: s.title,
      description: s.description,
      photos: s.photos,
    })),
  );

  return (
    <form action={updateServiceRecord} className="space-y-0">
      <input type="hidden" name="recordId" value={record.id} />
      <input type="hidden" name="stepsJson" value={stepsJson} />
      <input
        type="hidden"
        name="documentsJson"
        value={JSON.stringify(documents)}
      />

      {/* ——— SECTION 1: SERVICE DETAILS ——— */}
      <SectionHeader number={1} title="Service Details" />
      <div className="space-y-6 pb-8 pt-4">
        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            className={selectClassName}
          >
            <option value="fluid">Fluids</option>
            <option value="engine_drivetrain">Engine/Drivetrain</option>
            <option value="consumable">Consumables</option>
            <option value="inspection">Inspection</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Service Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Service *</Label>
          {!customTitle ? (
            <div className="flex gap-2">
              <select
                id="title"
                name="title"
                required
                defaultValue={record.title}
                className={selectClassName}
              >
                <option value="">Select a service...</option>
                {titleOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCustomTitle(true)}
              >
                Custom
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={record.title}
                placeholder="Enter service name"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCustomTitle(false)}
              >
                Dropdown
              </Button>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="serviceDate">Service Date *</Label>
          <Input
            type="date"
            id="serviceDate"
            name="serviceDate"
            required
            defaultValue={record.serviceDate}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Mileage with delta hint */}
        <div className="space-y-1.5">
          <Label htmlFor="mileage">Mileage *</Label>
          <Input
            type="number"
            id="mileage"
            name="mileage"
            required
            min="0"
            value={mileageValue}
            onChange={(e) => setMileageValue(parseInt(e.target.value) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            Last recorded: {vehicle.currentMileage.toLocaleString()} mi
            {mileageDelta !== 0 && (
              <span
                className={
                  mileageDelta > 0
                    ? "ml-1.5 text-foreground"
                    : "ml-1.5 text-destructive"
                }
              >
                ({mileageDelta > 0 ? "+" : ""}
                {mileageDelta.toLocaleString()} mi)
              </span>
            )}
          </p>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            name="location"
            defaultValue={record.location ?? ""}
            className={selectClassName}
          >
            <option value="">Select location...</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ——— SECTION 2: PARTS & COST ——— */}
      <SectionDivider />
      <SectionHeader number={2} title="Parts & Cost" />
      <div className="space-y-6 pb-8 pt-4">
        {/* Parts Brand */}
        <div className="space-y-1.5">
          <Label htmlFor="partsBrand">Parts Brand</Label>
          {!customBrand ? (
            <div className="flex gap-2">
              <select
                id="partsBrand"
                name="partsBrand"
                defaultValue={record.partsBrand ?? ""}
                className={selectClassName}
              >
                <option value="">Select brand...</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCustomBrand(true)}
              >
                Custom
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                id="partsBrand"
                name="partsBrand"
                defaultValue={record.partsBrand ?? ""}
                placeholder="Enter brand"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCustomBrand(false)}
              >
                Dropdown
              </Button>
            </div>
          )}
        </div>

        {/* Part Number */}
        <div className="space-y-1.5">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            type="text"
            id="partNumber"
            name="partNumber"
            defaultValue={record.partNumber ?? ""}
            placeholder="e.g., 15208AA15A"
          />
        </div>

        {/* Costs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="partsCost">Parts Cost ($)</Label>
            <Input
              type="number"
              id="partsCost"
              name="partsCost"
              step="0.01"
              min="0"
              defaultValue={record.partsCost ?? ""}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="laborCost">Labor Cost ($)</Label>
            <Input
              type="number"
              id="laborCost"
              name="laborCost"
              step="0.01"
              min="0"
              defaultValue={record.laborCost ?? ""}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* ——— SECTION 3: STEPS ——— */}
      <SectionDivider />
      <SectionHeader
        number={3}
        title="Steps"
        description="Document the procedure step by step. Each step can include photos."
      />
      <div className="space-y-4 pb-8 pt-4">
        {steps.map((step, index) => (
          <div key={step.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Step {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => removeStep(step.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={step.title}
                onChange={(e) => updateStep(step.id, { title: e.target.value })}
                placeholder="e.g., Drain old oil"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={step.description}
                onChange={(e) =>
                  updateStep(step.id, { description: e.target.value })
                }
                rows={2}
                placeholder="Details about this step..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Photos</Label>
              {step.photos.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {step.photos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative h-16 w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.fileUrl}
                        alt=""
                        className="h-16 w-16 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateStep(step.id, {
                            photos: step.photos.filter((_, i) => i !== pIdx),
                          })
                        }
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <UploadButton
                endpoint="vehiclePhotoUploader"
                onClientUploadComplete={(res) => {
                  const newPhotos = res.map((f) => ({
                    fileUrl: f.url,
                    fileKey: f.key,
                  }));
                  updateStep(step.id, {
                    photos: [...step.photos, ...newPhotos],
                  });
                }}
                onUploadError={(error) =>
                  alert(`Upload failed: ${error.message}`)
                }
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addStep}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* ——— SECTION 4: DOCUMENTS ——— */}
      <SectionDivider />
      <SectionHeader
        number={4}
        title="Documents"
        description="Attach receipts, invoices, or reference photos."
      />
      <div className="space-y-4 pb-8 pt-4">
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.fileUrl}
                  alt=""
                  className="h-20 w-20 rounded border object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDocuments((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <UploadButton
          endpoint="vehiclePhotoUploader"
          onClientUploadComplete={(res) => {
            const newDocs = res.map((f) => ({
              fileUrl: f.url,
              fileKey: f.key,
              fileType: "photo",
            }));
            setDocuments((prev) => [...prev, ...newDocs]);
          }}
          onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
        />
        <p className="text-xs text-muted-foreground">
          Receipts, invoices, reference photos · Up to 10 images · 8MB each
        </p>
      </div>

      {/* ——— SECTION 5: NOTES ——— */}
      <SectionDivider />
      <SectionHeader number={5} title="Notes" />
      <div className="space-y-6 pb-8 pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={record.description ?? ""}
            placeholder="Brief description of the service performed..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={record.notes ?? ""}
            placeholder="Any additional observations, issues found, recommendations, etc..."
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-2">
        <Button type="submit">Save Changes</Button>
        <Button variant="secondary" asChild>
          <a href={`/vehicle/history?vehicleId=${record.vehicleId}`}>Cancel</a>
        </Button>
      </div>
    </form>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function SectionDivider() {
  return <hr className="border-border my-6" />;
}
