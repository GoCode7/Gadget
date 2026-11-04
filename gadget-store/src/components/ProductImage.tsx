import { useState } from 'react'

type ProductImageProps = {
  src?: string
  alt: string
}

export default function ProductImage({
  src,
  alt,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const imageSrc = src?.trim()
  const showImage = Boolean(imageSrc) && failedSrc !== imageSrc

  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden bg-slate-100 p-6">
      {showImage ? (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          onError={() => setFailedSrc(imageSrc ?? null)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt}: image unavailable`}
          className="flex h-full w-full items-center justify-center"
        >
          <span
            aria-hidden="true"
            className="text-sm text-slate-500"
          >
            Image unavailable
          </span>
        </div>
      )}
    </div>
  )
}