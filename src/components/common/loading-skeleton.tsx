interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className = '', 
  variant = 'default',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted'
  
  const variantClasses = {
    default: 'rounded',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Composants prêts à l'emploi pour différents cas
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '75%' : '100%'} 
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <Skeleton variant="circular" width={48} height={48} />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  )
}

export function TestimonialSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-sahel-sand rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <Skeleton variant="text" width="120px" className="mb-2" />
          <Skeleton variant="text" width="80px" />
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="circular" width={20} height={20} />
          ))}
        </div>
      </div>
      
      <Skeleton variant="rectangular" width="80px" height="20px" className="rounded-full mb-4" />
      
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="75%" />
      </div>
    </div>
  )
}

export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`group w-full ${isUser ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
      <div className="flex gap-4 p-4 md:p-6 max-w-full">
        <div className="flex-shrink-0">
          <Skeleton variant="circular" width={32} height={32} />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>
    </div>
  )
}