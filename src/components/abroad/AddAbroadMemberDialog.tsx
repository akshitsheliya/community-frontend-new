import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { abroadApi } from '@/lib/abroad-api';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export function AddAbroadMemberDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    country: '',
    city: '',
    career: '',
    designation: '',
    experience_year: '',
    contact_number: '',
    govt_private: 'Private',
  });
  
  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      return abroadApi.create(fd);
    },
    onSuccess: () => {
      toast.success('Abroad Member added!');
      handleClose();
      onSuccess();
    },
    onError: () => toast.error('Failed to add abroad member')
  });
  
  const handleClose = () => {
    setForm({ full_name: '', country: '', city: '', career: '', designation: '', experience_year: '', contact_number: '', govt_private: 'Private' });
    onClose();
  };
  
  const isValid = form.full_name.trim() && form.country.trim();
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-md bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader><DialogTitle>Add Abroad Member</DialogTitle></DialogHeader>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name *</label>
            <Input value={form.full_name} 
              onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Country *</label>
              <Input value={form.country}
                onChange={e => setForm({...form, country: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <Input value={form.city}
                onChange={e => setForm({...form, city: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Career / Field</label>
              <Input value={form.career}
                onChange={e => setForm({...form, career: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Designation</label>
              <Input value={form.designation}
                onChange={e => setForm({...form, designation: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="text-sm font-medium mb-1 block">Experience (Years)</label>
              <Input type="number" value={form.experience_year}
                onChange={e => setForm({...form, experience_year: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Number</label>
              <Input value={form.contact_number}
                onChange={e => setForm({...form, contact_number: e.target.value})} />
            </div>
          </div>
          
           <div>
            <label className="text-sm font-medium mb-1 block">Sector</label>
            <select value={form.govt_private}
              onChange={e => setForm({...form, govt_private: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="Private">Private</option>
              <option value="Government">Government</option>
              <option value="Business">Business</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white">
            {mutation.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
