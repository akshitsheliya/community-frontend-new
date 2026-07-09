import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { noticeBoardApi, type NoticeType } from '@/lib/notice-board-api';
import { toast } from 'sonner';
import { Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = [
  { value: 'news', label: 'News/Announcement', icon: '📰' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'meeting', label: 'Meeting', icon: '👥' },
  { value: 'maran_nondh', label: 'Death Notice', icon: '🙏' }
];

export function CreateNoticeDialog({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<NoticeType>('news');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  
  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('feed_title', title);
      formData.append('feed_description', description);
      formData.append('feed_type', type);
      
      if (type === 'event' || type === 'meeting') {
        if (eventDateTime) formData.append('event_date_time', eventDateTime);
        if (eventAddress) formData.append('event_address', eventAddress);
      }
      
      if (photo) {
        formData.append('feed_photo_video', photo);
      }
      
      return noticeBoardApi.create(formData);
    },
    onSuccess: () => {
      toast.success('Notice posted successfully!');
      handleClose();
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to post notice');
    }
  });
  
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('news');
    setEventDateTime('');
    setEventAddress('');
    setPhoto(null);
    onClose();
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    mutation.mutate();
  };
  
  const showEventFields = type === 'event' || type === 'meeting';
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle>Post New Notice</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Type selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value as NoticeType)}
                  className={`
                    p-3 rounded-xl border-2 transition text-left
                    ${type === t.value 
                      ? 'border-[#A32328] bg-[#A3232815]' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <p className="text-xs font-medium text-gray-900">
                    {t.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title..."
              maxLength={200}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A32328]"
            />
          </div>
          
          {/* Event fields */}
          {showEventFields && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                  <Calendar size={14} />
                  Event Date & Time
                </label>
                <Input 
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                  <MapPin size={14} />
                  Address
                </label>
                <Input 
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  placeholder="Event location..."
                />
              </div>
            </>
          )}
          
          {/* Photo upload */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <ImageIcon size={14} />
              Photo (Optional)
            </label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#A3232815] file:text-[#A32328] file:text-sm hover:file:bg-[#A3232825]"
            />
            {photo && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {photo.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <Button 
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={mutation.isPending || !title.trim() || !description.trim()}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22]"
          >
            {mutation.isPending ? 'Posting...' : 'Post Notice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
