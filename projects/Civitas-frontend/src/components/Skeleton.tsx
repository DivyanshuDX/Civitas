import React from 'react'

const shimmer = 'animate-pulse bg-base-content/[0.06]'

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${shimmer} rounded ${className}`} />
)

export const SkeletonCard: React.FC = () => (
  <div className="card-glass rounded-xl p-5 space-y-3">
    <SkeletonLine className="h-4 w-1/3" />
    <SkeletonLine className="h-8 w-1/2" />
    <SkeletonLine className="h-3 w-2/3" />
  </div>
)

export const SkeletonStatCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card-glass rounded-xl p-4 space-y-2">
        <SkeletonLine className="h-3 w-2/3" />
        <SkeletonLine className="h-7 w-1/2" />
      </div>
    ))}
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    <div className="flex gap-3 px-3 py-2">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonLine key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3 px-3 py-3 border-t border-base-content/[0.04]">
        {Array.from({ length: cols }).map((_, j) => (
          <SkeletonLine key={j} className={`h-4 flex-1 ${j === 0 ? 'max-w-[140px]' : ''}`} />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="card-glass rounded-xl p-4 space-y-3">
    <SkeletonLine className="h-3 w-1/4" />
    <div className={`${shimmer} rounded-lg`} style={{ height }} />
  </div>
)

export const SkeletonRequestCard: React.FC = () => (
  <div className="card-glass rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <SkeletonLine className="h-5 w-24" />
      <SkeletonLine className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-3/4" />
    </div>
    <div className="flex gap-2 pt-1">
      <SkeletonLine className="h-3 w-20" />
      <SkeletonLine className="h-3 w-20" />
    </div>
  </div>
)
