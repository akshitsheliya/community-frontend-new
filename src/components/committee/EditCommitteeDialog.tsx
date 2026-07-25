import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { committeeApi, COMMITTEE_ROLES, type CommitteeMember } from '@/lib/committee-api';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface Props {
  member: CommitteeMember;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCommitteeDialog({ member, open, onClose, onSuccess }: Props) {
  const [selectedRole, setSelectedRole] = useState(member.designation || '');
  
  const mutation = useMutation({
    mutationFn: () => committeeApi.updateRole(member.member_uuid, selectedRole),
    onSuccess: () => {
      toast.success('Role updated successfully!');
      onSuccess();
    },
    onError: () => toast.error('Failed to update role')
  });
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900 border-gray-200 shadow-2xl">
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle>Change Role</DialogTitle>
        </DialogHeader>

        {/* Member info */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#A32328] text-white flex items-center justify-center font-semibold text-lg">
              {member.first_name?.[0]}{member.surname?.[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {member.first_name} {member.surname}
              </p>
              <p className="text-xs text-gray-500">
                Current role: <span className="font-medium text-[#A32328]">{member.designation}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-3">Select new role:</p>
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
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={() => mutation.mutate()}
            disabled={!selectedRole || selectedRole === member.designation || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white"
          >
            {mutation.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
