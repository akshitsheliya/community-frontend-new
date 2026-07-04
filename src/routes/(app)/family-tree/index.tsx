import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { familyGraphApi } from '@/lib/family-graph-api';
import { groupRelationships } from '@/lib/relationship-grouper';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  TreePine, 
  RefreshCw,
  UserPlus,
  Users,
  Heart,
  Baby,
  UsersRound,
  Home
} from 'lucide-react';
import { FamilyMemberCard } from '@/components/family-tree/FamilyMemberCard';
import { FamilyGroupSection } from '@/components/family-tree/FamilyGroupSection';
import { AddRelationshipDialog } from '@/components/family-tree/AddRelationshipDialog';

export const Route = createFileRoute('/(app)/family-tree/')({
  component: FamilyTreePage,
});

function FamilyTreePage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Get logged in user with better fallback
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const memberUuid = userData.member_uuid;
  const memberId = Number(userData.member_id);  // Ensure it's a number
  const userName = `${userData.first_name || 'You'} ${userData.surname || ''}`.trim();
  
  // Fetch family tree
  const { data: tree, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['family-tree', memberUuid],
    queryFn: () => familyGraphApi.getFamilyTree(memberUuid, 3),
    enabled: !!memberUuid
  });
  
  // Group relationships with proper number conversion
  const groups = useMemo(() => {
    if (!tree || !tree.nodes || !tree.edges) return null;
    
    // Ensure memberId matches the type used in nodes
    // Try to find current member in nodes to get correct ID
    const myNode = tree.nodes.find(
      (n: any) => n.member_uuid === memberUuid
    );
    
    const actualCurrentId = myNode?.id || memberId;
    
    return groupRelationships(actualCurrentId, tree.edges, tree.nodes);
  }, [tree, memberId, memberUuid]);
  
  // Calculate total
  const totalRelationships = useMemo(() => {
    if (!groups) return 0;
    return Object.values(groups).reduce(
      (sum: number, arr: any) => sum + (arr?.length || 0), 
      0
    );
  }, [groups]);
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#A32328] text-white flex items-center justify-center">
            <TreePine size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Family Tree</h1>
            <p className="text-xs text-gray-500">
              {totalRelationships} {totalRelationships === 1 ? 'relationship' : 'relationships'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
            size="sm"
          >
            <UserPlus size={16} className="mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      )}
      
      {/* Content */}
      {!isLoading && groups && (
        <>
          {/* You (Center Member) */}
          <div>
            <FamilyMemberCard 
              name={userName}
              photo={userData.profile_photo}
              isCenter
            />
          </div>
          
          {/* Empty state if no relationships */}
          {totalRelationships === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center mx-auto mb-4">
                <TreePine size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Start Building Your Family Tree
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your parents, siblings, spouse, and children to build your family network.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-[#A32328] hover:bg-[#8B1E22]"
              >
                <UserPlus size={16} className="mr-2" />
                Add Your First Relationship
              </Button>
            </div>
          )}
          
          {/* Family Groups */}
          {totalRelationships > 0 && (
            <div className="space-y-3">
              {/* Grandparents */}
              {groups.grandparents && groups.grandparents.length > 0 && (
                <FamilyGroupSection
                  title="Grandparents"
                  icon={<Users size={16} />}
                  members={groups.grandparents}
                />
              )}
              
              {/* Parents */}
              <FamilyGroupSection
                title="Parents"
                icon={<Home size={16} />}
                members={groups.parents}
                emptyText="No parents added"
                onAdd={() => setShowAddDialog(true)}
              />
              
              {/* Spouse */}
              <FamilyGroupSection
                title="Spouse"
                icon={<Heart size={16} />}
                members={groups.spouse}
                emptyText="No spouse added"
                onAdd={() => setShowAddDialog(true)}
              />
              
              {/* Children */}
              <FamilyGroupSection
                title="Children"
                icon={<Baby size={16} />}
                members={groups.children}
                emptyText="No children added"
                onAdd={() => setShowAddDialog(true)}
              />
              
              {/* Grandchildren */}
              {groups.grandchildren && groups.grandchildren.length > 0 && (
                <FamilyGroupSection
                  title="Grandchildren"
                  icon={<Baby size={16} />}
                  members={groups.grandchildren}
                />
              )}
              
              {/* Siblings */}
              <FamilyGroupSection
                title="Siblings"
                icon={<Users size={16} />}
                members={groups.siblings}
                emptyText="No siblings added"
                onAdd={() => setShowAddDialog(true)}
              />
              
              {/* Nephews & Nieces */}
              {groups.nephewsNieces && groups.nephewsNieces.length > 0 && (
                <FamilyGroupSection
                  title="Nephews & Nieces"
                  icon={<Baby size={16} />}
                  members={groups.nephewsNieces}
                />
              )}
              
              {/* In-Laws */}
              {groups.inLaws && groups.inLaws.length > 0 && (
                <FamilyGroupSection
                  title="In-Laws"
                  icon={<Heart size={16} />}
                  members={groups.inLaws}
                />
              )}
              
              {/* Extended Family */}
              {groups.extended && groups.extended.length > 0 && (
                <FamilyGroupSection
                  title="Extended Family"
                  icon={<UsersRound size={16} />}
                  members={groups.extended}
                />
              )}
              
              {/* Other Relations */}
              {groups.other && groups.other.length > 0 && (
                <FamilyGroupSection
                  title="Other Relations"
                  icon={<Users size={16} />}
                  members={groups.other}
                />
              )}
            </div>
          )}
        </>
      )}
      
      {/* Add Dialog */}
      <AddRelationshipDialog 
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
