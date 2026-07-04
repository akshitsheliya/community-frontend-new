import * as React from "react"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

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
    </div>
  )
}
