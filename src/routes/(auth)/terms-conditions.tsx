import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/(auth)/terms-conditions')({
  component: TermsConditionsComponent,
})

function TermsConditionsComponent() {
  return (
    <AuthLayout>
      <div className="p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Terms Conditions</h2>
        <p className="text-gray-500 mb-8">This page is under construction.</p>
        <Link to="/login" className="inline-flex items-center justify-center text-sm font-medium text-theme hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Link>
      </div>
    </AuthLayout>
  )
}
