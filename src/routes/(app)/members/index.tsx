import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '@/lib/members-api';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberSearchBar } from '@/components/members/MemberSearchBar';
import { MemberFilterChips } from '@/components/members/MemberFilterChips';
import type { FilterType } from '@/components/members/MemberFilterChips';
import { MemberDetailDrawer } from '@/components/members/MemberDetailDrawer';
import { MembersListSkeleton } from '@/components/members/MembersListSkeleton';
import { EmptyMembersState } from '@/components/members/EmptyMembersState';
import type { Member } from '@/types/api';
import { UserPlus } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/members/')({
  component: MembersListPage,
});

function MembersListPage() {
  // Try to get user from localStorage if useAuth isn't implemented yet
  const userString = localStorage.getItem('userData');
  const user = userString ? JSON.parse(userString) : null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Fetch all members
  const { data: members, isLoading, isError, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAllMembers,
  });

  // Filter and Search Logic
  const filteredMembers = useMemo(() => {
    if (!members) return [];

    let result = members;

    // Apply Filter Chips
    if (activeFilter === 'Family Heads') {
      result = result.filter(m => m.is_family_representative === true || m.is_family_representative === 1);
    } else if (activeFilter === 'Committee') {
      result = result.filter(m => m.is_committee_member === true || m.is_committee_member === 1);
    } else if (activeFilter === 'My Family') {
      const resolvedFamilySrId = user?.family_sr_id || 
        members.find(m => m.member_uuid === user?.member_uuid || m.phone_number === user?.phone_number)?.family_sr_id;
        
      if (resolvedFamilySrId) {
        result = result.filter(m => m.family_sr_id === resolvedFamilySrId);
      } else {
        result = []; // If we can't determine the user's family, show empty
      }
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.first_name?.toLowerCase().includes(q) ||
        m.surname?.toLowerCase().includes(q) ||
        m.phone_number?.includes(q)
      );
    }

    // Sort alphabetically by first name
    return result.sort((a, b) => (a.first_name || '').localeCompare(b.first_name || ''));
  }, [members, activeFilter, searchQuery, user?.family_uuid]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          
          {/* Add Member Button (Admin only) */}
          {(user?.is_community_admin === 1 || user?.is_community_admin === true) && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A32328] hover:bg-[#8B1D22] text-white rounded-lg text-sm font-medium transition-colors">
              <UserPlus size={16} />
              Add
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <MemberSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Filters */}
        <MemberFilterChips 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      <div className="p-4">
        {/* Count/Status */}
        {!isLoading && !isError && (
          <p className="text-sm text-gray-500 mb-4 font-medium">
            Showing {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </p>
        )}

        {/* List Content */}
        {isLoading ? (
          <MembersListSkeleton />
        ) : isError ? (
          <div className="py-8">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyMembersState 
            searchQuery={searchQuery} 
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <div className="space-y-3">
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.member_uuid} 
                member={member} 
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <MemberDetailDrawer 
        member={selectedMember} 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
