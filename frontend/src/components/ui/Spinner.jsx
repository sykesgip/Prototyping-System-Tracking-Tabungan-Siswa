export function Spinner({ className = '' }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="h-8 w-8 text-blue-600" />
    </div>
  )
}
