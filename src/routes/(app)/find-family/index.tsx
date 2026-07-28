import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { joinRequestApi } from '@/lib/family-join-api';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Sparkles, 
  ArrowLeft,
  Home,
  Plus,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { FamilyMatchCard } from '@/components/family-join/FamilyMatchCard';
import { JoinRequestDialog } from '@/components/family-join/JoinRequestDialog';

export const Route = createFileRoute('/(app)/find-family/')({
  validateSearch: (search) => ({
    from: search.from as string | undefined,
  }),
  component: FindFamilyPage,
});

function FindFamilyPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const isFirstTime = search.from === 'registration';
  
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [manualSearch, setManualSearch] = useState('');
  const [showAllFamilies, setShowAllFamilies] = useState(false);
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  // AI-detected matches
  const { data: aiMatches = [], isLoading: aiLoading } = useQuery({
    queryKey: ['family-matches'],
    queryFn: joinRequestApi.searchFamilies
  });
  
  // ALL families for manual search
  const { data: allFamilies = [], isLoading: allLoading } = useQuery({
    queryKey: ['all-families'],
    queryFn: async () => {
      // Get all family representatives (family heads)
      const { data } = await api.get('/api/representatives');
      return data.data || [];
    }
  });
  
  // Filter families by manual search
  const filteredFamilies = useMemo(() => {
    if (!manualSearch.trim()) return allFamilies;
    
    const query = manualSearch.toLowerCase();
    return allFamilies.filter((f: any) => {
      const headName = `${f.first_name || f.head_first_name || ''} ${f.surname || f.head_surname || ''}`.toLowerCase();
      const fatherName = (f.father_name || f.head_father_name || '').toLowerCase();
      const phone = (f.phone_number || f.head_phone || '');
      
      return headName.includes(query) || 
             fatherName.includes(query) || 
             phone.includes(query);
    });
  }, [allFamilies, manualSearch]);
  
  // Exclude families already in AI matches
  const aiFamilyUuids = new Set(aiMatches.map((m: any) => m.family_uuid));
  const additionalFamilies = filteredFamilies.filter(
    (f: any) => !aiFamilyUuids.has(f.family_uuid)
  );
  
  const handleSelectFamily = (family: any) => {
    // Normalize family object for dialog
    setSelectedFamily({
      family_uuid: family.family_uuid,
      head_member_uuid: family.member_uuid || family.head_member_uuid,
      head_first_name: family.first_name || family.head_first_name,
      head_surname: family.surname || family.head_surname,
      number_of_family_members: family.number_of_family_members || 1,
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Find My Family</h1>
          <p className="text-xs text-gray-500">
            Connect with your existing family members
          </p>
        </div>
      </div>
      
      {/* First-time welcome */}
      {isFirstTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Welcome to the community! 👋</h3>
              <p className="text-sm text-blue-700 mt-1">
                Let's connect you with your family. Check the AI suggestions below,
                search manually, or start a new family if you don't have anyone here.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Info */}
      <div className="bg-gradient-to-r from-[#A32328] to-[#8B1E22] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck size={16} />
          <span className="text-sm font-medium">Your Profile</span>
        </div>
        <p className="text-sm">
          <span className="font-semibold">{userData.first_name} {userData.surname}</span>
          {userData.father_name && (
            <span className="opacity-90"> (s/o {userData.father_name})</span>
          )}
        </p>
      </div>
      
      {/* SECTION 1: AI SUGGESTIONS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <h2 className="font-semibold text-gray-900">AI Suggestions</h2>
          {aiMatches.length > 0 && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {aiMatches.length} found
            </span>
          )}
        </div>
        
        {aiLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : aiMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500">
              AI couldn't find any matching families for your profile.
              <br />
              <span className="text-xs">Try searching manually below.</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiMatches.map(family => (
              <FamilyMatchCard
                key={family.family_uuid}
                family={family}
                onSelect={() => setSelectedFamily(family)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* SECTION 2: MANUAL SEARCH */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Search size={14} />
          </div>
          <h2 className="font-semibold text-gray-900">Search Manually</h2>
          <span className="text-xs text-gray-500">
            (Can't find your family above?)
          </span>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by family head name, phone, or surname..."
              value={manualSearch}
              onChange={(e) => {
                setManualSearch(e.target.value);
                setShowAllFamilies(true);
              }}
              onFocus={() => setShowAllFamilies(true)}
              className="pl-10"
            />
          </div>
          
          {!showAllFamilies && !manualSearch && (
            <button
              onClick={() => setShowAllFamilies(true)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <span className="text-gray-700">
                Or browse all families in your community
              </span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          )}
          
          {/* Family List */}
          {showAllFamilies && (
            <div className="max-h-96 overflow-y-auto space-y-2 mt-2">
              {allLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))
              ) : additionalFamilies.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  {manualSearch 
                    ? `No families found matching "${manualSearch}"`
                    : 'No additional families to show'}
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wide px-1">
                    {manualSearch 
                      ? `${additionalFamilies.length} results` 
                      : `${additionalFamilies.length} families available`}
                  </p>
                  {additionalFamilies.slice(0, 20).map((family: any) => {
                    const firstName = family.first_name || family.head_first_name || '';
                    const surname = family.surname || family.head_surname || '';
                    const fatherName = family.father_name || family.head_father_name || '';
                    const phone = family.phone_number || family.head_phone || '';
                    const initials = `${firstName[0] || ''}${surname[0] || ''}`;
                    
                    return (
                      <div 
                        key={family.family_uuid || family.member_uuid}
                        onClick={() => handleSelectFamily(family)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 hover:border-[#A32328]/30 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-semibold">
                          {initials || <Home size={16} />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {firstName} {surname}'s Family
                          </p>
                          <p className="text-xs text-gray-500">
                            {fatherName && `s/o ${fatherName} • `}
                            {phone}
                          </p>
                        </div>
                        
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    );
                  })}
                  {additionalFamilies.length > 20 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Showing 20 of {additionalFamilies.length}. Refine your search.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* SECTION 3: START NEW FAMILY */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <Plus size={14} />
          </div>
          <h2 className="font-semibold text-gray-900">Start New Family</h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-700 mb-3">
            Don't have any family members in this community yet? 
            Start fresh - you can add family members later or accept 
            join requests from your relatives.
          </p>
          
          <Button 
            onClick={() => {
              toast.success('Welcome! You can add family members from the Family Tree.');
              navigate({ to: '/dashboard' });
            }}
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50"
          >
            <Plus size={16} className="mr-2" />
            Continue as New Family
          </Button>
        </div>
      </div>
      
      {/* Join Request Dialog */}
      {selectedFamily && (
        <JoinRequestDialog
          family={selectedFamily}
          open={!!selectedFamily}
          onClose={() => setSelectedFamily(null)}
          onSuccess={() => {
            setSelectedFamily(null);
            queryClient.invalidateQueries({ queryKey: ['family-matches'] });
            queryClient.invalidateQueries({ queryKey: ['all-families'] });
            toast.success('Join request sent! You will be notified when reviewed.');
            navigate({ to: '/my-requests' });
          }}
        />
      )}
    </div>
  );
}
