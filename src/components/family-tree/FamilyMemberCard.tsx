import { User, ChevronRight } from 'lucide-react';

interface Props {
  name: string;
  photo?: string | null;
  label?: string;
  via?: string;
  isCenter?: boolean;
  onClick?: () => void;
}

export function FamilyMemberCard({ name, photo, label, via, isCenter, onClick }: Props) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border-2 transition-all cursor-pointer
        ${isCenter 
          ? 'border-[#A32328] ring-4 ring-[#A32328]/10 shadow-lg' 
          : 'border-gray-100 hover:border-[#A32328]/30 hover:shadow-md'
        }
        p-4 flex items-center gap-3
      `}
    >
      {/* Avatar */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0
        ${isCenter ? 'bg-[#A32328] text-white' : 'bg-[#A3232815] text-[#A32328]'}
        font-semibold text-lg
      `}>
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials || <User size={24} />
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {name}
          {isCenter && (
            <span className="ml-2 text-xs bg-[#A32328] text-white px-2 py-0.5 rounded-full">
              You
            </span>
          )}
        </p>
        {label && (
          <p className="text-sm text-gray-600">
            {formatDisplayLabel(label)}
            {via && (
              <span className="text-xs text-gray-400 ml-1">
                (via {via})
              </span>
            )}
          </p>
        )}
      </div>
      
      {onClick && !isCenter && (
        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
}

function formatDisplayLabel(label: string): string {
  return label
    .split('_')[0]
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}
