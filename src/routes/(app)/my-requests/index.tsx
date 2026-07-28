import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRequestApi } from '@/lib/family-join-api';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Home,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/my-requests/')({
  component: MyRequestsPage,
});

function MyRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: joinRequestApi.getMyRequests
  });
  
  const cancelMutation = useMutation({
    mutationFn: (uuid: string) => joinRequestApi.cancel(uuid),
    onSuccess: () => {
      toast.info('Request cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    }
  });
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Join Requests</h1>
          <p className="text-xs text-gray-500">
            Track your family join requests
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Send className="mx-auto text-gray-400 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Requests Sent
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You haven't sent any family join requests yet.
          </p>
          <Button 
            onClick={() => navigate({ to: '/find-family', search: { from: undefined } })}
            className="bg-[#A32328] hover:bg-[#8B1E22]"
          >
            Find My Family
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusConfig: any = {
              pending: { color: 'yellow', label: 'Pending Review', icon: Clock },
              approved_by_family: { color: 'green', label: 'Approved!', icon: CheckCircle2 },
              rejected_by_family: { color: 'red', label: 'Rejected', icon: XCircle },
              cancelled: { color: 'gray', label: 'Cancelled', icon: XCircle }
            };
            const config = statusConfig[req.status] || statusConfig.pending;
            const Icon = config.icon;
            
            return (
              <div key={req.request_uuid} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-[#A32328]" />
                    <p className="font-semibold">
                      {req.family_head_first_name} {req.family_head_surname}'s Family
                    </p>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                    bg-${config.color}-50 text-${config.color}-700
                  `}>
                    <Icon size={12} />
                    {config.label}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Claimed relationship: <span className="font-medium capitalize">{req.claimed_relationship}</span>
                </p>
                
                {req.review_note && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    "{req.review_note}"
                  </p>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  Sent {new Date(req.created_at).toLocaleDateString()}
                </p>
                
                {req.status === 'pending' && (
                  <Button
                    onClick={() => cancelMutation.mutate(req.request_uuid)}
                    disabled={cancelMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
