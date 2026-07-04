import React from 'react';
import type { Member } from '@/types/api';
import { Phone, ChevronRight, User, ShieldAlert, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  // Get initials
  const initials = `${member.first_name?.[0] || ''}${member.surname?.[0] || ''}`.toUpperCase();

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-4",
        "hover:shadow-md transition-shadow cursor-pointer",
        "flex items-center gap-4"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-semibold overflow-hidden relative">
        {member.profile_photo ? (
          <img 
            src={member.profile_photo} 
            alt={member.first_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || <User size={20} />}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-900 font-semibold truncate">
            {member.first_name} {member.surname}
          </h3>
          {member.is_community_admin === true || member.is_community_admin === 1 ? (
             <ShieldAlert size={14} className="text-[#A32328]" />
          ) : null}
        </div>
        
        <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
          <Phone size={12} className="flex-shrink-0" />
          <span className="truncate">{member.phone_number}</span>
        </div>

        {/* Badges/Family Name */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
           {member.is_family_representative === true || member.is_family_representative === 1 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
              <Star size={10} />
              Family Head
            </span>
          ) : null}
          {member.is_committee_member === true || member.is_committee_member === 1 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              Committee
            </span>
          ) : null}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 text-gray-300">
        <ChevronRight size={20} />
      </div>
    </div>
  );
}
