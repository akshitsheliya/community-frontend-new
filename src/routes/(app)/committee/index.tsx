import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/(app)/committee/')({
  component: CommitteeComponent,
})

function CommitteeComponent() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Committee" 
        description="Manage committee settings and details."
      />
      
      <EmptyState 
        title="Coming Soon" 
        description="This feature is currently under development."
        icon={<FileText className="h-10 w-10 text-gray-400" />}
      />
    </div>
  )
}
