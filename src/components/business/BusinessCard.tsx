import { MapPin, Phone, Briefcase } from 'lucide-react';
import { getCategoryIcon, type Business } from '@/lib/business-api';

interface Props {
  business: Business;
  onClick: () => void;
}

export function BusinessCard({ business, onClick }: Props) {
  const icon = getCategoryIcon(business.category);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Photo or Icon Header */}
      <div className="relative h-32 bg-gradient-to-br from-[#A3232815] to-[#A3232830] flex items-center justify-center">
        {business.business_photo ? (
          <img 
            src={business.business_photo}
            alt={business.business_name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="text-6xl">{icon}</div>
        )}
        
        {/* Category Badge */}
        {business.category && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 flex items-center gap-1 shadow-sm">
            <span>{icon}</span>
            {business.category}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {business.business_name}
        </h3>
        
        {business.business_type && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Briefcase size={11} />
            {business.business_type}
          </p>
        )}
        
        <div className="mt-2 space-y-1">
          {(business.city || business.state) && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin size={11} />
              {[business.city, business.state].filter(Boolean).join(', ')}
            </p>
          )}
          
          {business.contact_number && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Phone size={11} />
              {business.contact_number}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
