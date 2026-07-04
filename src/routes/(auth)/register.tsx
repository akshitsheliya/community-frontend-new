import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { MobileInput } from '@/components/common/mobile-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterComponent,
})

const registerSchema = z.object({
  phone_number: z.string().length(10, 'Mobile number must be exactly 10 digits'),
  first_name: z.string().min(2, 'First name is required'),
  surname: z.string().min(2, 'Surname is required'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterComponent() {
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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    if (!communityUuid) {
      toast.error('Please select a community first')
      navigate({ to: '/community' })
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.sendRegisterOtp({
        phone_number: data.phone_number,
        first_name: data.first_name,
        surname: data.surname,
        community_uuid: communityUuid,
      })
      
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully')
        // In a real app we would navigate to a register-otp page or similar
        // navigate({ to: '/register-otp', search: { phone: data.phone_number } })
        navigate({ to: '/login' })
      } else {
        toast.error(response.data.message || 'Failed to send OTP')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join Umarala Gam Samast Leuva Patel Samaj</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="first_name"
                placeholder="First name"
                className={errors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register('first_name')}
              />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="surname" className="text-sm font-medium text-gray-700">Surname</label>
              <Input
                id="surname"
                placeholder="Surname"
                className={errors.surname ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register('surname')}
              />
              {errors.surname && <p className="text-xs text-red-500">{errors.surname.message}</p>}
            </div>
          </div>

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

          <Button type="submit" className="w-full h-12 bg-theme hover:bg-theme-hover text-white text-base mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Register
          </Button>

          <div className="flex flex-col gap-4 text-center text-sm mt-6">
            <Link to="/login" className="text-theme font-semibold hover:underline">
              Already have an account? Login
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
