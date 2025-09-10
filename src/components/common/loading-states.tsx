import { Skeleton, TestimonialSkeleton, ChatMessageSkeleton } from './loading-skeleton'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} text-senegal-green`} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

export function FullPageLoading({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function InlineLoading({ message = 'Chargement...', className = '' }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <LoadingSpinner className="mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  isLoading: boolean
}

export function ButtonLoading({ children, isLoading, ...props }: ButtonLoadingProps) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Loading states spécifiques aux pages
export function TestimonialsPageLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Skeleton variant="text" width="300px" height="36px" className="mx-auto mb-6" />
        <Skeleton variant="text" width="400px" height="20px" className="mx-auto" />
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MbayePageLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Skeleton variant="text" width="250px" height="36px" className="mx-auto mb-6" />
          <Skeleton variant="text" width="350px" height="20px" className="mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="text-center">
            <Skeleton variant="circular" width={320} height={320} className="mx-auto" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="text" width="200px" height="32px" />
            <div className="space-y-4">
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="85%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <ChatMessageSkeleton key={i} isUser={i % 2 === 0} />
      ))}
    </div>
  )
}