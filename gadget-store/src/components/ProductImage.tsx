import { useState } from 'react'

type ProductImageProps = {
  src?: string
  alt: string
}

export default function ProductImage({
  src,
  alt,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="flex aspect-square items-center justify-center bg-slate-100 p-6">
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          onError={() => setHasError(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-sm text-slate-500">
          Image unavailable
        </span>
      )}
    </div>
  )
}