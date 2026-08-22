import * as React from "react"
import {
  Settings,
  Shield,
  ClipboardList,
  Phone,
  LogOut,
  User,
  Pencil,
  Sparkles,
  Trash2,
  UserCheck,
  ShieldCheck,
  Home as HomeIcon
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { getUserData, logout, isAuthenticated, setUserData } from "@/lib/auth"
import { toast } from "sonner"
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog"
import { LogoutConfirmDialog } from "@/components/common/LogoutConfirmDialog"
import { userApi } from "@/lib/user-api"

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function SidebarItem({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick: () => void }) {
  return (
    <div 
      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 px-4 py-3 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="text-[#A32328] w-5 h-5 flex items-center justify-center">{icon}</div>
      <p className="text-gray-700 font-medium text-base">{text}</p>
    </div>
  )
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const navigate = useNavigate()
  const [userState, setUserState] = React.useState<any>(getUserData())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setUserState(getUserData())
      const isGlobalAdmin = localStorage.getItem('is_global_admin') === 'true'
      if (isAuthenticated() && !isGlobalAdmin) {
        userApi.getMe().then(res => {
          if (res) {
            setUserState(res)
            setUserData(res)
          }
        }).catch(err => {
          console.error("Failed to fetch user profile:", err)
        })
      }
    }
  }, [isOpen])

  const firstName = userState?.first_name || "Guest"
  const surname = userState?.surname || ""
  const profilePhoto = userState?.profile_photo || null
  const phoneNumber = userState?.phone_number || ""

  const handleLogout = () => {
    onClose()
    setIsLogoutDialogOpen(true)
  }

  const navigateTo = (path: string) => {
    onClose()
    navigate({ to: path as any })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white transform transition-transform duration-300 z-[50] shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User Profile Header - Red Background */}
        <div className="bg-[#A32328] text-white p-5 pt-8 pb-8">
          <div className="flex items-center gap-4">
            {/* Avatar circle */}
            <div className="w-14 h-14 shrink-0 rounded-full border-2 border-white bg-white/20 flex items-center justify-center overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={24} />
              )}
            </div>
            
            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold truncate">
                {firstName} {surname}
              </div>
              <div className="text-sm text-white/80 mt-0.5 truncate">
                {phoneNumber}
              </div>
            </div>
            
            {/* Edit icon */}
            <button 
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0" 
              onClick={() => navigateTo('/profile')}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>
        
        {/* Menu Items - White Background with rounded top */}
        <div className="bg-white text-black rounded-t-2xl -mt-4 relative p-2 pt-4 space-y-1 overflow-y-auto" 
             style={{ height: 'calc(100vh - 100px)' }}>
          
          <SidebarItem icon={<HomeIcon size={22} />} text="Home" onClick={() => navigateTo('/dashboard')} />
          {(localStorage.getItem('is_global_admin') === 'true' || userState?.phone_number === '9999900001' || userState?.is_global_admin) && (
            <SidebarItem 
              icon={<ShieldCheck size={22} className="text-amber-600 font-bold" />} 
              text="Global Admin Panel" 
              onClick={() => navigateTo('/global-admin')} 
            />
          )}
          <SidebarItem icon={<User size={22} />} text="My Profile" onClick={() => navigateTo('/profile')} />
          <SidebarItem icon={<Settings size={22} />} text="Settings" onClick={() => navigateTo('/settings')} />
          <SidebarItem icon={<Shield size={22} />} text="Privacy Policy" onClick={() => navigateTo('/privacy-policy')} />
          <SidebarItem icon={<ClipboardList size={22} />} text="Terms & Conditions" onClick={() => navigateTo('/terms-conditions')} />
          <SidebarItem icon={<Phone size={22} />} text="Helpline Call" onClick={() => navigateTo('/help')} />
          <SidebarItem icon={<Trash2 size={22} />} text="Delete Account" onClick={() => setIsDeleteDialogOpen(true)} />
          
          <div className="my-3 border-t border-gray-100 mx-2" />
          
          <SidebarItem icon={<LogOut size={22} />} text="Log Out" onClick={handleLogout} />
          
          {(userState?.is_community_admin === 1 || userState?.is_committee_member === 1) && (
            <>
              <div className="my-2 border-t border-gray-100 mx-2" />
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-1">
                Committee Portal
              </div>
              <SidebarItem 
                icon={<UserCheck size={22} />} 
                text="User Approvals" 
                onClick={() => navigateTo('/admin/user-approvals')}
              />
              {userState?.is_community_admin === 1 && (
                <SidebarItem 
                  icon={<Sparkles size={22} />} 
                  text="AI Suggestions" 
                  onClick={() => navigateTo('/admin/suggestions')}
                />
              )}
            </>
          )}
        </div>
      </div>

      <DeleteAccountDialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} />
      <LogoutConfirmDialog open={isLogoutDialogOpen} onClose={() => setIsLogoutDialogOpen(false)} />
    </>
  )
}
