import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { familyGraphApi } from '@/lib/family-graph-api';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Search, User, Check, X } from 'lucide-react';

const RELATIONSHIPS = [
  // Parents
  { value: 'father', label: 'Father', icon: '👨' },
  { value: 'mother', label: 'Mother', icon: '👩' },
  
  // Grandparents
  { value: 'grandfather', label: 'Grandfather', icon: '👴' },
  { value: 'grandmother', label: 'Grandmother', icon: '👵' },
  
  // Spouse
  { value: 'husband', label: 'Husband', icon: '🤵' },
  { value: 'wife', label: 'Wife', icon: '👰' },
  
  // Children
  { value: 'son', label: 'Son', icon: '👦' },
  { value: 'daughter', label: 'Daughter', icon: '👧' },
  { value: 'grandson', label: 'Grandson', icon: '🧒' },
  { value: 'granddaughter', label: 'Granddaughter', icon: '👧' },
  
  // Siblings
  { value: 'brother', label: 'Brother', icon: '👨👦' },
  { value: 'sister', label: 'Sister', icon: '👩👧' },
  
  // Uncle/Aunt
  { value: 'uncle', label: 'Uncle', icon: '🧔' },
  { value: 'aunt', label: 'Aunt', icon: '🧑🦱' },
  
  // Nephew/Niece
  { value: 'nephew', label: 'Nephew', icon: '👦' },
  { value: 'niece', label: 'Niece', icon: '👧' },
  
  // Cousins
  { value: 'cousin_paternal', label: 'Cousin (Paternal)', icon: '👨👨👦' },
  { value: 'cousin_maternal', label: 'Cousin (Maternal)', icon: '👩👩👧' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddRelationshipDialog({ open, onClose }: Props) {
  const [step, setStep] = useState<'search' | 'relation'>('search');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [relationship, setRelationship] = useState('');
  const queryClient = useQueryClient();
  
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/api/members');
      return res.data.data || [];
    }
  });
  
  // Get current user id to filter out from list
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const currentMemberId = userData.member_id;
  
  const filtered = members
    .filter((m: any) => m.member_id !== currentMemberId)  // exclude self
    .filter((m: any) => {
      if (!search) return true;
      const name = `${m.first_name} ${m.surname}`.toLowerCase();
      return name.includes(search.toLowerCase()) || m.phone_number?.includes(search);
    });
  
  const mutation = useMutation({
    mutationFn: () => familyGraphApi.addRelationship(
      selectedMember.member_uuid, 
      relationship,
      currentMemberId
    ),
    onSuccess: () => {
      toast.success(`Added ${selectedMember.first_name} as your ${relationship}!`);
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
      queryClient.invalidateQueries({ queryKey: ['my-relationships'] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add relationship');
    }
  });
  
  const handleClose = () => {
    setStep('search');
    setSearch('');
    setSelectedMember(null);
    setRelationship('');
    onClose();
  };
  
  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setStep('relation');
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col w-full sm:max-w-md h-full sm:h-auto sm:rounded-lg rounded-none m-0 bg-white text-gray-900 border-gray-200 shadow-xl">
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle className="text-lg">
            {step === 'search' ? 'Select Family Member' : 'Choose Relationship'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === 'search' 
              ? 'Search and select the member you want to add' 
              : `How is ${selectedMember?.first_name} related to you?`
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Step 1: Search Member */}
        {step === 'search' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No members found</p>
                </div>
              ) : (
                filtered.slice(0, 20).map((m: any) => {
                  const initials = `${m.first_name?.[0] || ''}${m.surname?.[0] || ''}`;
                  return (
                    <div 
                      key={m.member_id}
                      onClick={() => handleSelectMember(m)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {m.first_name} {m.surname}
                        </p>
                        <p className="text-xs text-gray-500">{m.phone_number}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {/* Step 2: Choose Relationship */}
        {step === 'relation' && selectedMember && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#A32328] text-white flex items-center justify-center font-semibold">
                  {selectedMember.first_name?.[0]}{selectedMember.surname?.[0]}
                </div>
                <div>
                  <p className="font-semibold">
                    {selectedMember.first_name} {selectedMember.surname}
                  </p>
                  <p className="text-xs text-gray-600">{selectedMember.phone_number}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-3">
                Select what this person is to you:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRelationship(r.value)}
                    className={`
                      p-3 rounded-xl border-2 transition text-left
                      ${relationship === r.value 
                        ? 'border-[#A32328] bg-[#A3232815]' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <p className="text-sm font-medium text-gray-900">
                      {r.label}
                    </p>
                    {relationship === r.value && (
                      <Check size={14} className="text-[#A32328] mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex gap-2 mt-auto">
              <Button 
                variant="outline"
                onClick={() => setStep('search')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => mutation.mutate()}
                disabled={!relationship || mutation.isPending}
                className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white"
              >
                {mutation.isPending ? 'Adding...' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
