import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
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
