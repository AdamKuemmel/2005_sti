"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";
import { saveVehiclePhotos, deleteVehiclePhoto } from "~/server/actions/vehicles";

interface Photo {
  id: number;
  fileUrl: string;
  fileKey: string;
  isPrimary: boolean;
}

interface Props {
  vehicleId: number;
  initialPhotos: Photo[];
}

export function VehiclePhotoManager({ vehicleId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (photo: Photo) => {
    setDeleting(photo.id);
    try {
      await deleteVehiclePhoto(photo.id, photo.fileKey);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="border-t pt-6">
      <h2 className="mb-4 text-xl font-semibold">Photos</h2>

      {photos.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <Image
                src={photo.fileUrl}
                alt="Vehicle photo"
                width={96}
                height={96}
                className="h-24 w-24 rounded-lg object-cover"
              />
              {photo.isPrimary && (
                <span className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-black/50 py-0.5 text-center text-xs text-white">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={deleting === photo.id}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-500">No photos yet.</p>
      )}

      <UploadButton
        endpoint="vehiclePhotoUploader"
        onClientUploadComplete={async (res) => {
          const newPhotos = res.map((f) => ({ fileUrl: f.url, fileKey: f.key }));
          const saved = await saveVehiclePhotos(vehicleId, newPhotos, photos.length === 0);
          if (saved) {
            setPhotos((prev) => [
              ...prev,
              ...saved.map((p) => ({
                id: p.id,
                fileUrl: p.fileUrl,
                fileKey: p.fileKey,
                isPrimary: p.isPrimary,
              })),
            ]);
          }
        }}
        onUploadError={(error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
      <p className="mt-1 text-xs text-gray-500">Up to 10 images · 8MB each</p>
    </div>
  );
}
