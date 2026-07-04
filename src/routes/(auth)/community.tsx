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
  const [communityNumber, setCommunityNumber] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  
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
        localStorage.setItem('communityData', JSON.stringify({
          community_uuid: community.community_uuid,
          community_name: community.community_name,
          community_number: community.community_number,
        }))
        toast.success(`Community "${community.community_name}" selected!`)
        navigate({ to: '/login' })
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
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Login
        </Link>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Select Community</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your community number to proceed</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="community_number" className="text-sm font-medium text-gray-700">
              Community Number
            </label>
            <Input
              id="community_number"
              type="number"
              placeholder="e.g. 1"
              value={communityNumber}
              onChange={(e) => setCommunityNumber(e.target.value)}
              className="h-12"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-hover text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Users className="h-5 w-5 mr-2" />}
            Verify & Select
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
