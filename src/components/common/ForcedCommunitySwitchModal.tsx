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
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { globalAdminApi } from '@/lib/global-admin-api';
import { toast } from 'sonner';

interface ForcedCommunitySwitchModalProps {
  open: boolean;
  eventId?: string;
  targetCommunityName: string;
  targetCommunityUuid: string;
}

export function ForcedCommunitySwitchModal({
  open,
  eventId,
  targetCommunityName,
  targetCommunityUuid,
}: ForcedCommunitySwitchModalProps) {
  const [isSwitching, setIsSwitching] = React.useState(false);

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      const res = await globalAdminApi.acknowledgeSwitch({
        event_id: eventId,
        target_community_uuid: targetCommunityUuid,
      });

      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.community) {
          localStorage.setItem(
            'communityData',
            JSON.stringify({
              community_uuid: res.data.community.community_uuid,
              community_name: res.data.community.community_name,
              community_number: res.data.community.community_number,
            })
          );
        }
        toast.success(`Switched to ${targetCommunityName}!`);
        window.location.href = '/dashboard';
      } else {
        toast.error('Failed to switch community automatically');
      }
    } catch (e: any) {
      toast.error('Error switching community');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md bg-white p-6 rounded-3xl border border-amber-200 text-gray-900 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-sm">
            <ArrowRightLeft size={32} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Community Transferred by Admin
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
            Your profile has been moved to <strong className="text-amber-800 font-semibold">{targetCommunityName}</strong> by Global Admin <strong>Rajesh Patel</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 my-2 space-y-1">
          <span className="font-semibold block text-amber-950">Action Required</span>
          You must switch to your new community to continue using the application.
        </div>

        <DialogFooter className="mt-4 sm:justify-center">
          <Button
            onClick={handleSwitch}
            disabled={isSwitching}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base rounded-xl shadow-md"
          >
            {isSwitching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ArrowRightLeft className="h-5 w-5 mr-2" />}
            Switch Community Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
