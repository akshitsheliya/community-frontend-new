import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { galleryApi, type Album } from '@/lib/gallery-api';
import { toast } from 'sonner';
import { Image as ImageIcon, Plus, Trash2, X, UploadCloud, Loader2 } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

interface Props { 
  album: Album;
  open: boolean; 
  onClose: () => void; 
  isAdmin: boolean;
}

export function AlbumPhotosDialog({ album, open, onClose, isAdmin }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  
  const { data: photos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['photos', album.album_uuid],
    queryFn: () => galleryApi.getPhotos(album.album_uuid),
    enabled: open
  });
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      files.forEach(f => fd.append('photos', f));
      return galleryApi.uploadPhotos(album.album_uuid, fd);
    },
    onSuccess: () => {
      toast.success('Photos uploaded!');
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ['photos', album.album_uuid] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: () => toast.error('Failed to upload photos')
  });
  
  const handleClose = () => {
    setFiles([]);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-4xl bg-gray-50 h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 bg-white border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{album.photo_album_name}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Year: {album.photo_album_year} • {photos.length} photos</p>
            </div>
            
            {isAdmin && (
               <div className="flex items-center gap-2">
                 <label className="cursor-pointer">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A32328] hover:bg-[#8B1E22] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                      <Plus size={16} /> Add Photos
                    </div>
                 </label>
               </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
           {files.length > 0 && (
             <div className="mb-6 bg-white border border-[#A3232820] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <UploadCloud size={18} className="text-[#A32328]" /> 
                    Ready to upload ({files.length} photos)
                  </h3>
                  <button onClick={() => setFiles([])} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => uploadMutation.mutate()} 
                  disabled={uploadMutation.isPending}
                  className="w-full bg-[#A32328] hover:bg-[#8B1E22] text-white"
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Uploading...</>
                  ) : 'Confirm Upload'}
                </Button>
             </div>
           )}

           {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
           ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
           ) : photos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <ImageIcon size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No photos yet</h3>
                <p className="text-gray-500 max-w-sm">
                  {isAdmin ? "Click 'Add Photos' above to upload photos to this album." : "This album is currently empty."}
                </p>
              </div>
           ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {photos.map(photo => (
                  <div key={photo.photo_uuid} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm cursor-pointer">
                    <img 
                      src={photo.thumb_url || photo.photo_url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                    
                    {/* Add delete logic if admin later */}
                    {/* {isAdmin && (
                      <button className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    )} */}
                  </div>
                ))}
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
