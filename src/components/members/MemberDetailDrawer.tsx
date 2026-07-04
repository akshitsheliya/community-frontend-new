import React from 'react';
import type { Member } from '@/types/api';
import { X, Phone, User, Calendar, Mail, MapPin, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberDetailDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberDetailDrawer({ member, isOpen, onClose }: MemberDetailDrawerProps) {
  if (!isOpen || !member) return null;

  const initials = `${member.first_name?.[0] || ''}${member.surname?.[0] || ''}`.toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-gray-50 rounded-t-3xl overflow-hidden transition-transform transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
          "max-h-[90vh] flex flex-col shadow-2xl"
        )}
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-2 bg-white rounded-t-3xl">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header Content */}
        <div className="bg-white px-6 pb-6 relative shadow-sm z-10">
          <button 
            onClick={onClose}
            className="absolute top-2 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center mt-2">
            <div className="w-24 h-24 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center text-3xl font-semibold overflow-hidden border-4 border-white shadow-sm mb-4 relative">
              {member.profile_photo ? (
                <img 
                  src={member.profile_photo} 
                  alt={member.first_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials || <User size={40} />}</span>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {member.first_name} {member.father_name ? member.father_name + ' ' : ''}{member.surname}
            </h2>
            
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {member.is_community_admin === 1 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#A32328] text-white">
                  Community Admin
                </span>
              )}
              {member.is_family_representative === 1 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  Family Head
                </span>
              )}
              {member.is_committee_member === 1 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Committee Member
                </span>
              )}
            </div>
            
            {/* Quick Action: Call */}
            <a 
              href={`tel:${member.phone_number}`}
              className="mt-6 flex items-center justify-center gap-2 w-full max-w-xs bg-[#A32328] text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-[#8B1D22] transition-colors"
            >
              <Phone size={18} />
              Call {member.phone_number}
            </a>
          </div>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-12">
          {/* Contact Section */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Contact Details</h3>
            
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{member.phone_number}</p>
                <p className="text-xs text-gray-500">Mobile Number</p>
              </div>
            </div>
            
            {member.email_id && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.email_id}</p>
                  <p className="text-xs text-gray-500">Email Address</p>
                </div>
              </div>
            )}
            
            {member.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.address}</p>
                  <p className="text-xs text-gray-500">Address</p>
                </div>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Personal Information</h3>
            
            {member.gender && (
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.gender}</p>
                  <p className="text-xs text-gray-500">Gender</p>
                </div>
              </div>
            )}
            
            {member.date_of_birth && (
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{new Date(member.date_of_birth).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Family Info */}
          {member.family_uuid && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Family Info</h3>
               <div className="flex items-start gap-3">
                <Users size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Family Ref: {member.family_sr_id || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Clicking here will show family (Coming Soon)</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
