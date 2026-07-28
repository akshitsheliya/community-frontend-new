import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { communityApi } from '@/lib/api'
import type { Community } from '@/types/api'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/(auth)/community')({
  component: CommunitySelectionComponent,
})

function CommunitySelectionComponent() {
  const navigate = useNavigate()
  const [communityNumber, setCommunityNumber] = React.useState('1')
  const [isLoading, setIsLoading] = React.useState(false)
  const [communities, setCommunities] = React.useState<Community[]>([])

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

  return (
    <AuthLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-6 text-center">
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
    </AuthLayout>
  )
}
