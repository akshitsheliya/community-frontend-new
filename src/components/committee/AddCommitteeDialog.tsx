import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { committeeApi, COMMITTEE_ROLES } from '@/lib/committee-api';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Search, User, Check, ArrowLeft } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCommitteeDialog({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'search' | 'role'>('search');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  
  const { data: allMembers = [], isLoading } = useQuery({
    queryKey: ['all-members-for-committee'],
    queryFn: async () => {
      const { data } = await api.get('/api/members');
      return data.data || [];
    },
    enabled: open
  });
  
  // Exclude already-committee members
  const availableMembers = (allMembers as any[]).filter(
    (m: any) => m.is_committee_member !== 1
  );
  
  const filtered = search.trim()
    ? availableMembers.filter((m: any) => {
        const name = `${m.first_name} ${m.surname}`.toLowerCase();
        return name.includes(search.toLowerCase()) || 
               m.phone_number?.includes(search);
      })
    : availableMembers;
  
  const mutation = useMutation({
    mutationFn: () => committeeApi.addToCommittee(
      selectedMember.member_uuid,
      selectedRole
    ),
    onSuccess: () => {
      toast.success(`${selectedMember.first_name} added to committee as ${selectedRole}!`);
      handleClose();
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add to committee');
    }
  });
  
  const handleClose = () => {
    setStep('search');
    setSearch('');
    setSelectedMember(null);
    setSelectedRole('');
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900 border-gray-200 shadow-2xl">
        <DialogHeader className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {step === 'role' && (
              <button 
                onClick={() => setStep('search')}
                className="p-1 hover:bg-gray-100 rounded-lg mr-1"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
            )}
            <DialogTitle>
              {step === 'search' ? 'Select Member' : 'Assign Role'}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        {/* Step 1: Search Member */}
        {step === 'search' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {availableMembers.length} members available to add
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm">
                    {search ? 'No matching members found' : 'No members available to add'}
                  </p>
                </div>
              ) : (
                filtered.slice(0, 30).map((m: any) => {
                  const initials = `${m.first_name?.[0] || ''}${m.surname?.[0] || ''}`;
                  return (
                    <button
                      key={m.member_id}
                      onClick={() => {
                        setSelectedMember(m);
                        setStep('role');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-xl text-left transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-semibold flex-shrink-0">
                        {m.profile_photo ? (
                          <img src={m.profile_photo} alt={m.first_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          initials || <User size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {m.first_name} {m.surname}
                        </p>
                        <p className="text-xs text-gray-500">{m.phone_number}</p>
                      </div>
                      <ArrowLeft size={14} className="text-gray-400 rotate-180 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {/* Step 2: Select Role */}
        {step === 'role' && selectedMember && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Selected member preview */}
            <div className="p-4 bg-gradient-to-r from-[#A32328]/5 to-[#8B1E22]/5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#A32328] text-white flex items-center justify-center font-semibold text-lg">
                  {selectedMember.first_name?.[0]}{selectedMember.surname?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedMember.first_name} {selectedMember.surname}
                  </p>
                  <p className="text-xs text-gray-600">{selectedMember.phone_number}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select role for this member:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COMMITTEE_ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`
                      p-3 rounded-xl border-2 transition text-left relative
                      ${selectedRole === role.value 
                        ? 'border-[#A32328] bg-[#A3232810]' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <p className="text-xs font-medium text-gray-900 leading-tight">{role.label}</p>
                    {selectedRole === role.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#A32328] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setStep('search')}
                className="flex-1"
                disabled={mutation.isPending}
              >
                Back
              </Button>
              <Button 
                onClick={() => mutation.mutate()}
                disabled={!selectedRole || mutation.isPending}
                className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white"
              >
                {mutation.isPending ? 'Adding...' : 'Add to Committee'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
