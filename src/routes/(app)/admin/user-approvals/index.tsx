import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userVerificationApi, type UnverifiedUser } from '@/lib/user-verification-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading-page';
import { getParentPrefix } from '@/lib/text-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export const Route = createFileRoute('/(app)/admin/user-approvals/')({
  beforeLoad: () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const isCommittee = userData.is_committee_member === 1 || userData.is_community_admin === 1;
    if (!isCommittee) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: UserApprovalsAdminPage,
});

function UserApprovalsAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectingUser, setRejectingUser] = useState<UnverifiedUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending unverified users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['unverified-users'],
    queryFn: userVerificationApi.getUnverified,
    refetchInterval: 30000
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (uuid: string) => userVerificationApi.approve(uuid),
    onSuccess: () => {
      toast.success('User approved successfully! The user can now log in.');
      queryClient.invalidateQueries({ queryKey: ['unverified-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) =>
      userVerificationApi.reject(uuid, reason),
    onSuccess: () => {
      toast.success('User registration rejected.');
      setRejectingUser(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['unverified-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject user');
    }
  });

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    if (rejectingUser) {
      rejectMutation.mutate({ uuid: rejectingUser.member_uuid, reason: rejectReason });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#A32328] text-white flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New User Approvals</h1>
            <p className="text-xs text-gray-500">
              Committee Member Verification Portal
            </p>
          </div>
        </div>
        
        {users.length > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
            {users.length} Pending
          </span>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={18} />
        </div>
        <div className="text-xs text-blue-800 leading-relaxed">
          <p className="font-semibold text-blue-900 text-sm mb-0.5">
            Committee Verification Workflow
          </p>
          Newly registered community members are placed on hold until a Committee Member reviews their details. 
          <span className="font-medium text-blue-900"> Approving</span> grants login access instantly. 
          <span className="font-medium text-blue-900"> Rejecting</span> restricts login access.
        </div>
      </div>

      {/* List Content */}
      {isLoading ? (
        <LoadingPage message="Loading unverified user requests..." />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            All Caught Up!
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            There are currently no new user joining requests pending approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const initials = `${user.first_name?.[0] || ''}${user.surname?.[0] || ''}`;
            return (
              <div 
                key={user.member_uuid}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* User Header */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden border border-[#A32328]/20">
                        {user.profile_photo ? (
                          <img 
                            src={user.profile_photo} 
                            alt={user.first_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials || <User size={22} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-base truncate">
                            {user.first_name} {user.surname}
                          </h3>
                          <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                            Pending
                          </span>
                        </div>

                        {user.father_name && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {getParentPrefix(user.gender)} {user.father_name}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Phone size={12} className="text-[#A32328]" />
                            {user.phone_number}
                          </span>

                          {(user.current_resident || user.address) && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-gray-400" />
                              {user.current_resident || user.address}
                            </span>
                          )}

                          {user.business_or_job_or_any && (
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} className="text-gray-400" />
                              {user.business_or_job_or_any}
                            </span>
                          )}

                          {user.education && (
                            <span className="flex items-center gap-1">
                              <GraduationCap size={12} className="text-gray-400" />
                              {user.education}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectingUser(user);
                        setRejectReason('');
                      }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4"
                    >
                      <XCircle size={16} className="mr-1.5" />
                      Reject Registration
                    </Button>

                    <Button
                      onClick={() => approveMutation.mutate(user.member_uuid)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-5"
                    >
                      <CheckCircle2 size={16} className="mr-1.5" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve & Grant Login'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <Dialog open={!!rejectingUser} onOpenChange={() => setRejectingUser(null)}>
          <DialogContent className="max-w-md bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                Reject User Registration
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-xs">
                You are rejecting registration for <span className="font-semibold text-gray-900">{rejectingUser.first_name} {rejectingUser.surname}</span> ({rejectingUser.phone_number}). They will not be able to log in.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Reason for Rejection *
              </label>
              <Input
                placeholder="e.g. Invalid profile details, not part of community..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-sm"
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setRejectingUser(null)}
                disabled={rejectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
