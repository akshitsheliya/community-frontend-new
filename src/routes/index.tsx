import { createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('communityData') : null
      if (!stored) {
        throw redirect({
          to: '/community',
        })
      } else {
        throw redirect({
          to: '/login',
        })
      }
    }
  },
  component: IndexComponent,
})

function IndexComponent() {
  // Fallback in case redirect is delayed
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme" />
        <p className="text-gray-500 font-medium">Redirecting...</p>
      </div>
    </div>
  )
}
