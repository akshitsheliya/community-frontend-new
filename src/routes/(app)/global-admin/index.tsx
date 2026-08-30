import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  globalAdminApi,
  type GlobalCommunityOverview,
  type PendingUserRequest,
  type GlobalMember,
} from '@/lib/global-admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Copy,
  ArrowRightLeft,
  Trash2,
  Search,
  RefreshCw,
  LogOut,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { isDirectAdminSession } from '@/lib/auth';

export const Route = createFileRoute('/(app)/global-admin/')({
  component: GlobalAdminPage,
});

function GlobalAdminPage() {
  const navigate = useNavigate();
  const isDirectAdmin = isDirectAdminSession();
  const [activeTab, setActiveTab] = useState<'pending' | 'directory'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState<string>('all');

  // Modals state
  const [copyTargetUser, setCopyTargetUser] = useState<GlobalMember | null>(null);
  const [copyCommunityId, setCopyCommunityId] = useState<number | null>(null);

  const [moveTargetUser, setMoveTargetUser] = useState<GlobalMember | null>(null);
  const [moveCommunityId, setMoveCommunityId] = useState<number | null>(null);

  const [removeTargetUser, setRemoveTargetUser] = useState<GlobalMember | null>(null);
  const [removalReason, setRemovalReason] = useState('');

  // Fetch overview data
  const { data: overviewData, isLoading, refetch } = useQuery({
    queryKey: ['global-admin-overview'],
    queryFn: globalAdminApi.getOverview,
  });

  const communities: GlobalCommunityOverview[] = overviewData?.data?.communities || [];
  const pendingRequests: PendingUserRequest[] = overviewData?.data?.pendingRequests || [];
  const allMembers: GlobalMember[] = overviewData?.data?.allMembers || [];

  // Approve/Reject Mutation
  const approveMutation = useMutation({
    mutationFn: globalAdminApi.approveUser,
    onSuccess: (res, vars) => {
      toast.success(res.message || `User ${vars.action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user approval status');
    },
  });

  // Copy User Mutation
  const copyMutation = useMutation({
    mutationFn: globalAdminApi.copyUser,
    onSuccess: (res) => {
      toast.success(res.message || 'User copied to community successfully!');
      setCopyTargetUser(null);
      setCopyCommunityId(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to copy user');
    },
  });

  // Move User Mutation
  const moveMutation = useMutation({
    mutationFn: globalAdminApi.moveUser,
    onSuccess: (res) => {
      toast.success(res.message || 'User moved to community successfully!');
      setMoveTargetUser(null);
      setMoveCommunityId(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to move user');
    },
  });

  // Remove User Mutation
  const removeMutation = useMutation({
    mutationFn: globalAdminApi.removeUser,
    onSuccess: (res) => {
      toast.success(res.message || 'User removed from community successfully');
      setRemoveTargetUser(null);
      setRemovalReason('');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    },
  });

  // Filtered members
  const filteredMembers = allMembers.filter((m) => {
    const matchesSearch =
      `${m.first_name || ''} ${m.surname || ''} ${m.phone_number || ''} ${m.village || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCommunity =
      selectedCommunityFilter === 'all' ||
      String(m.community_id) === selectedCommunityFilter;

    return matchesSearch && matchesCommunity;
  });

  // Group pending requests by community
  const pendingByCommunity = communities.map((comm) => {
    const requests = pendingRequests.filter((r) => r.community_id === comm.community_id);
    return {
      ...comm,
      requests,
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-theme to-[#7a181b] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
              <ShieldCheck size={14} />
              <span>Global Admin Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Rajesh Patel (Global Admin)</h1>
            <p className="text-sm text-white/80 mt-1">
              Multi-Community Management & System-Wide User Administration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw size={16} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isDirectAdmin ? (
              <Button
                onClick={() => {
                  localStorage.removeItem('is_global_admin');
                  localStorage.removeItem('is_direct_admin');
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('token');
                  localStorage.removeItem('userData');
                  localStorage.removeItem('communityData');
                  navigate({ to: '/community' });
                }}
                variant="outline"
                size="sm"
                className="bg-white text-theme hover:bg-gray-100 font-semibold shadow-sm"
              >
                <LogOut size={16} className="mr-1.5" />
                Exit Admin
              </Button>
            ) : (
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                variant="outline"
                size="sm"
                className="bg-white text-theme hover:bg-gray-100 font-semibold shadow-sm"
              >
                <ArrowLeft size={16} className="mr-1.5" />
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <p className="text-xs text-white/70">Total Communities</p>
            <p className="text-xl font-bold">{communities.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <p className="text-xs text-white/70">Pending Approvals</p>
            <p className="text-xl font-bold text-amber-300">{pendingRequests.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-white/70">Active Members</p>
            <p className="text-xl font-bold">{allMembers.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white text-theme shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserCheck size={18} />
          <span>Pending Approvals</span>
          {pendingRequests.length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-white text-theme shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={18} />
          <span>Global User Directory & Actions</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <UserCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Pending Approvals</h3>
              <p className="text-sm text-gray-500 mt-1">
                All community registration requests have been approved!
              </p>
            </div>
          ) : (
            pendingByCommunity.map(
              (group) =>
                group.requests.length > 0 && (
                  <div
                    key={group.community_id}
                    className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-theme/10 text-theme font-bold flex items-center justify-center">
                          {group.community_number}
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 text-base">{group.community_name}</h2>
                          <p className="text-xs text-gray-500">
                            Community Code: {group.community_number} • {group.requests.length} Pending Request(s)
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Action Required
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.requests.map((req) => (
                        <div
                          key={req.community_member_relation_id}
                          className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-gray-900 text-base">
                                {req.first_name} {req.surname}
                              </h4>
                              <span className="text-[11px] text-gray-400">
                                {new Date(req.added_on).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Father/Husband: <span className="font-medium">{req.father_name || '-'}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Mobile: <span className="font-medium text-gray-900">+91 {req.phone_number}</span>
                            </p>
                            {req.village && (
                              <p className="text-xs text-gray-500">Village: {req.village}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                            <Button
                              onClick={() =>
                                approveMutation.mutate({
                                  member_id: req.member_id,
                                  community_id: req.community_id,
                                  action: 'approve',
                                })
                              }
                              disabled={approveMutation.isPending}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium text-xs h-9"
                            >
                              <UserCheck size={14} className="mr-1" />
                              Approve & Grant Login
                            </Button>

                            <Button
                              onClick={() =>
                                approveMutation.mutate({
                                  member_id: req.member_id,
                                  community_id: req.community_id,
                                  action: 'reject',
                                  reason: 'Registration rejected by Global Admin',
                                })
                              }
                              disabled={approveMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 border-red-200 text-xs h-9"
                            >
                              <UserX size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL USER DIRECTORY & ACTIONS */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search member by name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Filter Community:
              </label>
              <select
                value={selectedCommunityFilter}
                onChange={(e) => setSelectedCommunityFilter(e.target.value)}
                className="h-10 text-xs rounded-xl border border-gray-300 px-3 bg-white font-medium focus:ring-1 focus:ring-theme outline-none w-full sm:w-48"
              >
                <option value="all">All Communities ({allMembers.length})</option>
                {communities.map((c) => (
                  <option key={c.community_id} value={String(c.community_id)}>
                    {c.community_name} (Code: {c.community_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Members ({filteredMembers.length})
              </span>
              <span className="text-xs text-gray-400">Actions: Copy • Move • Remove</span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No members found matching your search.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <div
                    key={`${member.member_id}-${member.community_id}`}
                    className="p-4 hover:bg-gray-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-theme/10 text-theme font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {member.first_name ? member.first_name[0] : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {member.first_name} {member.surname}
                          </h4>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            {member.community_name}
                          </span>
                          {member.is_community_admin === 1 && (
                            <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Phone: <span className="font-medium text-gray-800">+91 {member.phone_number}</span>
                          {member.father_name && ` • s/o ${member.father_name}`}
                          {member.village && ` • Village: ${member.village}`}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Copy */}
                      <Button
                        onClick={() => {
                          setCopyTargetUser(member);
                          setCopyCommunityId(null);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        <Copy size={13} className="mr-1" />
                        Copy
                      </Button>

                      {/* Move */}
                      <Button
                        onClick={() => {
                          setMoveTargetUser(member);
                          setMoveCommunityId(null);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium text-amber-700 border-amber-200 hover:bg-amber-50"
                      >
                        <ArrowRightLeft size={13} className="mr-1" />
                        Move
                      </Button>

                      {/* Remove */}
                      <Button
                        onClick={() => {
                          setRemoveTargetUser(member);
                          setRemovalReason('');
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={13} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: COPY USER TO COMMUNITY */}
      {copyTargetUser && (
        <Dialog open={!!copyTargetUser} onOpenChange={(open: boolean) => { if (!open) setCopyTargetUser(null); }}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl border text-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Copy size={20} className="text-blue-600" />
                Copy Member to Another Community
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Copy <strong>{copyTargetUser.first_name} {copyTargetUser.surname}</strong> (+91 {copyTargetUser.phone_number}) from {copyTargetUser.community_name} to a new community.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <label className="text-xs font-semibold text-gray-700 block">Select Target Community:</label>
              <select
                value={copyCommunityId || ''}
                onChange={(e) => setCopyCommunityId(Number(e.target.value))}
                className="w-full h-11 border rounded-xl px-3 bg-white text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Choose Community --</option>
                {communities
                  .filter((c) => c.community_id !== copyTargetUser.community_id)
                  .map((c) => (
                    <option key={c.community_id} value={c.community_id}>
                      {c.community_name} (Code: {c.community_number})
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setCopyTargetUser(null)}>
                Cancel
              </Button>
              <Button
                disabled={!copyCommunityId || copyMutation.isPending}
                onClick={() =>
                  copyCommunityId &&
                  copyMutation.mutate({
                    member_id: copyTargetUser.member_id,
                    target_community_id: copyCommunityId,
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {copyMutation.isPending ? 'Copying...' : 'Copy Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: MOVE USER TO COMMUNITY */}
      {moveTargetUser && (
        <Dialog open={!!moveTargetUser} onOpenChange={(open: boolean) => { if (!open) setMoveTargetUser(null); }}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl border text-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <ArrowRightLeft size={20} className="text-amber-600" />
                Move Member to Another Community
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Transfer <strong>{moveTargetUser.first_name} {moveTargetUser.surname}</strong> from {moveTargetUser.community_name} to a new community. If the user is currently online, a forced switch popup will be triggered.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <label className="text-xs font-semibold text-gray-700 block">Select Destination Community:</label>
              <select
                value={moveCommunityId || ''}
                onChange={(e) => setMoveCommunityId(Number(e.target.value))}
                className="w-full h-11 border rounded-xl px-3 bg-white text-sm font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="">-- Choose Target Community --</option>
                {communities
                  .filter((c) => c.community_id !== moveTargetUser.community_id)
                  .map((c) => (
                    <option key={c.community_id} value={c.community_id}>
                      {c.community_name} (Code: {c.community_number})
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setMoveTargetUser(null)}>
                Cancel
              </Button>
              <Button
                disabled={!moveCommunityId || moveMutation.isPending}
                onClick={() =>
                  moveCommunityId &&
                  moveMutation.mutate({
                    member_id: moveTargetUser.member_id,
                    source_community_id: moveTargetUser.community_id,
                    target_community_id: moveCommunityId,
                  })
                }
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {moveMutation.isPending ? 'Moving...' : 'Move Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: REMOVE USER FROM COMMUNITY (WITH REASON) */}
      {removeTargetUser && (
        <Dialog open={!!removeTargetUser} onOpenChange={(open: boolean) => { if (!open) setRemoveTargetUser(null); }}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl border text-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600">
                <AlertTriangle size={22} />
                Remove Member from Community
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Remove <strong>{removeTargetUser.first_name} {removeTargetUser.surname}</strong> from {removeTargetUser.community_name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-left">
              <label className="text-xs font-semibold text-gray-800 block">
                Removal Reason / Admin Notice <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Enter reason for removing user (this notice will be shown to the user on their screen)..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
              <p className="text-[11px] text-gray-400">
                The user will receive an unclosable notice popup with this exact message and will be logged out.
              </p>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setRemoveTargetUser(null)}>
                Cancel
              </Button>
              <Button
                disabled={!removalReason.trim() || removeMutation.isPending}
                onClick={() =>
                  removeMutation.mutate({
                    member_id: removeTargetUser.member_id,
                    community_id: removeTargetUser.community_id,
                    reason: removalReason.trim(),
                  })
                }
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {removeMutation.isPending ? 'Removing...' : 'Confirm Removal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
