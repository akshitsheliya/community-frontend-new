import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, getNotificationConfig, type Notification } from '@/lib/notifications-api';
import { Button } from '@/components/ui/button';
import { 
  BellOff,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/notifications/')({
  component: NotificationsPage,
});

type FilterType = 'all' | 'unread' | 'read';

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getAll,
    refetchInterval: 30000 // refresh every 30s
  });
  
  const markReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationApi.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Filter notifications
  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.notification_is_read);
    if (filter === 'read') return notifications.filter(n => n.notification_is_read);
    return notifications;
  }, [notifications, filter]);
  
  const unreadCount = notifications.filter(n => !n.notification_is_read).length;
  
  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      older: []
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    filtered.forEach(notif => {
      const date = new Date(notif.created_at);
      if (date >= today) {
        groups.today.push(notif);
      } else if (date >= yesterday) {
        groups.yesterday.push(notif);
      } else {
        groups.older.push(notif);
      }
    });
    
    return groups;
  }, [filtered]);
  
  const handleNotificationClick = (notif: Notification) => {
    const config = getNotificationConfig(notif.notification_type);
    
    // Mark as read
    if (!notif.notification_is_read) {
      markReadMutation.mutate(notif.notification_uuid);
    }
    
    // Navigate
    navigate({ to: config.route as any });
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: '/dashboard' as any })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              {unreadCount} unread of {notifications.length} total
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={markAllMutation.isPending}
          >
            <CheckCheck size={14} className="mr-1" />
            Mark All Read
          </Button>
        )}
      </div>
      
      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1">
        <div className="flex gap-1">
          {[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'read', label: 'Read', count: notifications.length - unreadCount }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as FilterType)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition
                flex items-center justify-center gap-2
                ${filter === f.value 
                  ? 'bg-[#A32328] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {f.label}
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${filter === f.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
              `}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <BellOff className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {filter === 'unread' 
              ? 'No unread notifications' 
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === 'all' 
              ? "You're all caught up! Check back later for updates."
              : `Switch to "All" to see your ${filter === 'unread' ? 'read' : 'unread'} notifications.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedNotifications.today.length > 0 && (
            <NotificationGroup 
              title="Today"
              notifications={groupedNotifications.today}
              onClick={handleNotificationClick}
            />
          )}
          
          {groupedNotifications.yesterday.length > 0 && (
            <NotificationGroup 
              title="Yesterday"
              notifications={groupedNotifications.yesterday}
              onClick={handleNotificationClick}
            />
          )}
          
          {groupedNotifications.older.length > 0 && (
            <NotificationGroup 
              title="Earlier"
              notifications={groupedNotifications.older}
              onClick={handleNotificationClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

function NotificationGroup({ 
  title, 
  notifications, 
  onClick 
}: { 
  title: string; 
  notifications: Notification[];
  onClick: (n: Notification) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        {title}
      </h3>
      <div className="space-y-2">
        {notifications.map(notif => (
          <NotificationCard 
            key={notif.notification_uuid}
            notification={notif}
            onClick={() => onClick(notif)}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onClick 
}: { 
  notification: Notification; 
  onClick: () => void;
}) {
  const config = getNotificationConfig(notification.notification_type);
  const isUnread = !notification.notification_is_read;
  
  const timeAgo = notification.created_at 
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : '';
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl border p-4 cursor-pointer transition
        hover:shadow-md
        ${isUnread ? 'border-[#A32328]/30 bg-[#A3232805]' : 'border-gray-100'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0
          ${config.bgClass}
        `}>
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${isUnread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {notification.notification_message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {timeAgo}
          </p>
        </div>
        
        {/* Unread dot */}
        {isUnread && (
          <div className="w-2 h-2 rounded-full bg-[#A32328] flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}
