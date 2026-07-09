import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { committeeApi, getRolePriority, getRoleIcon, type CommitteeMember } from '@/lib/committee-api';
import { Button } from '@/components/ui/button';
import { 
  UserCog, 
  Plus,
  Phone,
  Mail,
  User,
  MoreVertical,
  Edit,
  Trash2,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { AddCommitteeDialog } from '@/components/committee/AddCommitteeDialog';
import { EditCommitteeDialog } from '@/components/committee/EditCommitteeDialog';
import { getParentPrefix } from '@/lib/text-helpers';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/committee/')({
  component: CommitteePage,
});

function CommitteePage() {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMember, setEditMember] = useState<CommitteeMember | null>(null);
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: members = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['committee-members'],
    queryFn: committeeApi.getAll
  });
  
  // Sort by role priority
  const sortedMembers = [...members].sort((a, b) => 
    getRolePriority(a.designation) - getRolePriority(b.designation)
  );
  
  const removeMutation = useMutation({
    mutationFn: (uuid: string) => committeeApi.remove(uuid),
    onSuccess: () => {
      toast.success('Member removed from committee');
      queryClient.invalidateQueries({ queryKey: ['committee-members'] });
    },
    onError: () => toast.error('Failed to remove member')
  });
  
  const handleRemove = (member: CommitteeMember) => {
    if (!window.confirm(`Remove ${member.first_name} ${member.surname} from committee?`)) return;
    removeMutation.mutate(member.member_uuid);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Committee Members</h1>
            <p className="text-xs text-gray-500">
              {members.length} {members.length === 1 ? 'member' : 'members'}
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
            Add Member
          </Button>
        )}
      </div>
      
      {/* Community Leadership Banner */}
      <div className="bg-gradient-to-r from-[#A32328] to-[#8B1E22] rounded-2xl p-5 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Crown size={24} className="text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Community Leadership</h3>
            <p className="text-sm text-white/80 mt-0.5">
              Elected members serving our community
            </p>
          </div>
        </div>
      </div>
      
      {/* Members List */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-10 bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-28" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <UserCog className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Committee Members
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isAdmin 
              ? 'Add members to form the committee structure'
              : 'Committee structure will appear here once set up'}
          </p>
          {isAdmin && (
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
            >
              <Plus size={16} className="mr-2" />
              Add First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <CommitteeMemberCard
              key={member.member_uuid}
              member={member}
              isAdmin={isAdmin}
              onEdit={() => setEditMember(member)}
              onRemove={() => handleRemove(member)}
            />
          ))}
        </div>
      )}
      
      {/* Dialogs */}
      <AddCommitteeDialog 
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => {
          setShowAddDialog(false);
          queryClient.invalidateQueries({ queryKey: ['committee-members'] });
        }}
      />
      
      {editMember && (
        <EditCommitteeDialog 
          member={editMember}
          open={!!editMember}
          onClose={() => setEditMember(null)}
          onSuccess={() => {
            setEditMember(null);
            queryClient.invalidateQueries({ queryKey: ['committee-members'] });
          }}
        />
      )}
    </div>
  );
}

// ─── Committee Member Card ──────────────────────────────────────────────────

function CommitteeMemberCard({ 
  member, 
  isAdmin, 
  onEdit, 
  onRemove 
}: {
  member: CommitteeMember;
  isAdmin: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const initials = `${member.first_name?.[0] || ''}${member.surname?.[0] || ''}`;
  const roleIcon = getRoleIcon(member.designation);
  const priority = getRolePriority(member.designation);
  const isTopRole = priority <= 2;   // President & VP get special styling
  const isKeyRole = priority <= 5;   // Top 5 roles get subtle highlight
  
  return (
    <div className={`
      bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md
      ${isTopRole 
        ? 'border-[#A32328]/25 shadow-sm' 
        : isKeyRole 
          ? 'border-gray-200' 
          : 'border-gray-100'
      }
    `}>
      {/* Role Badge Header */}
      <div className={`
        px-4 py-2.5 flex items-center justify-between
        ${isTopRole 
          ? 'bg-gradient-to-r from-[#A32328] to-[#8B1E22]' 
          : isKeyRole 
            ? 'bg-gray-50 border-b border-gray-100' 
            : 'bg-gray-50 border-b border-gray-100'
        }
      `}>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{roleIcon}</span>
          <span className={`text-sm font-bold tracking-wide ${isTopRole ? 'text-white' : 'text-gray-700'}`}>
            {member.designation || 'Committee Member'}
          </span>
          {isTopRole && (
            <span className="ml-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              Leadership
            </span>
          )}
        </div>
        
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1.5 rounded-lg transition ${
                isTopRole ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <MoreVertical size={15} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 min-w-[150px]">
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition"
                  >
                    <Edit size={14} className="text-gray-400" />
                    Change Role
                  </button>
                  <button
                    onClick={() => { onRemove(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Member Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden
            ${isTopRole ? 'bg-[#A32328] text-white' : 'bg-[#A3232815] text-[#A32328]'}
          `}>
            {member.profile_photo ? (
              <img 
                src={member.profile_photo}
                alt={member.first_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                }}
              />
            ) : (
              initials || <User size={20} />
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {member.first_name} {member.surname}
            </h3>
            {member.father_name && (
              <p className="text-xs text-gray-400 mt-0.5">
                {getParentPrefix(member.gender)} {member.father_name}
              </p>
            )}
            
            {/* Contact info */}
            <div className="flex flex-wrap gap-3 mt-2.5">
              {member.phone_number && (
                <a 
                  href={`tel:${member.phone_number}`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#A32328] transition group"
                >
                  <div className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-[#A3232815] flex items-center justify-center transition">
                    <Phone size={11} />
                  </div>
                  {member.phone_number}
                </a>
              )}
              {member.email_id && (
                <a 
                  href={`mailto:${member.email_id}`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#A32328] transition group"
                >
                  <div className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-[#A3232815] flex items-center justify-center transition">
                    <Mail size={11} />
                  </div>
                  {member.email_id}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
