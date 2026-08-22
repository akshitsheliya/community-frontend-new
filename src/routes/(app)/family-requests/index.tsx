import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRequestApi } from '@/lib/family-join-api';
import { familyGraphApi } from '@/lib/family-graph-api';
import { Button } from '@/components/ui/button';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock,
  Phone,
  ArrowLeft,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading-page';
import { getParentPrefix } from '@/lib/text-helpers';

export const Route = createFileRoute('/(app)/family-requests/')({
  component: FamilyRequestsPage,
});

function FamilyRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch Family Join Requests
  const { data: requests = [], isLoading: loadingJoin } = useQuery({
    queryKey: ['incoming-requests'],
    queryFn: joinRequestApi.getIncoming
  });

  // Fetch Family Tree Relationship Requests
  const { data: relationshipRequests = [], isLoading: loadingRel } = useQuery({
    queryKey: ['pending-relationships'],
    queryFn: familyGraphApi.getPending
  });
  
  // Family Join Request mutations
  const approveJoinMutation = useMutation({
    mutationFn: (uuid: string) => joinRequestApi.approve(uuid),
    onSuccess: () => {
      toast.success('Request approved! Member has joined your family.');
      queryClient.invalidateQueries({ queryKey: ['incoming-requests'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
    },
    onError: () => toast.error('Failed to approve request')
  });
  
  const rejectJoinMutation = useMutation({
    mutationFn: (uuid: string) => joinRequestApi.reject(uuid),
    onSuccess: () => {
      toast.info('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['incoming-requests'] });
    }
  });

  // Relationship Request mutations
  const approveRelMutation = useMutation({
    mutationFn: (uuid: string) => familyGraphApi.approveRelationship(uuid),
    onSuccess: () => {
      toast.success('Relationship approved! Added to your family tree.');
      queryClient.invalidateQueries({ queryKey: ['pending-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
    },
    onError: () => toast.error('Failed to approve relationship')
  });

  const rejectRelMutation = useMutation({
    mutationFn: (uuid: string) => familyGraphApi.rejectRelationship(uuid),
    onSuccess: () => {
      toast.info('Relationship request rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-relationships'] });
    }
  });
  
  const pendingJoinRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');
  const totalPending = pendingJoinRequests.length + relationshipRequests.length;
  const isLoading = loadingJoin || loadingRel;
  
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
          <h1 className="text-xl font-bold text-gray-900">Family & Tree Requests</h1>
          <p className="text-xs text-gray-500">
            {totalPending} pending {totalPending === 1 ? 'request' : 'requests'}
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingPage message="Loading requests..." />
      ) : (totalPending === 0 && processedRequests.length === 0) ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Inbox className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Requests Yet
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When someone wants to join your family or add you to their family tree, requests will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* SECTION 1: Pending Tree Relationship Requests */}
          {relationshipRequests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TreePine size={16} className="text-[#A32328]" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Family Tree Requests ({relationshipRequests.length})
                </h2>
              </div>

              {relationshipRequests.map((req: any) => {
                const name = `${req.from_first_name || ''} ${req.from_surname || ''}`.trim();
                const initials = `${req.from_first_name?.[0] || ''}${req.from_surname?.[0] || ''}`;
                
                return (
                  <div key={req.relationship_uuid} className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border border-[#A32328]/20">
                        {req.from_photo ? (
                          <img src={req.from_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          initials || <User size={20} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {name}
                        </p>
                        {req.from_phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={10} />
                            {req.from_phone}
                          </p>
                        )}
                      </div>

                      <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Tree Request
                      </span>
                    </div>

                    <div className="mt-3 p-3 bg-gradient-to-r from-[#A32328] to-[#8B1E22] rounded-xl text-white">
                      <p className="text-xs opacity-80 mb-0.5">Wants to add you as:</p>
                      <p className="text-base font-bold capitalize">
                        {req.inverse_label || req.relationship_label}
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this relationship?')) {
                            rejectRelMutation.mutate(req.relationship_uuid);
                          }
                        }}
                        disabled={approveRelMutation.isPending || rejectRelMutation.isPending}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>

                      <Button
                        onClick={() => approveRelMutation.mutate(req.relationship_uuid)}
                        disabled={approveRelMutation.isPending || rejectRelMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Approve & Add to Tree
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2: Pending Family Join Requests */}
          {pendingJoinRequests.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Family Join Requests ({pendingJoinRequests.length})
              </h2>
              {pendingJoinRequests.map((req) => (
                <RequestCard
                  key={req.request_uuid}
                  request={req}
                  onApprove={() => approveJoinMutation.mutate(req.request_uuid)}
                  onReject={() => {
                    if (window.confirm('Are you sure you want to reject this request?')) {
                      rejectJoinMutation.mutate(req.request_uuid);
                    }
                  }}
                  isProcessing={approveJoinMutation.isPending || rejectJoinMutation.isPending}
                />
              ))}
            </div>
          )}
          
          {/* SECTION 3: Processed Requests */}
          {processedRequests.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Processed Requests
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
                {getParentPrefix(request.requester_gender)} {request.requester_father_name}
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
