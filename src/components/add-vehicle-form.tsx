"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";
import { addVehicle } from "~/server/actions/vehicles";

interface UploadedPhoto {
  fileUrl: string;
  fileKey: string;
}

export function AddVehicleForm() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isPending, startTransition] = useTransition();

  const removePhoto = (fileKey: string) => {
    setPhotos((prev) => prev.filter((p) => p.fileKey !== fileKey));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("photos", JSON.stringify(photos));
    startTransition(() => addVehicle(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-foreground">
          Year
        </label>
        <input
          type="number"
          id="year"
          name="year"
          required
          min="1900"
          max={new Date().getFullYear() + 1}
          className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
          placeholder="2005"
        />
      </div>

      <div>
        <label htmlFor="make" className="block text-sm font-medium text-foreground">
          Make
        </label>
        <input
          type="text"
          id="make"
          name="make"
          required
          className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
          placeholder="Subaru"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-foreground">
          Model
        </label>
        <input
          type="text"
          id="model"
          name="model"
          required
          className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
          placeholder="WRX STI"
        />
      </div>

      <div>
        <label htmlFor="currentMileage" className="block text-sm font-medium text-foreground">
          Current Mileage
        </label>
        <input
          type="number"
          id="currentMileage"
          name="currentMileage"
          required
          min="0"
          className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
          placeholder="45000"
        />
      </div>

      {/* Photo upload — lives outside the form submit flow to avoid button conflicts */}
      <div>
        <label className="block text-sm font-medium text-foreground">Photos</label>

        {photos.length > 0 && (
          <div className="mt-2 mb-3 flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={photo.fileKey} className="relative">
                <Image
                  src={photo.fileUrl}
                  alt={`Vehicle photo ${i + 1}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                {i === 0 && (
                  <span className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-black/50 py-0.5 text-center text-xs text-white">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.fileKey)}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground hover:bg-destructive/90"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2">
          <UploadButton
            endpoint="vehiclePhotoUploader"
            onClientUploadComplete={(res) => {
              const newPhotos = res.map((f) => ({ fileUrl: f.url, fileKey: f.key }));
              setPhotos((prev) => [...prev, ...newPhotos]);
            }}
            onUploadError={(error) => {
              alert(`Upload failed: ${error.message}`);
            }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to 10 images · 8MB each · First photo becomes the primary
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add Vehicle"}
        </button>
        <a
          href="/vehicle/history"
          className="rounded bg-secondary px-6 py-2 text-foreground hover:bg-secondary/80"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
