import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    const isGlobalAdmin = typeof window !== 'undefined' && localStorage.getItem('is_global_admin') === 'true'
    if (!isAuthenticated() && !isGlobalAdmin) {
      throw redirect({
        to: '/community',
      })
    }
  },
  component: AppRouteComponent,
})

function AppRouteComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
