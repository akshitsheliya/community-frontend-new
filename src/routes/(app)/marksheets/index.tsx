import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marksheetsApi, type Marksheet } from '@/lib/marksheets-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, Plus, Search, Check, X, ArrowLeft, 
  Award, Calendar, BookOpen, GraduationCap, Clock, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadMarksheetDialog } from '@/components/marksheets/UploadMarksheetDialog';
import { ErrorState } from '@/components/ui/error-state';

export const Route = createFileRoute('/(app)/marksheets/')({
  component: MarksheetsPage,
});

function MarksheetsPage() {
  const navigate = useNavigate();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.is_community_admin === 1;
  
  const { data: marksheets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['marksheets', isAdmin],
    queryFn: isAdmin ? marksheetsApi.getAllAdmin : marksheetsApi.getMine
  });
  
  const approveMutation = useMutation({
    mutationFn: (id: number) => marksheetsApi.approve(id),
    onSuccess: () => {
      toast.success('Approved');
      queryClient.invalidateQueries({ queryKey: ['marksheets'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => marksheetsApi.reject(uuid, reason),
    onSuccess: () => {
      toast.success('Rejected');
      queryClient.invalidateQueries({ queryKey: ['marksheets'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => marksheetsApi.delete(id),
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['marksheets'] });
    }
  });
  
  const years = useMemo(() => {
    const s = new Set<string>();
    marksheets.forEach(m => m.marksheet_year && s.add(m.marksheet_year));
    return Array.from(s).sort().reverse();
  }, [marksheets]);
  
  const filtered = useMemo(() => {
    return marksheets.filter(m => {
      if (yearFilter !== 'all' && m.marksheet_year !== yearFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'approved' && m.is_approved !== 1) return false;
        if (statusFilter === 'pending' && m.is_approved !== 0 && m.is_approved !== null) return false;
        if (statusFilter === 'rejected' && m.is_approved !== -1) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return m.student_name?.toLowerCase().includes(q) ||
               m.standard?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [marksheets, search, yearFilter, statusFilter]);
  
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate({ to: '/dashboard' })} 
            className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Marksheets</h1>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Manage student marksheets' : 'My uploaded marksheets'}
            </p>
          </div>
        </div>
        
        {!isAdmin && (
          <Button onClick={() => setShowUploadDialog(true)}
            className="bg-[#A32328] hover:bg-[#8B1E22] text-white" size="sm">
            <Plus size={16} className="mr-1" />Upload
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search student or standard..." 
            value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            <button onClick={() => setYearFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                yearFilter === 'all' ? 'bg-[#A32328] text-white' : 'bg-gray-100'
              }`}>
              All Years
            </button>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  yearFilter === y ? 'bg-[#A32328] text-white' : 'bg-gray-100'
                }`}>
                {y}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium border-0 outline-none"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 mb-4">
            {marksheets.length === 0 ? 'No marksheets found' : 'No matches found'}
          </p>
          {!isAdmin && marksheets.length === 0 && (
            <Button onClick={() => setShowUploadDialog(true)}
              className="bg-[#A32328] hover:bg-[#8B1E22] text-white">
              <Plus size={16} className="mr-2" />Upload First Marksheet
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(m => (
            <MarksheetCard 
              key={m.marksheet_uuid} 
              marksheet={m} 
              isAdmin={isAdmin}
              onApprove={() => {
                if(confirm('Approve this marksheet?')) approveMutation.mutate(m.id);
              }}
              onReject={() => {
                const reason = prompt('Reason for rejection:');
                if(reason) rejectMutation.mutate({ uuid: m.marksheet_uuid, reason });
              }}
              onDelete={() => {
                if(confirm('Delete this marksheet?')) deleteMutation.mutate(m.id);
              }}
            />
          ))}
        </div>
      )}
      
      <UploadMarksheetDialog 
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          setShowUploadDialog(false);
          queryClient.invalidateQueries({ queryKey: ['marksheets'] });
        }}
      />
    </div>
  );
}

function MarksheetCard({ marksheet, isAdmin, onApprove, onReject, onDelete }: any) {
  const isApproved = marksheet.is_approved === 1;
  const isRejected = marksheet.is_approved === -1;
  const isPending = marksheet.is_approved === 0 || marksheet.is_approved === null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition relative">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{marksheet.student_name}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <GraduationCap size={12} /> Standard {marksheet.standard} {marksheet.stream ? `(${marksheet.stream})` : ''}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-black text-[#A32328]">{marksheet.percentage}%</span>
          {marksheet.student_rank > 0 && isApproved && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold mt-1 flex items-center gap-1">
              <Award size={10} /> Rank {marksheet.student_rank}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
        <div className="flex items-center gap-1">
          <BookOpen size={12} className="text-gray-400" /> {marksheet.medium} Medium
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" /> Year: {marksheet.marksheet_year}
        </div>
        <div className="col-span-2 mt-1">
          <strong>Father:</strong> {marksheet.father_full_name} ({marksheet.father_phone_number})
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          {isApproved && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"><Check size={12}/> Approved</span>}
          {isRejected && <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1"><X size={12}/> Rejected</span>}
          {isPending && <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1"><Clock size={12}/> Pending</span>}
        </div>

        <div className="flex items-center gap-2">
          {marksheet.marksheet_photo && (
            <a 
              href={marksheet.marksheet_photo} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline px-2"
            >
              View Document
            </a>
          )}
          
          {isAdmin && isPending && (
            <div className="flex gap-1">
              <button onClick={onApprove} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"><Check size={14}/></button>
              <button onClick={onReject} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><X size={14}/></button>
            </div>
          )}
          
          {(!isAdmin || isAdmin) && (
            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
              <Trash2 size={14}/>
            </button>
          )}
        </div>
      </div>
      
      {isRejected && marksheet.rejection_reason && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          <strong>Reason:</strong> {marksheet.rejection_reason}
        </div>
      )}
    </div>
  );
}
