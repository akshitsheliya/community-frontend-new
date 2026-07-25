import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorsApi, DONATION_CATEGORIES, type Donor } from '@/lib/donors-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Plus,
  Search,
  Phone,
  Award,
  Calendar,
  ArrowLeft,
  Filter,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { AddDonorDialog } from '@/components/donors/AddDonorDialog';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/donors/')({
  component: DonorsPage,
});

function DonorsPage() {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: donors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['donors'],
    queryFn: donorsApi.getAll
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => donorsApi.delete(id),
    onSuccess: () => {
      toast.success('Donor removed');
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    }
  });
  
  // Get unique years
  const years = useMemo(() => {
    const set = new Set<string>();
    donors.forEach(d => d.donation_year && set.add(d.donation_year));
    return Array.from(set).sort().reverse();
  }, [donors]);
  
  // Filter
  const filtered = useMemo(() => {
    return donors.filter(d => {
      if (yearFilter !== 'all' && d.donation_year !== yearFilter) return false;
      if (categoryFilter !== 'all' && d.donation_category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.donor_name?.toLowerCase().includes(q) ||
               d.donor_mobile_no?.includes(q);
      }
      return true;
    });
  }, [donors, search, yearFilter, categoryFilter]);
  
  const lifetimeDonors = filtered.filter(d => d.is_lifetime_donor === 1);
  const yearlyDonors = filtered.filter(d => d.is_lifetime_donor !== 1);
  
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 pb-8">
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
            <h1 className="text-xl font-bold text-gray-900">Donors</h1>
            <p className="text-xs text-gray-500">
              {donors.length} {donors.length === 1 ? 'donor' : 'donors'} • Thank you for your support 🙏
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add Donor
          </Button>
        )}
      </div>
      
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Year Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setYearFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              yearFilter === 'all' ? 'bg-[#A32328] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Years
          </button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                yearFilter === y ? 'bg-[#A32328] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      
      {/* Lifetime Donors */}
      {lifetimeDonors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-500" size={18} />
            <h3 className="font-semibold text-gray-900">Lifetime Donors</h3>
            <span className="text-xs text-gray-500">({lifetimeDonors.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lifetimeDonors.map(donor => (
              <DonorCard key={donor.donor_id} donor={donor} isAdmin={isAdmin} 
                onDelete={() => {
                  if (confirm('Remove this donor?')) deleteMutation.mutate(donor.donor_id);
                }} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Yearly Donors */}
      {yearlyDonors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-[#A32328]" size={18} />
            <h3 className="font-semibold text-gray-900">Recent Donors</h3>
            <span className="text-xs text-gray-500">({yearlyDonors.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {yearlyDonors.map(donor => (
              <DonorCard key={donor.donor_id} donor={donor} isAdmin={isAdmin}
                onDelete={() => {
                  if (confirm('Remove this donor?')) deleteMutation.mutate(donor.donor_id);
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No donors found</p>
        </div>
      )}
      
      <AddDonorDialog 
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => {
          setShowAddDialog(false);
          queryClient.invalidateQueries({ queryKey: ['donors'] });
        }}
      />
    </div>
  );
}

function DonorCard({ donor, isAdmin, onDelete }: any) {
  const initials = donor.donor_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div className={`
      bg-white rounded-2xl border p-4 relative
      ${donor.is_lifetime_donor === 1 ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-gray-100'}
    `}>
      {donor.is_lifetime_donor === 1 && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Award size={12} />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0
          ${donor.is_lifetime_donor === 1 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-[#A3232815] text-[#A32328]'
          }
        `}>
          {donor.donor_photo ? (
            <img src={donor.donor_photo} alt="" className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <p className="font-semibold text-gray-900 truncate">{donor.donor_name}</p>
          
          {donor.donation_category && (
            <p className="text-xs text-gray-600 mt-0.5">
              {donor.donation_category}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {donor.donor_mobile_no && (
              <a href={`tel:${donor.donor_mobile_no}`} className="flex items-center gap-1 hover:text-[#A32328]">
                <Phone size={11} />
                {donor.donor_mobile_no}
              </a>
            )}
            {donor.donation_year && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {donor.donation_year}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <button
          onClick={onDelete}
          className="absolute bottom-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
