import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi, getCategoryIcon, type Business } from '@/lib/business-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, 
  Plus,
  Search,
  Filter,
  ArrowLeft,
  X
} from 'lucide-react';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessDetailDialog } from '@/components/business/BusinessDetailDialog';
import { AddBusinessDialog } from '@/components/business/AddBusinessDialog';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/business/')({
  component: BusinessDirectoryPage,
});

function BusinessDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  const { data: businesses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['businesses'],
    queryFn: businessApi.getAll
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['business-categories'],
    queryFn: businessApi.getCategories
  });
  
  // Get unique categories from existing businesses (for quick filter)
  const activeCategories = useMemo(() => {
    const cats = new Set<string>();
    businesses.forEach(b => b.category && cats.add(b.category));
    return Array.from(cats).sort();
  }, [businesses]);
  
  // Filter businesses
  const filtered = useMemo(() => {
    return businesses.filter(b => {
      // Category filter
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      
      // Search filter
      if (search) {
        const query = search.toLowerCase();
        return (
          b.business_name?.toLowerCase().includes(query) ||
          b.city?.toLowerCase().includes(query) ||
          b.category?.toLowerCase().includes(query) ||
          b.contact_number?.includes(query) ||
          b.business_type?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [businesses, search, selectedCategory]);
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Business Directory</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} listed
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#A32328] hover:bg-[#8B1E22] text-white shadow-sm"
          size="sm"
        >
          <Plus size={16} className="mr-1" />
          Add Business
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by name, city, category, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-12 bg-gray-50 border-transparent focus:bg-white focus:border-[#A32328] focus:ring-[#A32328]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter by Category</span>
          </div>
          {categories.length > activeCategories.length && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs text-[#A32328] font-semibold hover:underline"
            >
              {showAllCategories ? 'Show Active Only' : 'Show All Categories'}
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {/* All Categories */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 border
              ${selectedCategory === 'all' 
                ? 'bg-[#A32328] text-white border-[#A32328]' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }
            `}
          >
            📋 All Businesses
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {businesses.length}
            </span>
          </button>
          
          {/* Category chips */}
          {(showAllCategories ? categories.map(c => c.name_eng) : activeCategories).map((cat) => {
            const count = businesses.filter(b => b.category === cat).length;
            const isActive = selectedCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 border
                  ${isActive 
                    ? 'bg-[#A32328] text-white border-[#A32328]' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                  }
                `}
              >
                <span className="text-sm">{getCategoryIcon(cat)}</span>
                {cat}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Results Count */}
      {(search || selectedCategory !== 'all') && (
        <div className="flex items-center gap-2 px-1">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-bold text-[#A32328]">{filtered.length}</span> of {businesses.length}
            {selectedCategory !== 'all' && (
              <span> in <span className="font-bold text-gray-900">{selectedCategory}</span></span>
            )}
          </p>
          <div className="flex-1 h-px bg-gray-200 ml-2" />
        </div>
      )}
      
      {/* Businesses Grid */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-64">
              <div className="h-32 bg-gray-100 rounded-xl animate-pulse mb-4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#A3232810] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-[#A32328]" size={36} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {businesses.length === 0 ? 'No businesses listed yet' : 'No matching results found'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {businesses.length === 0 
              ? 'Be the first to list your business in the community directory and get discovered!'
              : 'Try adjusting your search terms or clearing the category filters to see more results.'}
          </p>
          <Button 
            onClick={() => businesses.length === 0 ? setShowAddDialog(true) : setSearch('')}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
          >
            {businesses.length === 0 ? (
              <><Plus size={16} className="mr-2" /> List Your Business</>
            ) : (
              'Clear Search'
            )}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((business) => (
            <BusinessCard
              key={business.business_uuid}
              business={business}
              onClick={() => setSelectedBusiness(business)}
            />
          ))}
        </div>
      )}
      
      {/* Detail Dialog */}
      {selectedBusiness && (
        <BusinessDetailDialog 
          business={selectedBusiness}
          open={!!selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          currentMemberId={userData.member_id}
        />
      )}
      
      {/* Add Dialog */}
      <AddBusinessDialog 
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
