"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";
import { addVehicle } from "~/server/actions/vehicles";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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
      <div className="space-y-1.5">
        <Label htmlFor="year">Year</Label>
        <Input
          type="number"
          id="year"
          name="year"
          required
          min="1900"
          max={new Date().getFullYear() + 1}
          placeholder="2005"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="make">Make</Label>
        <Input
          type="text"
          id="make"
          name="make"
          required
          placeholder="Subaru"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="model">Model</Label>
        <Input
          type="text"
          id="model"
          name="model"
          required
          placeholder="WRX STI"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="currentMileage">Current Mileage</Label>
        <Input
          type="number"
          id="currentMileage"
          name="currentMileage"
          required
          min="0"
          placeholder="45000"
        />
      </div>

      {/* Photo upload — lives outside the form submit flow to avoid button conflicts */}
      <div>
        <Label>Photos</Label>

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
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => removePhoto(photo.fileKey)}
                  className="absolute -top-1.5 -right-1.5"
                >
                  <X />
                </Button>
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Vehicle"}
        </Button>
        <Button variant="secondary" asChild>
          <a href="/vehicle/history">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
