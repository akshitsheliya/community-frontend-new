import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/user-api';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  
  const mutation = useMutation({
    mutationFn: () => userApi.requestDeleteAccount(reason),
    onSuccess: () => {
      toast.success('Account deletion request submitted');
      localStorage.clear();
      sessionStorage.clear();
      navigate({ to: '/login' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  });
  
  const handleClose = () => {
    setReason('');
    setConfirmed(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle size={24} />
          </div>
          <DialogTitle className="text-center">Delete Account?</DialogTitle>
          <DialogDescription className="text-center">
            This action will submit a request to permanently delete your account. 
            All your data will be removed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Please tell us why you're leaving:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your feedback helps us improve..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>
          
          <label className="flex items-start gap-2 cursor-pointer">
            <input 
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I understand that this action is irreversible and my data cannot be recovered.
            </span>
          </label>
        </div>
        
        <div className="flex gap-2">
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
            disabled={!confirmed || !reason.trim() || mutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {mutation.isPending ? 'Submitting...' : 'Delete Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
