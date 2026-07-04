import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { MobileInput } from '@/components/common/mobile-input'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginComponent,
})

const loginSchema = z.object({
  phone_number: z.string().length(10, 'Mobile number must be exactly 10 digits'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginComponent() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [communityUuid, setCommunityUuid] = React.useState<string | undefined>()

  React.useEffect(() => {
    // Check if community is selected
    const stored = localStorage.getItem('communityData')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.community_uuid) {
          setCommunityUuid(parsed.community_uuid)
        }
      } catch (e) {}
    }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    if (!communityUuid) {
      toast.error('Please select a community first')
      navigate({ to: '/community' })
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.sendLoginOtp({
        phone_number: data.phone_number,
        community_uuid: communityUuid,
      })
      
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully')
        navigate({ 
          to: '/login-otp', 
          search: { phone: data.phone_number } 
        })
      } else {
        toast.error(response.data.message || 'Failed to send OTP')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred while sending OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Login to Your Account</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your mobile number to receive OTP</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <MobileInput
              id="phone_number"
              placeholder="Enter 10 digit number"
              error={!!errors.phone_number}
              {...register('phone_number')}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">{errors.phone_number.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-hover text-white text-base" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Send OTP
          </Button>

          <div className="flex flex-col gap-4 text-center text-sm mt-6">
            <Link to="/register" className="text-theme font-semibold hover:underline">
              Don't have an account? Register
            </Link>
            <Link to="/community" className="text-gray-500 hover:text-gray-900 transition-colors">
              Select Community
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
