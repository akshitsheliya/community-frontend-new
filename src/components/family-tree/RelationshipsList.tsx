import { useQuery } from '@tanstack/react-query';
import { familyGraphApi } from '@/lib/family-graph-api';
import { User, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RelationshipsList() {
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['my-relationships'],
    queryFn: familyGraphApi.getMyRelationships
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  if (relationships.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600">No relationships added yet</p>
        <p className="text-sm text-gray-500">
          Click "Add Relationship" to build your family tree
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {relationships.map((rel) => (
        <div 
          key={rel.relationship_uuid}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-semibold">
            {rel.to_first_name?.[0]}{rel.to_surname?.[0]}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {rel.to_first_name} {rel.to_surname}
            </p>
            <p className="text-sm text-gray-600 capitalize">
              is your {rel.relationship_label}
            </p>
          </div>
          
          <div>
            {rel.is_verified ? (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <CheckCircle2 size={14} />
                Verified
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-600 text-xs">
                <Clock size={14} />
                Pending
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
