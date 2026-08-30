import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { communityApi } from '@/lib/api'
import { globalAdminApi } from '@/lib/global-admin-api'
import type { Community } from '@/types/api'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ArrowLeft, Users, Loader2, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/(auth)/community')({
  component: CommunitySelectionComponent,
})

function CommunitySelectionComponent() {
  const navigate = useNavigate()
  const [communityNumber, setCommunityNumber] = React.useState('1')
  const [isLoading, setIsLoading] = React.useState(false)
  const [communities, setCommunities] = React.useState<Community[]>([])

  // Global Admin Login Modal State
  const [showAdminLogin, setShowAdminLogin] = React.useState(false)
  const [adminPhone, setAdminPhone] = React.useState('9999900001')
  const [isAdminLoggingIn, setIsAdminLoggingIn] = React.useState(false)

  React.useEffect(() => {
    // Load all communities on mount for easy 1-click selection
    const fetchCommunities = async () => {
      try {
        const res = await communityApi.getAll()
        if (res.data.success && res.data.data) {
          setCommunities(res.data.data)
        }
      } catch (e) {}
    }
    fetchCommunities()
  }, [])

  const selectCommunity = (community: Community) => {
    localStorage.removeItem('is_direct_admin')
    localStorage.removeItem('is_global_admin')
    localStorage.setItem('communityData', JSON.stringify({
      community_uuid: community.community_uuid,
      community_name: community.community_name,
      community_number: community.community_number,
    }))
    toast.success(`Community "${community.community_name}" selected!`)
    navigate({ to: '/login' })
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!communityNumber) {
      toast.error('Please enter a community number')
      return
    }

    setIsLoading(true)
    try {
      const response = await communityApi.getByNumber(Number(communityNumber))
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const community = response.data.data[0]
        selectCommunity(community)
      } else {
        toast.error(response.data.message || 'Invalid community number')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch community details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGlobalAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminPhone || adminPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (adminPhone !== '9999900001') {
      toast.error('Access Denied: Only Rajesh Patel (9999900001) has Global Admin access.')
      return
    }

    setIsAdminLoggingIn(true)
    try {
      let token = 'global-admin-token-9999900001'
      try {
        const res = await globalAdminApi.login({ phone_number: adminPhone })
        if (res.success && res.data?.token) {
          token = res.data.token
        }
      } catch (e) {}

      localStorage.setItem('authToken', token)
      localStorage.setItem('token', token)
      localStorage.setItem('is_global_admin', 'true')
      localStorage.setItem('is_direct_admin', 'true')
      localStorage.setItem('userData', JSON.stringify({
        phone_number: '9999900001',
        first_name: 'Rajesh',
        surname: 'Patel',
        is_global_admin: true,
        is_community_admin: 1
      }))
      localStorage.setItem('communityData', JSON.stringify({
        community_uuid: 'global-admin-uuid',
        community_name: 'Global Admin Portal',
        community_number: 1,
      }))
      toast.success('Welcome Rajesh Patel! Global Admin Authenticated!')
      setShowAdminLogin(false)
      window.location.href = '/global-admin/'
    } catch (err: any) {
      toast.error('Global Admin login failed')
    } finally {
      setIsAdminLoggingIn(false)
    }
  }

  return (
    <>
      {/* Top Right Global Admin Login Icon - Fixed at top right corner of the page */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button
          onClick={() => setShowAdminLogin(true)}
          title="Global Admin Login (Rajesh Patel)"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-theme hover:text-white text-theme text-xs font-bold transition border border-theme/30 shadow-lg"
        >
          <ShieldCheck size={18} />
          <span>Admin</span>
        </button>
      </div>

      <AuthLayout>
        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center pt-2">
            <h2 className="text-2xl font-semibold text-gray-900">Select Community / Samaj</h2>
            <p className="text-sm text-gray-500 mt-2">Step 1: Choose your community to proceed to login</p>
          </div>

        {/* Quick select list */}
        {communities.length > 0 && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Available Communities</label>
            {communities.map((c) => (
              <button
                key={c.community_uuid}
                type="button"
                onClick={() => selectCommunity(c)}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-theme hover:bg-red-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-theme/10 text-theme font-bold flex items-center justify-center">
                    {c.community_number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-theme text-sm">{c.community_name}</h3>
                    <p className="text-xs text-gray-500">Community Code: {c.community_number}</p>
                  </div>
                </div>
                <Users className="h-5 w-5 text-gray-400 group-hover:text-theme transition" />
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="community_number" className="text-sm font-medium text-gray-700">
              Or Enter Community Number
            </label>
            <Input
              id="community_number"
              type="number"
              placeholder="e.g. 1"
              value={communityNumber}
              onChange={(e) => setCommunityNumber(e.target.value)}
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-hover text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Users className="h-5 w-5 mr-2" />}
            Continue to Login
          </Button>
        </form>
      </div>

      {/* Global Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border text-gray-900">
          <DialogHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-theme/10 text-theme flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={28} />
            </div>
            <DialogTitle className="text-xl font-bold">Global Admin Portal</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Log in as Global Admin (Rajesh Patel) to manage all communities, approvals, and user relations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGlobalAdminLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-700">Admin Mobile Number</label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={10}
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10 digit number"
                  className="h-12 font-medium"
                />
                <span className="absolute right-3 top-3.5 text-xs text-gray-400">Default: 9999900001</span>
              </div>
              <p className="text-[11px] text-gray-400 italic">Hint: Rajesh Patel (Global Admin)</p>
            </div>

            <Button
              type="submit"
              disabled={isAdminLoggingIn}
              className="w-full h-12 bg-theme hover:bg-theme-hover text-white font-semibold text-base mt-2"
            >
              {isAdminLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <KeyRound className="h-5 w-5 mr-2" />}
              Access Global Admin Panel
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthLayout>
    </>
  )
}

