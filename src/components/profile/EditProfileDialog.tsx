import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  userApi, 
  type UserProfile,
  BLOOD_GROUPS,
  MARITAL_STATUS,
  GENDER_OPTIONS,
  OCCUPATION_TYPES
} from '@/lib/user-api';
import { toast } from 'sonner';
import { Camera, User } from 'lucide-react';

interface Props {
  profile: UserProfile;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileDialog({ profile, open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    father_name: profile.father_name || '',
    surname: profile.surname || '',
    gender: profile.gender || '',
    date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
    email_id: profile.email_id || '',
    blood_group: profile.blood_group || '',
    marital_status: profile.marital_status || '',
    address: profile.address || '',
    current_resident: profile.current_resident || '',
    business_or_job_or_any: profile.business_or_job_or_any || '',
    business_details: profile.business_details || '',
    profession_sector: profile.profession_sector || '',
    education: profile.education || '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.profile_photo);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
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
      if (photoFile) {
        data.append('profile_photo', photoFile);
      }
      return userApi.updateProfile(profile.member_uuid, data);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  });
  
  const initials = `${formData.first_name?.[0] || ''}${formData.surname?.[0] || ''}`;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900 border-gray-200 shadow-2xl">
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-100 overflow-hidden">
                {photoPreview ? (
                  <img 
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#A32328] text-white flex items-center justify-center text-2xl font-bold">
                    {initials || <User size={32} />}
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#A32328] hover:bg-[#8B1E22] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                <Camera size={14} />
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Tap camera to change photo</p>
          </div>
          
          {/* Basic Info */}
          <FormSection title="Basic Information">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name *">
                <Input 
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                />
              </FormField>
              <FormField label="Surname *">
                <Input 
                  value={formData.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                />
              </FormField>
            </div>
            
            <FormField label="Father's Name">
              <Input 
                value={formData.father_name}
                onChange={(e) => handleChange('father_name', e.target.value)}
              />
            </FormField>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Gender">
                <SelectField 
                  value={formData.gender}
                  onChange={(v) => handleChange('gender', v)}
                  options={GENDER_OPTIONS}
                />
              </FormField>
              <FormField label="Date of Birth">
                <Input 
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>
          
          {/* Contact */}
          <FormSection title="Contact">
            <FormField label="Email">
              <Input 
                type="email"
                value={formData.email_id}
                onChange={(e) => handleChange('email_id', e.target.value)}
                placeholder="you@example.com"
              />
            </FormField>
            
            <FormField label="Address">
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </FormField>
            
            <FormField label="Current Location (City)">
              <Input 
                value={formData.current_resident}
                onChange={(e) => handleChange('current_resident', e.target.value)}
                placeholder="e.g., Mumbai, Umarala"
              />
            </FormField>
          </FormSection>
          
          {/* Personal */}
          <FormSection title="Personal">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Blood Group">
                <SelectField 
                  value={formData.blood_group}
                  onChange={(v) => handleChange('blood_group', v)}
                  options={BLOOD_GROUPS}
                />
              </FormField>
              <FormField label="Marital Status">
                <SelectField 
                  value={formData.marital_status}
                  onChange={(v) => handleChange('marital_status', v)}
                  options={MARITAL_STATUS}
                />
              </FormField>
            </div>
          </FormSection>
          
          {/* Professional */}
          <FormSection title="Professional">
            <FormField label="Occupation Type">
              <SelectField 
                value={formData.business_or_job_or_any}
                onChange={(v) => handleChange('business_or_job_or_any', v)}
                options={OCCUPATION_TYPES}
              />
            </FormField>
            
            <FormField label="Details">
              <Input 
                value={formData.business_details}
                onChange={(e) => handleChange('business_details', e.target.value)}
                placeholder="Job title / Business name"
              />
            </FormField>
            
            <FormField label="Profession Sector">
              <Input 
                value={formData.profession_sector}
                onChange={(e) => handleChange('profession_sector', e.target.value)}
                placeholder="e.g., IT, Healthcare, Education"
              />
            </FormField>
            
            <FormField label="Education">
              <Input 
                value={formData.education}
                onChange={(e) => handleChange('education', e.target.value)}
                placeholder="e.g., B.Tech, MBA, etc."
              />
            </FormField>
          </FormSection>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <Button 
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !formData.first_name.trim() || !formData.surname.trim()}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22]"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
    >
      <option value="">Select...</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
