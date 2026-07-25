import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi, type Album } from '@/lib/gallery-api';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, Plus, ArrowLeft, Calendar, 
  Camera, FolderOpen, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateAlbumDialog } from '@/components/gallery/CreateAlbumDialog';
import { AlbumPhotosDialog } from '@/components/gallery/AlbumPhotosDialog';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/gallery/')({
  component: GalleryPage,
});

function GalleryPage() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [yearFilter, setYearFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: albums = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: galleryApi.getAlbums
  });
  
  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => galleryApi.deleteAlbum(uuid),
    onSuccess: () => {
      toast.success('Album deleted');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    }
  });
  
  const years = Array.from(new Set(albums.map(a => a.photo_album_year))).sort().reverse();
  
  const filtered = yearFilter === 'all' 
    ? albums 
    : albums.filter(a => a.photo_album_year === yearFilter);
  
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Photo Gallery</h1>
            <p className="text-xs text-gray-500">
              {albums.length} {albums.length === 1 ? 'album' : 'albums'} 📸
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white" size="sm">
            <Plus size={16} className="mr-1" />New Album
          </Button>
        )}
      </div>
      
      {years.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setYearFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                yearFilter === 'all' ? 'bg-[#A32328] text-white' : 'bg-gray-100'
              }`}>
              All Years
            </button>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  yearFilter === y ? 'bg-[#A32328] text-white' : 'bg-gray-100'
                }`}>
                {y}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 mb-4">
            {albums.length === 0 ? 'No albums yet' : 'No albums for this year'}
          </p>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}
              className="bg-[#A32328] hover:bg-[#8B1E22] text-white">
              <Plus size={16} className="mr-2" />Create First Album
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(album => (
            <div key={album.album_uuid}
              onClick={() => setSelectedAlbum(album)}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all">
              <div className="aspect-square bg-gradient-to-br from-[#A3232815] to-[#A3232830] flex items-center justify-center relative">
                <FolderOpen size={48} className="text-[#A32328] opacity-60" />
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this album and all photos?')) {
                        deleteMutation.mutate(album.album_uuid);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {album.photo_album_name}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar size={9} />
                    {album.photo_album_year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <CreateAlbumDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          queryClient.invalidateQueries({ queryKey: ['albums'] });
        }}
      />
      
      {selectedAlbum && (
        <AlbumPhotosDialog
          album={selectedAlbum}
          open={!!selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
