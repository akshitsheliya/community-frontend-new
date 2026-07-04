import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRequestApi } from '@/lib/family-join-api';
import { Button } from '@/components/ui/button';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock,
  Phone,
  MapPin,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading-page';

export const Route = createFileRoute('/(app)/family-requests/')({
  component: FamilyRequestsPage,
});

function FamilyRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['incoming-requests'],
    queryFn: joinRequestApi.getIncoming
  });
  
  const approveMutation = useMutation({
    mutationFn: (uuid: string) => joinRequestApi.approve(uuid),
    onSuccess: () => {
      toast.success('Request approved! Member has joined your family.');
      queryClient.invalidateQueries({ queryKey: ['incoming-requests'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
    },
    onError: () => toast.error('Failed to approve request')
  });
  
  const rejectMutation = useMutation({
    mutationFn: (uuid: string) => joinRequestApi.reject(uuid),
    onSuccess: () => {
      toast.info('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['incoming-requests'] });
    }
  });
  
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-[#A32328] text-white flex items-center justify-center">
          <Inbox size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Family Join Requests</h1>
          <p className="text-xs text-gray-500">
            {pendingRequests.length} pending {pendingRequests.length === 1 ? 'request' : 'requests'}
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingPage message="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Inbox className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Requests Yet
          </h3>
          <p className="text-sm text-gray-500">
            When someone wants to join your family, requests will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Pending ({pendingRequests.length})
              </h2>
              {pendingRequests.map((req) => (
                <RequestCard
                  key={req.request_uuid}
                  request={req}
                  onApprove={() => approveMutation.mutate(req.request_uuid)}
                  onReject={() => {
                    if (window.confirm('Are you sure you want to reject this request?')) {
                      rejectMutation.mutate(req.request_uuid);
                    }
                  }}
                  isProcessing={approveMutation.isPending || rejectMutation.isPending}
                />
              ))}
            </div>
          )}
          
          {/* Processed */}
          {processedRequests.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Processed
              </h2>
              {processedRequests.map((req) => (
                <RequestCard
                  key={req.request_uuid}
                  request={req}
                  readOnly
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Sub-component
function RequestCard({ request, onApprove, onReject, isProcessing, readOnly }: any) {
  const initials = `${request.requester_first_name?.[0] || ''}${request.requester_surname?.[0] || ''}`;
  
  const statusConfig: any = {
    pending: { color: 'yellow', label: 'Pending', icon: Clock },
    approved_by_family: { color: 'green', label: 'Approved', icon: CheckCircle2 },
    rejected_by_family: { color: 'red', label: 'Rejected', icon: XCircle },
    cancelled: { color: 'gray', label: 'Cancelled', icon: XCircle }
  };
  
  const config = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        {/* Requester Info */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {request.requester_photo ? (
              <img 
                src={request.requester_photo} 
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials || <User size={20} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">
              {request.requester_first_name} {request.requester_surname}
            </p>
            {request.requester_father_name && (
              <p className="text-xs text-gray-500">
                s/o {request.requester_father_name}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {request.requester_phone && (
                <span className="flex items-center gap-1">
                  <Phone size={10} />
                  {request.requester_phone}
                </span>
              )}
              {request.requester_gender && (
                <span>{request.requester_gender}</span>
              )}
            </div>
          </div>
          
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            bg-${config.color}-50 text-${config.color}-700
          `}>
            <StatusIcon size={12} />
            {config.label}
          </div>
        </div>
        
        {/* Claim */}
        <div className="mt-3 p-3 bg-gradient-to-r from-[#A32328] to-[#8B1E22] rounded-lg text-white">
          <p className="text-xs opacity-75 mb-1">Claims to be your:</p>
          <p className="text-lg font-bold capitalize">
            {request.claimed_relationship}
          </p>
        </div>
        
        {/* Actions */}
        {!readOnly && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={onReject}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle size={14} className="mr-1" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 size={14} className="mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
