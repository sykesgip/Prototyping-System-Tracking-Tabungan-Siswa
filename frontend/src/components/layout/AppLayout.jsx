import { Sidebar } from './Sidebar'

export function AppLayout({ role, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
