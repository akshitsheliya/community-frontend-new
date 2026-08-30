import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Users,
  TreePine,
  UserCog,
  Newspaper,
  Image as ImageIcon,
  Briefcase,
  HeartHandshake,
  GraduationCap,
  Plane,
  Sparkles,
  Search,
  Inbox,
  UserCheck,
  ShieldCheck
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { joinRequestApi } from '@/lib/family-join-api'
import { matcherApi } from '@/lib/family-matcher-api'
import { userVerificationApi } from '@/lib/user-verification-api'
import { familyGraphApi } from '@/lib/family-graph-api'

export const Route = createFileRoute('/(app)/dashboard/')({
  component: DashboardComponent,
})

function DashboardItem({ icon: Icon, label, onClick, badge }: { icon: any, label: string, onClick: () => void, badge?: string }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 aspect-square sm:aspect-auto sm:min-h-[140px]"
    >
      <div className="w-14 h-14 rounded-full bg-[#A3232815] flex items-center justify-center text-[#A32328] group-hover:scale-110 transition-transform duration-200 relative">
        <Icon size={28} className="text-[#A32328]" />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white">
            {badge}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-gray-800 text-center line-clamp-2 leading-tight">
        {label}
      </span>
    </div>
  )
}

function DashboardComponent() {
  const navigate = useNavigate()
  
  React.useEffect(() => {
    localStorage.removeItem('is_direct_admin');
  }, []);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  const isCommittee = userData.is_committee_member === 1 || isAdmin;
  const isGlobalAdmin = localStorage.getItem('is_global_admin') === 'true' || userData.phone_number === '9999900001' || userData.is_global_admin;

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incoming-requests-count'],
    queryFn: joinRequestApi.getIncoming,
    refetchInterval: 60000
  });

  const { data: relationshipRequests = [] } = useQuery({
    queryKey: ['pending-relationships-count'],
    queryFn: familyGraphApi.getPending,
    refetchInterval: 60000
  });

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending').length + relationshipRequests.length;

  const { data: matcherStats } = useQuery({
    queryKey: ['matcher-stats-dashboard'],
    queryFn: matcherApi.getStats,
    enabled: isAdmin,
    refetchInterval: 60000
  });
  const pendingSuggestions = matcherStats?.pending || 0;

  const { data: unverifiedUsers = [] } = useQuery({
    queryKey: ['unverified-users-dashboard'],
    queryFn: userVerificationApi.getUnverified,
    enabled: isCommittee,
    refetchInterval: 30000
  });
  const pendingUserApprovals = unverifiedUsers.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      
      {/* Image Carousel/Banner - TOP */}
      <div className="rounded-2xl overflow-hidden h-48 md:h-64 relative shadow-sm border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-theme to-theme-hover opacity-90" />
        <img 
          src="https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=1600&auto=format&fit=crop" 
          alt="Community Banner" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 text-center">
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">Welcome to Your Community</h2>
          <p className="text-white/90 text-sm md:text-base max-w-lg mx-auto">Stay connected with members, get the latest updates, and participate in community events.</p>
        </div>
      </div>

      {/* Global Admin Quick Banner */}
      {isGlobalAdmin && (
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white rounded-2xl p-4 md:p-5 shadow-md flex items-center justify-between gap-4 border border-amber-300/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg tracking-tight">Global Admin Control Center</span>
                <span className="bg-amber-300 text-amber-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">Rajesh Patel</span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">Manage all communities, approvals, user copy/move & forced session actions.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate({ to: '/global-admin' as any })}
            className="bg-white text-red-700 hover:bg-amber-50 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <span>Open Admin Panel</span>
            <ShieldCheck size={16} />
          </button>
        </div>
      )}
      
      {/* Services Grid - Icon Cards (like mobile app) */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {isGlobalAdmin && (
          <DashboardItem 
            icon={ShieldCheck} 
            label="Global Admin" 
            onClick={() => navigate({ to: '/global-admin' as any })} 
          />
        )}
        {isCommittee && (
          <DashboardItem 
            icon={UserCheck} 
            label="User Approvals" 
            onClick={() => navigate({ to: '/admin/user-approvals' as any })} 
            badge={pendingUserApprovals > 0 ? pendingUserApprovals.toString() : undefined}
          />
        )}
        {isAdmin && (
          <DashboardItem 
            icon={Sparkles} 
            label="AI Matches" 
            onClick={() => navigate({ to: '/admin/suggestions' })} 
            badge={pendingSuggestions > 0 ? pendingSuggestions.toString() : undefined}
          />
        )}
        <DashboardItem icon={Users} label="Members" onClick={() => navigate({ to: '/members' })} />
        <DashboardItem icon={TreePine} label="Family Tree" onClick={() => navigate({ to: '/family-tree' })} />
        
        <DashboardItem 
          icon={Search} 
          label="Find Family" 
          onClick={() => navigate({ to: '/find-family', search: { from: undefined } })}
        />
        <DashboardItem 
          icon={Inbox} 
          label="Family Requests" 
          onClick={() => navigate({ to: '/family-requests' })}
          badge={pendingIncoming > 0 ? pendingIncoming.toString() : undefined}
        />
        
        <DashboardItem icon={UserCog} label="Committee" onClick={() => navigate({ to: '/committee' })} />
        <DashboardItem icon={Newspaper} label="Notices" onClick={() => navigate({ to: '/notice-board' })} />
        <DashboardItem icon={ImageIcon} label="Gallery" onClick={() => navigate({ to: '/gallery' })} />
        <DashboardItem icon={Briefcase} label="Business" onClick={() => navigate({ to: '/business' })} />
        <DashboardItem icon={HeartHandshake} label="Donors" onClick={() => navigate({ to: '/donors' })} />
        <DashboardItem icon={GraduationCap} label="Marksheets" onClick={() => navigate({ to: '/marksheets' })} />
        <DashboardItem icon={Plane} label="Abroad" onClick={() => navigate({ to: '/abroad-members' })} />
      </div>
      
    </div>
  )
}
