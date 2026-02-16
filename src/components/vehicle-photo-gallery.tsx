"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

interface Photo {
  id: number;
  fileUrl: string;
  isPrimary: boolean;
  description: string | null;
}

export function VehiclePhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  if (photos.length === 0) return null;

  const primary = photos.find((p) => p.isPrimary) ?? photos[0]!;
  const rest = photos.filter((p) => p.id !== primary.id).slice(0, 3);

  return (
    <div className="mb-10">
      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setSelected(null)}
          >
            <X size={20} />
          </button>
          <Image
            src={selected.fileUrl}
            alt="Vehicle photo"
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}

      {rest.length > 0 ? (
        /* Multi-photo layout: primary large + thumbnails */
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Primary */}
          <button
            className="overflow-hidden rounded-xl sm:flex-1"
            onClick={() => setSelected(primary)}
          >
            <Image
              src={primary.fileUrl}
              alt="Vehicle"
              width={900}
              height={500}
              className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02] sm:h-80"
            />
          </button>

          {/* Thumbnails: horizontal row on mobile, vertical column on sm+ */}
          <div className="flex flex-row gap-2 sm:w-40 sm:flex-col">
            {rest.map((photo) => (
              <button
                key={photo.id}
                className="flex-1 overflow-hidden rounded-xl sm:flex-none"
                onClick={() => setSelected(photo)}
              >
                <Image
                  src={photo.fileUrl}
                  alt="Vehicle photo"
                  width={300}
                  height={170}
                  className="h-20 w-full object-cover transition duration-300 hover:scale-[1.02] sm:h-[calc((20rem-1rem)/3)]"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Single photo */
        <button
          className="w-full overflow-hidden rounded-xl"
          onClick={() => setSelected(primary)}
        >
          <Image
            src={primary.fileUrl}
            alt="Vehicle"
            width={900}
            height={500}
            className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02] sm:h-80"
          />
        </button>
      )}

      {photos.length > 4 && (
        <p className="mt-2 text-right text-sm text-muted-foreground">
          +{photos.length - 4} more photos in settings
        </p>
      )}
    </div>
  );
}
