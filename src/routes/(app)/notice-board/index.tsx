import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeBoardApi, type NoticeType } from '@/lib/notice-board-api';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Newspaper, 
  Filter,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { NoticeCard } from '@/components/notice-board/NoticeCard';
import { CreateNoticeDialog } from '@/components/notice-board/CreateNoticeDialog';

export const Route = createFileRoute('/(app)/notice-board/')({
  component: NoticeBoardPage,
});

type FilterType = 'all' | NoticeType;

function NoticeBoardPage() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: noticeBoardApi.getAll
  });
  
  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => noticeBoardApi.delete(uuid),
    onSuccess: () => {
      toast.success('Notice deleted');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => toast.error('Failed to delete')
  });
  
  // Filter notices
  const filteredNotices = filter === 'all' 
    ? notices 
    : notices.filter((n: any) => n.feed_type === filter);
  
  const handleDelete = (uuid: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    deleteMutation.mutate(uuid);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notice Board</h1>
            <p className="text-xs text-gray-500">
              {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add Notice
          </Button>
        )}
      </div>
      
      {/* Filter Chips */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Filter by Type</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: 'all', label: 'All', icon: '📋' },
            { value: 'news', label: 'News', icon: '📰' },
            { value: 'event', label: 'Events', icon: '🎉' },
            { value: 'meeting', label: 'Meetings', icon: '👥' },
            { value: 'maran_nondh', label: 'Death Notice', icon: '🙏' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as FilterType)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition
                flex items-center gap-1
                ${filter === f.value 
                  ? 'bg-[#A32328] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{f.icon}</span>
              {f.label}
              {filter !== f.value && f.value !== 'all' && (
                <span className="ml-1 text-gray-500">
                  ({notices.filter((n: any) => n.feed_type === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Notices List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Newspaper className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {filter === 'all' ? 'No notices yet' : 'No notices in this category'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isAdmin 
              ? 'Post announcements, events and news for your community'
              : 'Check back later for updates from your community'}
          </p>
          {isAdmin && (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#A32328] hover:bg-[#8B1E22]"
            >
              <Plus size={16} className="mr-2" />
              Post First Notice
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice: any) => (
            <NoticeCard
              key={notice.feed_uuid}
              notice={notice}
              isAdmin={isAdmin}
              onDelete={() => handleDelete(notice.feed_uuid)}
              onEdit={() => {
                // TODO: Implement edit
                toast.info('Edit coming soon');
              }}
            />
          ))}
        </div>
      )}
      
      {/* Create Dialog */}
      <CreateNoticeDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          queryClient.invalidateQueries({ queryKey: ['notices'] });
        }}
      />
    </div>
  );
}
