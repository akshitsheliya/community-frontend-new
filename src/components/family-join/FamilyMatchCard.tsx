import { Button } from '@/components/ui/button';
import { Home, User, Users, Sparkles } from 'lucide-react';
import type { FamilyMatch } from '@/lib/family-join-api';
import { getParentPrefix } from '@/lib/text-helpers';

interface Props {
  family: FamilyMatch | any;
  onSelect: () => void;
}

function getScoreColor(score?: number): string {
  if (score === undefined || score === null) return 'bg-gray-50 text-gray-700 border-gray-200';
  if (score >= 90) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
}

export function FamilyMatchCard({ family, onSelect }: Props) {
  const firstName = family.head_first_name || family.first_name || '';
  const surname = family.head_surname || family.surname || '';
  const fatherName = family.head_father_name || family.father_name;
  const gender = family.head_gender || family.gender;
  const photo = family.head_photo || family.profile_photo;
  const memberCount = family.number_of_family_members ?? 1;

  const initials = `${firstName[0] || ''}${surname[0] || ''}`;
  const scoreColor = getScoreColor(family.match_score);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className={`px-4 py-2 border-b border-gray-50 flex items-center justify-between ${scoreColor}`}>
        <div className="flex items-center gap-2">
          {family.match_score !== undefined && family.match_score !== null ? (
            <>
              <Sparkles size={14} />
              <span className="text-xs font-medium">
                {family.match_score}% Match
              </span>
            </>
          ) : (
            <>
              <Home size={14} />
              <span className="text-xs font-medium">Community Family</span>
            </>
          )}
        </div>
        <div className="text-xs">
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Family Head Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden">
            {photo ? (
              <img 
                src={photo} 
                alt={firstName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials || <User size={20} />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Home size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500">Family Head</p>
            </div>
            <h3 className="font-semibold text-gray-900">
              {firstName} {surname}
            </h3>
            {fatherName && (
              <p className="text-xs text-gray-500">
                {getParentPrefix(gender)} {fatherName}
              </p>
            )}
            {gender && (
              <p className="text-xs text-gray-400 mt-1">
                {gender}
              </p>
            )}
          </div>
        </div>
        
        {/* Match Reason */}
        {family.match_reason && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-medium">Why we suggest this: </span>
              {family.match_reason}
            </p>
          </div>
        )}
        
        {/* Action */}
        <Button
          onClick={onSelect}
          className="w-full mt-4 bg-[#A32328] hover:bg-[#8B1E22] text-white"
        >
          <Users size={16} className="mr-2" />
          This Is My Family
        </Button>
      </div>
    </div>
  );
}
