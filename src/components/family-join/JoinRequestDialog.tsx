import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { joinRequestApi, type FamilyMatch } from '@/lib/family-join-api';
import { toast } from 'sonner';
import { User, Check, Send } from 'lucide-react';

const RELATIONSHIPS = [
  { value: 'father', label: 'Father', icon: '👨' },
  { value: 'mother', label: 'Mother', icon: '👩' },
  { value: 'son', label: 'Son', icon: '👦' },
  { value: 'daughter', label: 'Daughter', icon: '👧' },
  { value: 'husband', label: 'Husband', icon: '🤵' },
  { value: 'wife', label: 'Wife', icon: '👰' },
  { value: 'brother', label: 'Brother', icon: '👨👦' },
  { value: 'sister', label: 'Sister', icon: '👩👧' },
  { value: 'grandfather', label: 'Grandfather', icon: '👴' },
  { value: 'grandmother', label: 'Grandmother', icon: '👵' },
  { value: 'uncle', label: 'Uncle', icon: '🧔' },
  { value: 'aunt', label: 'Aunt', icon: '🧑🦱' },
  { value: 'nephew', label: 'Nephew', icon: '👦' },
  { value: 'niece', label: 'Niece', icon: '👧' },
];

interface Props {
  family: FamilyMatch;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinRequestDialog({ family, open, onClose, onSuccess }: Props) {
  const [relationship, setRelationship] = useState('');
  
  const mutation = useMutation({
    mutationFn: () => joinRequestApi.createRequest({
      target_family_uuid: family.family_uuid,
      target_member_uuid: family.head_member_uuid,
      claimed_relationship: relationship
    }),
    onSuccess: () => {
      toast.success('Join request sent! Family head will review it.');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  });
  
  const handleClose = () => {
    setRelationship('');
    onClose();
  };
  
  const headInitials = `${family.head_first_name?.[0] || ''}${family.head_surname?.[0] || ''}`;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900">
        <DialogHeader className="p-4 border-b border-gray-100 bg-white">
          <DialogTitle>Request to Join Family</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#A32328] text-white flex items-center justify-center font-semibold">
              {headInitials || <User size={20} />}
            </div>
            <div>
              <p className="font-semibold">
                {family.head_first_name} {family.head_surname}'s Family
              </p>
              <p className="text-xs text-gray-600">
                {family.number_of_family_members} members
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto bg-white">
          <p className="text-sm text-gray-700 mb-3">
            How are you related to <span className="font-semibold">{family.head_first_name}</span>?
          </p>
          
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRelationship(r.value)}
                className={`
                  p-3 rounded-xl border-2 transition text-left
                  ${relationship === r.value 
                    ? 'border-[#A32328] bg-[#A3232815]' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
          
          {relationship && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">You are saying:</span> "{family.head_first_name} is my {relationship}"
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
          <Button 
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => mutation.mutate()}
            disabled={!relationship || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22]"
          >
            <Send size={14} className="mr-2" />
            {mutation.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
