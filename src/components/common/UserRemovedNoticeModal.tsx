import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertOctagon, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

interface UserRemovedNoticeModalProps {
  open: boolean;
  reason: string;
}

export function UserRemovedNoticeModal({
  open,
  reason,
}: UserRemovedNoticeModalProps) {
  const handleAcknowledgeAndLogout = () => {
    logout();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md bg-white p-6 rounded-3xl border border-red-200 text-gray-900 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200 shadow-sm">
            <AlertOctagon size={34} />
          </div>
          <DialogTitle className="text-xl font-bold text-red-600">
            Account Removed from Community
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            You have been removed from this community by Global Admin Rajesh Patel.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 my-2 text-left space-y-1.5">
          <span className="text-xs font-bold text-red-950 uppercase tracking-wider block">
            Notice from Admin:
          </span>
          <p className="text-sm font-medium text-red-900 leading-relaxed italic">
            "{reason || 'Your account was removed by the administrator.'}"
          </p>
        </div>

        <DialogFooter className="mt-4 sm:justify-center">
          <Button
            onClick={handleAcknowledgeAndLogout}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-xl shadow-md"
          >
            <LogOut className="h-5 w-5 mr-2" />
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
