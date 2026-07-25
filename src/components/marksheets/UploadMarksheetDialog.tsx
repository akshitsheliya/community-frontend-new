import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { marksheetsApi } from '@/lib/marksheets-api';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export function UploadMarksheetDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    student_name: '',
    standard: '',
    medium: 'English',
    stream: '',
    percentage: '',
    marksheet_year: new Date().getFullYear().toString(),
    father_full_name: '',
    father_phone_number: '',
  });
  const [file, setFile] = useState<File | null>(null);
  
  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (file) {
        fd.append('marksheet_file', file);
      }
      return marksheetsApi.upload(fd);
    },
    onSuccess: () => {
      toast.success('Marksheet uploaded successfully!');
      handleClose();
      onSuccess();
    },
    onError: () => toast.error('Failed to upload marksheet')
  });
  
  const handleClose = () => {
    setForm({ 
      student_name: '', standard: '', medium: 'English', stream: '', 
      percentage: '', marksheet_year: new Date().getFullYear().toString(), 
      father_full_name: '', father_phone_number: '' 
    });
    setFile(null);
    onClose();
  };
  
  const isValid = form.student_name.trim() && form.standard.trim() && form.percentage.trim();
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-md bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader><DialogTitle>Upload Marksheet</DialogTitle></DialogHeader>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Student Name *</label>
            <Input value={form.student_name} 
              onChange={e => setForm({...form, student_name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Standard *</label>
              <Input value={form.standard} placeholder="e.g. 10th"
                onChange={e => setForm({...form, standard: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Medium *</label>
              <select value={form.medium}
                onChange={e => setForm({...form, medium: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hindi">Hindi</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Percentage *</label>
              <Input type="number" step="0.01" value={form.percentage} placeholder="95.50"
                onChange={e => setForm({...form, percentage: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Year *</label>
              <Input value={form.marksheet_year}
                onChange={e => setForm({...form, marksheet_year: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Stream (Optional)</label>
            <Input value={form.stream} placeholder="Science / Commerce / Arts"
              onChange={e => setForm({...form, stream: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="text-sm font-medium mb-1 block">Father's Name</label>
              <Input value={form.father_full_name}
                onChange={e => setForm({...form, father_full_name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Father's Phone</label>
              <Input value={form.father_phone_number}
                onChange={e => setForm({...form, father_phone_number: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Marksheet Photo/PDF</label>
            <Input type="file" accept="image/*,.pdf"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
            className="flex-1 bg-[#A32328] hover:bg-[#8B1E22] text-white">
            {mutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
