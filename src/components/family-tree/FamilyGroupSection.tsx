import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMemberCard } from './FamilyMemberCard';
import type { GroupedRelation } from '@/lib/relationship-grouper';

interface Props {
  title: string;
  icon: ReactNode;
  members: GroupedRelation[];
  emptyText?: string;
  onAdd?: () => void;
  onMemberClick?: (memberId: number) => void;
}

export function FamilyGroupSection({ 
  title, 
  icon, 
  members, 
  emptyText,
  onAdd,
  onMemberClick 
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#A3232815] text-[#A32328] flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">
            {title}
            {members.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({members.length})
              </span>
            )}
          </h3>
        </div>
        
        {onAdd && (
          <Button
            onClick={onAdd}
            variant="ghost"
            size="sm"
            className="text-[#A32328] hover:bg-[#A3232815]"
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      
      {/* Members Grid */}
      <div className="p-4">
        {members.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">
            {emptyText || `No ${title.toLowerCase()} added yet`}
            {onAdd && (
              <button
                onClick={onAdd}
                className="block mx-auto mt-2 text-[#A32328] font-medium hover:underline"
              >
                + Add {title}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map((rel) => (
              <FamilyMemberCard
                key={rel.member.id}
                name={rel.member.name}
                photo={rel.member.photo}
                label={rel.label}
                via={rel.via}
                onClick={() => onMemberClick?.(rel.member.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
