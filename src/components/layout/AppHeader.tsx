import * as React from "react"
import { Menu, Bell } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { joinRequestApi } from '@/lib/family-join-api'
import { matcherApi } from '@/lib/family-matcher-api'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface AppHeaderProps {
  onMenuClick: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  // Fetch incoming join requests count
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incoming-requests-header'],
    queryFn: joinRequestApi.getIncoming,
    enabled: isAuthenticated,
    refetchInterval: 60000 // refresh every 60 seconds
  });
  
  // Fetch pending suggestions count (admin only)
  const { data: stats } = useQuery({
    queryKey: ['matcher-stats-header'],
    queryFn: matcherApi.getStats,
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 60000
  });
  
  const pendingRequests = incomingRequests.filter(r => r.status === 'pending').length;
  const pendingSuggestions = stats?.pending || 0;
  const totalNotifications = pendingRequests + (isAdmin ? pendingSuggestions : 0);
  
  const handleBellClick = () => {
    if (pendingRequests > 0) {
      navigate({ to: '/family-requests' });
    } else if (isAdmin && pendingSuggestions > 0) {
      navigate({ to: '/admin/suggestions' });
    } else {
      toast.info('No new notifications');
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-40 flex items-center px-4 shadow-sm">
      <button 
        onClick={onMenuClick} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu size={24} className="text-[#A32328]" />
      </button>
      
      <h1 className="ml-4 font-semibold text-gray-800 text-lg truncate flex-1">
        Umarala Gam Samast Leuva Patel Samaj
      </h1>
      
      <div className="ml-auto flex items-center gap-2">
        <button 
          onClick={handleBellClick}
          className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors" 
          aria-label="Notifications"
        >
          <Bell size={22} className="text-[#A32328]" />
          {totalNotifications > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
