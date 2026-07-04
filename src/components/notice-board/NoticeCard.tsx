import { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getNoticeTypeConfig, type Notice } from '@/lib/notice-board-api';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  notice: Notice;
  isAdmin: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export function NoticeCard({ notice, isAdmin, onDelete, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const config = getNoticeTypeConfig(notice.feed_type);
  
  const isLong = notice.feed_description && notice.feed_description.length > 200;
  const displayDesc = expanded || !isLong 
    ? notice.feed_description 
    : notice.feed_description?.substring(0, 200) + '...';
  
  const timeAgo = notice.added_on 
    ? formatDistanceToNow(new Date(notice.added_on), { addSuffix: true })
    : '';
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with type badge */}
      <div className={`px-4 py-2 border-b border-gray-50 flex items-center justify-between ${config.bgClass}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide">
            {config.label}
          </span>
        </div>
        
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/50 rounded"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {notice.feed_title}
        </h3>
        
        {/* Image if exists */}
        {notice.feed_photo_video && (
          <div className="mb-3 rounded-xl overflow-hidden">
            <img 
              src={notice.feed_photo_video} 
              alt={notice.feed_title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Description */}
        {notice.feed_description && (
          <>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayDesc}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#A32328] font-medium mt-2 flex items-center gap-1"
              >
                {expanded ? (
                  <>Show less <ChevronUp size={12} /></>
                ) : (
                  <>Read more <ChevronDown size={12} /></>
                )}
              </button>
            )}
          </>
        )}
        
        {/* Event details */}
        {(notice.event_date_time || notice.event_address) && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1.5">
            {notice.event_date_time && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={14} className="text-[#A32328]" />
                <span>{new Date(notice.event_date_time).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}</span>
              </div>
            )}
            {notice.event_address && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin size={14} className="text-[#A32328] mt-0.5" />
                <span>{notice.event_address}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center">
            <User size={10} />
          </div>
          <span>
            {notice.author_first_name || 'Community Admin'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
