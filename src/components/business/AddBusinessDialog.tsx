import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { businessApi } from '@/lib/business-api';
import { toast } from 'sonner';
import { Camera, Briefcase } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddBusinessDialog({ open, onClose }: Props) {
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    category: '',
    city: '',
    state: '',
    address: '',
    contact_number: '',
    contact_email: '',
    services_products: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['business-categories'],
    queryFn: businessApi.getCategories
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const mutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (photo) {
        data.append('business_photo', photo);
      }
      return businessApi.create(data);
    },
    onSuccess: () => {
      toast.success('Business listed successfully!');
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to list business');
    }
  });
  
  const handleClose = () => {
    setFormData({
      business_name: '',
      business_type: '',
      category: '',
      city: '',
      state: '',
      address: '',
      contact_number: '',
      contact_email: '',
      services_products: '',
    });
    setPhoto(null);
    setPhotoPreview(null);
    onClose();
  };
  
  const handleSubmit = () => {
    if (!formData.business_name || !formData.category || !formData.contact_number) {
      toast.error('Please fill required fields (Name, Category, Contact Number)');
      return;
    }
    mutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900 border-gray-200 shadow-2xl">
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle>List Your Business</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {/* Photo Upload */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-gray-700">Business Photo (Optional)</label>
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-sm border border-gray-200"
                  />
                  <label className="absolute top-2 right-2 bg-white text-[#A32328] px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer shadow-md hover:bg-gray-50 transition">
                    Change Photo
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#A32328] hover:bg-red-50/50 transition text-gray-400 hover:text-[#A32328]">
                  <Camera className="mb-2" size={36} />
                  <p className="text-sm font-medium">Click to upload photo</p>
                  <p className="text-xs mt-1 text-gray-400">JPG, PNG up to 5MB</p>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Business Name *</label>
              <Input 
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="e.g., Patel Textiles"
                className="h-11"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A32328] focus:border-transparent transition"
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.name_eng} value={cat.name_eng}>
                    {cat.name_eng}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Business Type */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Business Type</label>
              <Input 
                value={formData.business_type}
                onChange={(e) => handleChange('business_type', e.target.value)}
                placeholder="e.g., Manufacturer, Retailer, Service"
                className="h-11"
              />
            </div>
            
            {/* City/State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block text-gray-700">City</label>
                <Input 
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Surat"
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block text-gray-700">State</label>
                <Input 
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. Gujarat"
                  className="h-11"
                />
              </div>
            </div>
            
            {/* Address */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Full Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                placeholder="Shop/Office full address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A32328] focus:border-transparent transition"
              />
            </div>
            
            {/* Contact */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Contact Number *</label>
              <Input 
                type="tel"
                value={formData.contact_number}
                onChange={(e) => handleChange('contact_number', e.target.value)}
                placeholder="9999900001"
                maxLength={15}
                className="h-11"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">Contact Email</label>
              <Input 
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="business@example.com"
                className="h-11"
              />
            </div>
            
            {/* Services */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">
                About / Services Offered
              </label>
              <textarea
                value={formData.services_products}
                onChange={(e) => handleChange('services_products', e.target.value)}
                rows={4}
                placeholder="Describe what your business offers, products, services, expertise..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A32328] focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50 flex-shrink-0">
          <Button 
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 bg-white"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={mutation.isPending || !formData.business_name || !formData.category || !formData.contact_number}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] h-11 shadow-sm"
          >
            <Briefcase size={16} className="mr-2" />
            {mutation.isPending ? 'Listing...' : 'List Business'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
