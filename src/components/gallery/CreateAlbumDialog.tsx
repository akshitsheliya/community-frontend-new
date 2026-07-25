import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { galleryApi } from '@/lib/gallery-api';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export function CreateAlbumDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    photo_album_name: '',
    photo_album_year: new Date().getFullYear().toString(),
    folder_name: ''
  });
  
  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      // Auto-generate folder_name if empty
      if (!form.folder_name) {
        const generated = form.photo_album_name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + form.photo_album_year;
        fd.set('folder_name', generated);
      }
      return galleryApi.createAlbum(fd);
    },
    onSuccess: () => {
      toast.success('Album created!');
      handleClose();
      onSuccess();
    },
    onError: () => toast.error('Failed to create album')
  });
  
  const handleClose = () => {
    setForm({ 
      photo_album_name: '', 
      photo_album_year: new Date().getFullYear().toString(),
      folder_name: '' 
    });
    onClose();
  };
  
  const isValid = form.photo_album_name.trim();
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader><DialogTitle>Create Album</DialogTitle></DialogHeader>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Album Name *</label>
            <Input value={form.photo_album_name} placeholder="e.g. Diwali 2025"
              onChange={e => setForm({...form, photo_album_name: e.target.value})} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Year *</label>
            <Input value={form.photo_album_year}
              onChange={e => setForm({...form, photo_album_year: e.target.value})} />
          </div>

          <div>
             <label className="text-sm font-medium mb-1 block">Folder Name (Optional)</label>
             <Input value={form.folder_name} placeholder="auto-generated if empty"
                onChange={e => setForm({...form, folder_name: e.target.value})} />
             <p className="text-[10px] text-gray-500 mt-1">Used for storage. Use lowercase letters and underscores.</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white">
            {mutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
