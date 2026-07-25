import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  X,
  MessageCircle,
  Navigation
} from 'lucide-react';
import { getCategoryIcon, type Business } from '@/lib/business-api';
import { Button } from '@/components/ui/button';

interface Props {
  business: Business;
  open: boolean;
  onClose: () => void;
  currentMemberId?: number;
}

export function BusinessDetailDialog({ business, open, onClose, currentMemberId }: Props) {
  const icon = getCategoryIcon(business.category);
  const isOwner = currentMemberId === business.added_by;
  
  const openWhatsApp = () => {
    if (!business.contact_number) return;
    const cleanNumber = business.contact_number.replace(/\D/g, '');
    const msg = `Hi, I found your business "${business.business_name}" in the community directory. Interested in your services.`;
    window.open(`https://wa.me/91${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };
  
  const openMaps = () => {
    if (!business.address) return;
    const query = encodeURIComponent(business.address);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900 border-gray-200 shadow-2xl">
        {/* Header Image / Icon */}
        <div className="relative h-48 bg-gradient-to-br from-[#A32328] to-[#8B1E22] flex items-center justify-center flex-shrink-0">
          {business.business_photo ? (
            <img 
              src={business.business_photo}
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-8xl">{icon}</div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60"
          >
            <X size={16} />
          </button>
          
          {isOwner && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 shadow-sm text-xs font-bold text-[#A32328]">
              Your Business
            </div>
          )}
        </div>
        
        <div className="p-5 overflow-y-auto">
          {/* Title */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {business.business_name}
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {business.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3232815] text-[#A32328] text-xs font-semibold">
                  <span>{icon}</span>
                  {business.category}
                </span>
              )}
              {business.business_type && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                  <Briefcase size={12} />
                  {business.business_type}
                </span>
              )}
            </div>
          </div>
          
          {/* Services */}
          {business.services_products && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                About / Services
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {business.services_products}
              </p>
            </div>
          )}
          
          {/* Location */}
          {business.address && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Location
              </h3>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-snug font-medium">{business.address}</p>
                    {(business.city || business.state) && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {[business.city, business.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={openMaps}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-white"
                >
                  <Navigation size={14} className="mr-2 text-gray-500" />
                  Open in Maps
                </Button>
              </div>
            </div>
          )}
          
          {/* Contact */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Contact Info
            </h3>
            <div className="space-y-2">
              {business.contact_number && (
                <a 
                  href={`tel:${business.contact_number}`}
                  className="flex items-center gap-3.5 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-sm transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{business.contact_number}</p>
                  </div>
                </a>
              )}
              
              {business.contact_email && (
                <a 
                  href={`mailto:${business.contact_email}`}
                  className="flex items-center gap-3.5 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{business.contact_email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {business.contact_number && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 flex-shrink-0">
            <Button
              onClick={() => window.location.href = `tel:${business.contact_number}`}
              className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] h-11"
            >
              <Phone size={16} className="mr-2" />
              Call
            </Button>
            <Button
              onClick={openWhatsApp}
              className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white h-11"
            >
              <MessageCircle size={16} className="mr-2" />
              WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
