import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/user-api';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Droplet,
  Edit2,
  Shield,
  Crown,
  Users,
  ArrowLeft,
  LogOut,
  Trash2
} from 'lucide-react';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import React from 'react';
import { getParentPrefix } from '@/lib/text-helpers';
import { ErrorState } from '@/components/ui/error-state';

import { LogoutConfirmDialog } from '@/components/common/LogoutConfirmDialog';

export const Route = createFileRoute('/(app)/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: userApi.getMe
  });
  
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto" />
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4 pt-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }
  
  if (!profile) {
    return <div className="p-4 text-center text-gray-500">Profile not found</div>;
  }
  
  const initials = `${profile.first_name?.[0] || ''}${profile.surname?.[0] || ''}`;
  const fullName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
  
  return (
    <div className="max-w-3xl mx-auto p-4 pt-6 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        </div>
        
        <Button 
          onClick={() => setShowEditDialog(true)}
          className="bg-[#A32328] hover:bg-[#8B1E22] text-white"
          size="sm"
        >
          <Edit2 size={14} className="mr-1" />
          Edit
        </Button>
      </div>
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Cover with gradient */}
        <div className="h-28 bg-gradient-to-r from-[#A32328] to-[#8B1E22]" />
        
        {/* Avatar + Basic Info */}
        <div className="px-5 pb-5 -mt-14">
          <div className="flex items-end gap-4">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm relative">
              {profile.profile_photo ? (
                <img 
                  src={profile.profile_photo}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#A32328] text-white flex items-center justify-center text-3xl font-bold">
                  {initials || <User size={40} />}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900 leading-none">
              {fullName}
            </h2>
            {profile.father_name && (
              <p className="text-sm text-gray-500 mt-1">
                {getParentPrefix(profile.gender)} {profile.father_name}
              </p>
            )}
            
            {/* Role Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.is_community_admin === 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <Shield size={12} />
                  Community Admin
                </span>
              )}
              {profile.is_family_representative === 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Crown size={12} />
                  Family Head
                </span>
              )}
              {profile.is_committee_member === 1 && profile.designation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Users size={12} />
                  {profile.designation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <ProfileSection title="Contact Information" icon={<Phone size={16} />}>
        <ProfileField 
          icon={<Phone size={16} />}
          label="Phone"
          value={profile.phone_number}
          isLink="tel"
        />
        <ProfileField 
          icon={<Mail size={16} />}
          label="Email"
          value={profile.email_id}
          isLink="mailto"
        />
        <ProfileField 
          icon={<MapPin size={16} />}
          label="Address"
          value={profile.address}
        />
        <ProfileField 
          icon={<MapPin size={16} />}
          label="Current Location"
          value={profile.current_resident}
        />
      </ProfileSection>
      
      {/* Personal Information */}
      <ProfileSection title="Personal Information" icon={<User size={16} />}>
        <ProfileField 
          icon={<User size={16} />}
          label="Gender"
          value={profile.gender}
        />
        <ProfileField 
          icon={<Calendar size={16} />}
          label="Date of Birth"
          value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN') : null}
        />
        <ProfileField 
          icon={<Droplet size={16} />}
          label="Blood Group"
          value={profile.blood_group}
        />
        <ProfileField 
          icon={<Heart size={16} />}
          label="Marital Status"
          value={profile.marital_status}
        />
      </ProfileSection>
      
      {/* Professional Information */}
      <ProfileSection title="Professional Information" icon={<Briefcase size={16} />}>
        <ProfileField 
          icon={<Briefcase size={16} />}
          label="Occupation Type"
          value={profile.business_or_job_or_any}
        />
        <ProfileField 
          icon={<Briefcase size={16} />}
          label="Details"
          value={profile.business_details}
        />
        <ProfileField 
          icon={<Briefcase size={16} />}
          label="Profession Sector"
          value={profile.profession_sector}
        />
        <ProfileField 
          icon={<GraduationCap size={16} />}
          label="Education"
          value={profile.education}
        />
      </ProfileSection>
      
      {/* Account Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 shadow-sm mt-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
          Account Actions
        </h3>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <LogOut size={18} />
          </div>
          <span className="font-medium text-sm">Logout</span>
        </button>
        
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Trash2 size={18} />
          </div>
          <span className="font-medium text-sm">Delete Account</span>
        </button>
      </div>
      
      {/* Dialogs */}
      {profile && (
        <EditProfileDialog 
          profile={profile}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            // Update localStorage
            userApi.getMe().then(updated => {
              localStorage.setItem('userData', JSON.stringify(updated));
            });
          }}
        />
      )}
      
      <DeleteAccountDialog 
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />

      <LogoutConfirmDialog 
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}

// Section wrapper
function ProfileSection({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
        <div className="w-7 h-7 rounded-lg bg-[#A3232815] text-[#A32328] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

// Field row
function ProfileField({ 
  icon, 
  label, 
  value, 
  isLink 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  isLink?: 'tel' | 'mailto';
}) {
  const displayValue = value || <span className="text-gray-400 italic font-normal">Not provided</span>;
  
  const content = (
    <div className="flex items-center gap-3.5 p-4">
      <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">
          {displayValue}
        </p>
      </div>
    </div>
  );
  
  if (isLink && value) {
    return (
      <a href={`${isLink}:${value}`} className="block hover:bg-gray-50 transition">
        {content}
      </a>
    );
  }
  
  return content;
}
