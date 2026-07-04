import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matcherApi } from '@/lib/family-matcher-api';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { SuggestionCard } from '@/components/admin/SuggestionCard';
import { StatsCard } from '@/components/admin/StatsCard';
import { toast } from 'sonner';

export const Route = createFileRoute('/(app)/admin/suggestions/')({
  beforeLoad: () => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.is_community_admin) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: SuggestionsAdminPage,
});

type FilterType = 'all' | 'high' | 'medium';
type StatusType = 'pending' | 'confirmed' | 'rejected';

function SuggestionsAdminPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [status, setStatus] = useState<StatusType>('pending');
  const queryClient = useQueryClient();
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['matcher-stats'],
    queryFn: matcherApi.getStats
  });
  
  // Fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['matcher-suggestions', status, filter],
    queryFn: () => matcherApi.getSuggestions({
      status,
      confidence: filter === 'all' ? undefined : filter
    })
  });
  
  // Trigger scan mutation
  const scanMutation = useMutation({
    mutationFn: matcherApi.triggerScan,
    onSuccess: (data) => {
      toast.success(
        `Scan complete! Found ${data.data?.suggestionsCreated || 0} new suggestions`
      );
      queryClient.invalidateQueries({ queryKey: ['matcher-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['matcher-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Scan failed');
    }
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (uuid: string) => matcherApi.approveSuggestion(uuid),
    onSuccess: () => {
      toast.success('Relationship approved and created!');
      queryClient.invalidateQueries({ queryKey: ['matcher-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['matcher-stats'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
    },
    onError: () => {
      toast.error('Failed to approve suggestion');
    }
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (uuid: string) => matcherApi.rejectSuggestion(uuid),
    onSuccess: () => {
      toast.info('Suggestion rejected');
      queryClient.invalidateQueries({ queryKey: ['matcher-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['matcher-stats'] });
    }
  });
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A32328] to-[#8B1E22] text-white flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Suggestions</h1>
            <p className="text-xs text-gray-500">
              Smart family match recommendations
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="bg-[#A32328] hover:bg-[#8B1E22] text-white w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw 
            size={16} 
            className={`mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} 
          />
          {scanMutation.isPending ? 'Scanning...' : 'Run New Scan'}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard
          icon={<Clock size={16} />}
          label="Pending"
          value={stats?.pending || 0}
          color="yellow"
        />
        <StatsCard
          icon={<TrendingUp size={16} />}
          label="High Confidence"
          value={stats?.high_confidence || 0}
          color="green"
        />
        <StatsCard
          icon={<CheckCircle2 size={16} />}
          label="Approved"
          value={stats?.confirmed || 0}
          color="blue"
        />
        <StatsCard
          icon={<Users size={16} />}
          label="Total"
          value={stats?.total || 0}
          color="gray"
        />
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setStatus('pending')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              status === 'pending' ? 'bg-white text-[#A32328] shadow-sm' : 'text-gray-600'
            }`}
          >
            Pending ({stats?.pending || 0})
          </button>
          <button
            onClick={() => setStatus('confirmed')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              status === 'confirmed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatus('rejected')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              status === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Rejected
          </button>
        </div>
        
        {/* Confidence filter */}
        {status === 'pending' && (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">Confidence:</span>
            <div className="flex gap-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as FilterType)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filter === f.value 
                      ? 'bg-[#A32328] text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Suggestions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No {status} suggestions
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {status === 'pending' 
              ? 'Click "Run New Scan" to find potential family matches'
              : `No ${status} suggestions to display`}
          </p>
          {status === 'pending' && (
            <Button 
              onClick={() => scanMutation.mutate()}
              disabled={scanMutation.isPending}
              className="bg-[#A32328] hover:bg-[#8B1E22]"
            >
              <Sparkles size={16} className="mr-2" />
              Run First Scan
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.suggestion_uuid}
              suggestion={suggestion}
              onApprove={() => approveMutation.mutate(suggestion.suggestion_uuid)}
              onReject={() => rejectMutation.mutate(suggestion.suggestion_uuid)}
              isApproving={approveMutation.isPending}
              isRejecting={rejectMutation.isPending}
              readOnly={status !== 'pending'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
