'use client';

import Image from 'next/image';
import { useState } from 'react';

interface QuestionImageProps {
  /** List of image file names (without extension). Images should live in /public/images */
  imageNames: string[];
  /** Either a single alt string or an array of alt strings matching imageNames */
  alt?: string | string[];
  className?: string;
  /** width/height used for image placeholders and modal sizing */
  maxWidth?: number;
  maxHeight?: number;
}

export default function QuestionImage({
  imageNames,
  alt,
  className = "",
  maxWidth = 800,
  maxHeight = 600,
}: QuestionImageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!imageNames || imageNames.length === 0) return null;

  const handleOpen = (idx: number) => setOpenIdx(idx);
  const handleClose = () => setOpenIdx(null);

  // Determine grid columns dynamically
  const gridCols =
    imageNames.length === 1
      ? 'grid-cols-1'
      : imageNames.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`my-6 ${className}`}>
      <div className="w-full max-w-6xl mx-auto">
        <div className={`grid ${gridCols} gap-4`}>
          {imageNames.map((name, idx) => {
            const src = `/images/${name}.jpg`;
            const itemAlt = Array.isArray(alt)
              ? alt[idx] ?? `Question diagram ${name}`
              : alt ?? `Question diagram ${name}`;

            return (
              <button
                key={`${name}-${idx}`}
                type="button"
                onClick={() => handleOpen(idx)}
                className="bg-gray-900 rounded-xl border border-gray-600 shadow-2xl overflow-hidden w-full hover:scale-[1.01] transition-transform"
              >
                <div className="relative w-full flex justify-center items-center p-1">
                  <Image
                    src={src}
                    alt={itemAlt}
                    width={maxWidth}
                    height={maxHeight}
                    className="rounded-lg shadow-lg object-contain w-full h-auto"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {openIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
        >
          <div className="max-w-[90vw] max-h-[90vh]">
            <Image
              src={`/images/${imageNames[openIdx]}.jpg`}
              alt={Array.isArray(alt) ? alt[openIdx] ?? '' : alt ?? ''}
              width={Math.min(1400, maxWidth * 2)}
              height={Math.min(1050, maxHeight * 2)}
              className="rounded-lg"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage (place in a parent component):
 *
 * <QuestionImage
 *   imageNames={["diagram-1", "diagram-2", "diagram-3"]}
 *   alt={["First diagram", "Second diagram", "Third diagram"]}
 *   className="mt-8"
 * />
 *
 * Notes:
 * - Put images in the `public/images` folder (e.g. public/images/diagram-1.jpg).
 * - The component renders a responsive grid of thumbnails. Clicking an image opens a modal with the larger image.
 * - If there is only one image, it takes full width; two images share the space equally.
 * - The image container padding is reduced to better fit the image, minimizing excess space at the bottom.
 */
