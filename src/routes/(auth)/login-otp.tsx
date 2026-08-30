import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { OtpInput } from '@/components/common/otp-input'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { setToken, setUserData } from '@/lib/auth'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'

// Define search params type
type LoginOtpSearch = {
  phone?: string
  mode?: string
}

export const Route = createFileRoute('/(auth)/login-otp')({
  validateSearch: (search: Record<string, unknown>): LoginOtpSearch => {
    return {
      phone: search.phone as string | undefined,
      mode: search.mode as string | undefined,
    }
  },
  component: LoginOtpComponent,
})

function isRecentlyRegistered(addedOn: string): boolean {
  if (!addedOn) return false;
  const registeredDate = new Date(addedOn);
  const hoursSince = (Date.now() - registeredDate.getTime()) / (1000 * 60 * 60);
  return hoursSince < 1;
}

function LoginOtpComponent() {
  const { phone, mode } = Route.useSearch()
  const navigate = useNavigate()
  
  const [otp, setOtp] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [countdown, setCountdown] = React.useState(30)
  
  React.useEffect(() => {
    if (!phone) {
      navigate({ to: '/login' })
    }
  }, [phone, navigate])

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    if (!phone) return

    setIsLoading(true)
    try {
      let communityUuid = undefined
      const storedComm = localStorage.getItem('communityData')
      if (storedComm) {
        try {
          const parsed = JSON.parse(storedComm)
          communityUuid = parsed.community_uuid
        } catch (e) {}
      }

      // If mode is register OR pending registration exists in sessionStorage
      const pendingRegStr = sessionStorage.getItem(`pending_reg_${phone}`)
      const isRegisterMode = mode === 'register' || !!pendingRegStr

      const verifyFn = isRegisterMode 
        ? authApi.verifyRegisterOtp({ phone_number: phone, otp, community_uuid: communityUuid })
        : authApi.verifyLoginOtp({ phone_number: phone, otp, community_uuid: communityUuid })

      const response = await verifyFn
      
      if (response.data.success) {
        localStorage.removeItem('is_direct_admin')
        const authData = response.data.data
        if (authData?.token) {
          setToken(authData.token)
        }

        // Check if profile creation is needed
        if (pendingRegStr) {
          try {
            const { first_name, surname } = JSON.parse(pendingRegStr)
            await authApi.createProfile({
              phone_number: phone,
              first_name: first_name || 'Member',
              surname: surname || 'Patel',
              father_name: '-',
              gender: 'Male',
              number_of_family_members: 1,
            })
            sessionStorage.removeItem(`pending_reg_${phone}`)
          } catch (e) {
            console.error('Profile creation error:', e)
          }
        }

        // Fetch latest user info
        try {
          const userResponse = await authApi.getCurrentUser()
          if (userResponse.data.success && userResponse.data.data) {
            const userData = userResponse.data.data
            setUserData(userData)

            if (isRegisterMode) {
              toast.success("Account created successfully! Let's find your family.")
              navigate({ to: '/find-family', search: { from: 'registration' } })
              return
            }

            const isNewUser = !userData.family_sr_id || userData.family_sr_id === null
            const registeredRecently = isRecentlyRegistered(userData.added_on)
            
            if (isNewUser && registeredRecently) {
              toast.success("Login successful! Let's find your family.")
              navigate({ to: '/find-family', search: { from: 'registration' } })
              return
            }
          }
        } catch (e) {
          console.error("Failed to fetch user data", e)
        }

        toast.success(response.data.message || 'Login successful')
        navigate({ to: '/dashboard' })
      } else {
        toast.error(response.data.message || 'Invalid OTP')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !phone) return
    
    try {
      const stored = localStorage.getItem('communityData')
      let communityUuid = undefined
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          communityUuid = parsed.community_uuid
        } catch (e) {}
      }

      await authApi.sendLoginOtp({
        phone_number: phone,
        community_uuid: communityUuid
      })
      toast.success('OTP resent successfully')
      setCountdown(30)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <AuthLayout>
      <div className="p-6 sm:p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Change number
        </Link>
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Verify OTP</h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter the 6-digit OTP sent to <span className="font-semibold text-gray-900">+91 {phone}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Hint: Use 221221 for testing</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-8">
          <div className="flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              length={6}
              disabled={isLoading}
              onEnter={handleVerify}
            />
          </div>

          <Button 
            type="submit"
            onClick={handleVerify}
            className="w-full h-12 bg-theme hover:bg-theme-hover text-white text-base" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Verify
          </Button>

          <div className="text-center text-sm">
            <p className="text-gray-500">
              Didn't receive code?{' '}
              {countdown > 0 ? (
                <span className="text-gray-400">Resend in {countdown}s</span>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResend}
                  className="text-theme font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
