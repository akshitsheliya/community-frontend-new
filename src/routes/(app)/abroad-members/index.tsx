import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abroadApi, type AbroadMember } from '@/lib/abroad-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plane, Plus, Search, Phone, Briefcase, MapPin, 
  ArrowLeft, Trash2, Globe, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { AddAbroadMemberDialog } from '@/components/abroad/AddAbroadMemberDialog';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/abroad-members/')({
  component: AbroadMembersPage,
});

function AbroadMembersPage() {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: members = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['abroad-members'],
    queryFn: abroadApi.getAll
  });
  
  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => abroadApi.delete(uuid),
    onSuccess: () => {
      toast.success('Removed');
      queryClient.invalidateQueries({ queryKey: ['abroad-members'] });
    }
  });
  
  const countries = useMemo(() => {
    const s = new Set<string>();
    members.forEach(m => m.country && s.add(m.country));
    return Array.from(s).sort();
  }, [members]);
  
  const filtered = useMemo(() => {
    return members.filter(m => {
      if (countryFilter !== 'all' && m.country !== countryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.full_name?.toLowerCase().includes(q) ||
               m.country?.toLowerCase().includes(q) ||
               m.city?.toLowerCase().includes(q) ||
               m.career?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [members, search, countryFilter]);
  
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
            <h1 className="text-xl font-bold">Abroad Members</h1>
            <p className="text-xs text-gray-500">
              {members.length} members across the world 🌍
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white" size="sm">
            <Plus size={16} className="mr-1" />Add Member
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name, country, career..." 
            value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCountryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              countryFilter === 'all' ? 'bg-[#A32328] text-white' : 'bg-gray-100'
            }`}>
            🌍 All Countries ({members.length})
          </button>
          {countries.map(c => {
            const count = members.filter(m => m.country === c).length;
            return (
              <button key={c} onClick={() => setCountryFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  countryFilter === c ? 'bg-[#A32328] text-white' : 'bg-gray-100'
                }`}>
                {c} ({count})
              </button>
            );
          })}
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Plane className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 mb-4">
            {members.length === 0 ? 'No abroad members yet' : 'No matches found'}
          </p>
          {isAdmin && members.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}
              className="bg-[#A32328] hover:bg-[#8B1E22] text-white">
              <Plus size={16} className="mr-2" />Add First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(m => {
            const initials = m.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);
            return (
              <div key={m.abroad_uuid} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                    {m.passport_photo ? (
                      <img src={m.passport_photo} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : initials}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{m.full_name}</h3>
                    {m.designation && (
                      <p className="text-xs text-gray-600 truncate">{m.designation}</p>
                    )}
                    
                    <div className="mt-2 space-y-1">
                      {(m.country || m.city) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={11} />
                          {[m.city, m.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {m.career && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Briefcase size={11} />
                          {m.career}
                          {m.experience_year && ` • ${m.experience_year} yrs exp`}
                        </p>
                      )}
                      {m.contact_number && (
                        <a href={`tel:${m.contact_number}`} 
                          className="text-xs text-[#A32328] flex items-center gap-1 hover:underline">
                          <Phone size={11} />
                          {m.contact_number}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('Remove this member?')) deleteMutation.mutate(m.abroad_uuid);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <AddAbroadMemberDialog 
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => {
          setShowAddDialog(false);
          queryClient.invalidateQueries({ queryKey: ['abroad-members'] });
        }}
      />
    </div>
  );
}
