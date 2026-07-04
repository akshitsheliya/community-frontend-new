import * as React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden p-4">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-theme-light rounded-b-[50%] scale-150 transform -translate-y-10 z-0"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-20 w-20 bg-white rounded-full shadow-md flex items-center justify-center p-2 mb-4 border border-gray-100">
            {/* Placeholder for logo - using a Lucide icon temporarily if image not available */}
            <div className="h-12 w-12 bg-theme-light rounded-full flex items-center justify-center">
              <span className="text-theme font-bold text-xl">US</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Umarala Gam Samast
          </h1>
          <h2 className="text-lg font-medium text-theme">
            Leuva Patel Samaj
          </h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {children}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} Umarala Gam Samast Leuva Patel Samaj</p>
        </div>
      </div>
    </div>
  )
}
