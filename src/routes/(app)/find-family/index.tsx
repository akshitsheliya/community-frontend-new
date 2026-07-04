import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRequestApi, type FamilyMatch } from '@/lib/family-join-api';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  Sparkles, 
  ArrowLeft,
  Home,
  User,
  Phone,
  MapPin
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
  const [selectedFamily, setSelectedFamily] = useState<FamilyMatch | null>(null);
  const queryClient = useQueryClient();
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  // Fetch matching families
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['family-matches'],
    queryFn: joinRequestApi.searchFamilies
  });
  
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
      
      {isFirstTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Welcome to the community! 👋</h3>
              <p className="text-sm text-blue-700 mt-1">
                We found some families that might be yours. If you don't see 
                your family here, you can create a new one.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Info Banner */}
      <div className="bg-gradient-to-r from-[#A32328] to-[#8B1E22] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} />
          <span className="text-sm font-medium">Smart Search</span>
        </div>
        <p className="text-sm opacity-90">
          Based on your profile: <span className="font-semibold">{userData.first_name} {userData.surname}</span>
          {userData.father_name && (
            <span> (s/o {userData.father_name})</span>
          )}
        </p>
        <p className="text-xs opacity-75 mt-1">
          We're looking for families that might be yours
        </p>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Matching Families Found
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            We couldn't find any families in this community that match your profile. 
            You can continue as a new family, or manually search for someone.
          </p>
          <Button 
            onClick={() => navigate({ to: '/dashboard' })}
            className="bg-[#A32328] hover:bg-[#8B1E22]"
          >
            Continue as New Family
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{matches.length}</span> potential {matches.length === 1 ? 'family' : 'families'}
            </p>
          </div>
          
          <div className="space-y-3">
            {matches.map((family) => (
              <FamilyMatchCard
                key={family.family_sr_id}
                family={family}
                onSelect={() => setSelectedFamily(family)}
              />
            ))}
          </div>
          
          {/* None of these */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 text-center">
            <Button 
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex-1"
            >
              Skip for Now (Continue as New Family)
            </Button>
          </div>
        </>
      )}
      
      {/* Request Dialog */}
      {selectedFamily && (
        <JoinRequestDialog
          family={selectedFamily}
          open={!!selectedFamily}
          onClose={() => setSelectedFamily(null)}
          onSuccess={() => {
            setSelectedFamily(null);
            queryClient.invalidateQueries({ queryKey: ['family-matches'] });
            navigate({ to: '/my-requests' });
          }}
        />
      )}
    </div>
  );
}
