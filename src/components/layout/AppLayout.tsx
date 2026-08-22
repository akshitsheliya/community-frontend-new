import * as React from "react"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"
import { globalAdminApi } from "@/lib/global-admin-api"
import { ForcedCommunitySwitchModal } from "@/components/common/ForcedCommunitySwitchModal"
import { UserRemovedNoticeModal } from "@/components/common/UserRemovedNoticeModal"
import { toast } from "sonner"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // Real-time active session polling for forced community switch / removal
  const [forcedSwitchEvent, setForcedSwitchEvent] = React.useState<any>(null)
  const [removedReason, setRemovedReason] = React.useState<string | null>(null)

  React.useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const res = await globalAdminApi.getSessionStatus()
        if (res.success && res.data) {
          if (res.data.status === 'removed') {
            setRemovedReason(res.data.reason || 'Account removed by Global Admin')
            return
          }

          const events = res.data.events || []
          
          // Check for forced switch event
          const switchEvt = events.find((e: any) => e.type === 'forced_switch')
          if (switchEvt) {
            setForcedSwitchEvent(switchEvt)
          }

          // Check for forced removal event
          const removalEvt = events.find((e: any) => e.type === 'forced_removal')
          if (removalEvt) {
            setRemovedReason(removalEvt.reason || 'Account removed by Global Admin')
          }

          // Check for community copy notification event
          const copyEvt = events.find((e: any) => e.type === 'community_copied')
          if (copyEvt) {
            toast.info(`You have been added to ${copyEvt.target_community_name} by Global Admin Rajesh Patel!`)
            globalAdminApi.acknowledgeSwitch({ event_id: copyEvt.id, target_community_uuid: '' })
          }
        }
      } catch (e) {}
    }

    checkSessionStatus()
    const interval = setInterval(checkSessionStatus, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      <AppHeader onMenuClick={() => setSidebarOpen(true)} />
      
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="flex-1 w-full h-full overflow-y-auto pt-[60px]">
        <div className="p-4 md:p-6 lg:p-8 min-h-full">
          {children}
        </div>
      </main>

      {/* Unclosable forced switch modal */}
      {forcedSwitchEvent && (
        <ForcedCommunitySwitchModal
          open={!!forcedSwitchEvent}
          eventId={forcedSwitchEvent.id}
          targetCommunityName={forcedSwitchEvent.target_community_name || 'New Community'}
          targetCommunityUuid={forcedSwitchEvent.target_community_uuid || ''}
        />
      )}

      {/* Unclosable removal notice modal */}
      {removedReason && (
        <UserRemovedNoticeModal
          open={!!removedReason}
          reason={removedReason}
        />
      )}
    </div>
  )
}
