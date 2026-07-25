import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { donorsApi, DONATION_CATEGORIES } from '@/lib/donors-api';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export function AddDonorDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    donor_name: '',
    donor_mobile_no: '',
    donation_category: '',
    donation_year: new Date().getFullYear().toString(),
    is_lifetime_donor: '0',
    donor_type: 'External'
  });
  
  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      return donorsApi.create(fd);
    },
    onSuccess: () => {
      toast.success('Donor added!');
      handleClose();
      onSuccess();
    },
    onError: () => toast.error('Failed to add donor')
  });
  
  const handleClose = () => {
    setForm({ donor_name: '', donor_mobile_no: '', donation_category: '', 
             donation_year: new Date().getFullYear().toString(), 
             is_lifetime_donor: '0', donor_type: 'External' });
    onClose();
  };
  
  const isValid = form.donor_name.trim() && form.donation_category;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader><DialogTitle>Add Donor</DialogTitle></DialogHeader>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Donor Name *</label>
            <Input value={form.donor_name} 
              onChange={e => setForm({...form, donor_name: e.target.value})} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Mobile Number</label>
            <Input value={form.donor_mobile_no}
              onChange={e => setForm({...form, donor_mobile_no: e.target.value})} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Category *</label>
            <select value={form.donation_category}
              onChange={e => setForm({...form, donation_category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">Select category...</option>
              {DONATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Year</label>
            <Input value={form.donation_year}
              onChange={e => setForm({...form, donation_year: e.target.value})} />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" 
              checked={form.is_lifetime_donor === '1'}
              onChange={e => setForm({...form, is_lifetime_donor: e.target.checked ? '1' : '0'})} 
            />
            <span className="text-sm">Mark as Lifetime Donor</span>
          </label>
        </div>
        
        <div className="flex gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white">
            {mutation.isPending ? 'Adding...' : 'Add Donor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
