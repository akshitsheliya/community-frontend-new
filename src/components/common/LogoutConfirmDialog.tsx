import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logout } from '@/lib/auth'

interface LogoutConfirmDialogProps {
  open: boolean
  onClose: () => void
}

export function LogoutConfirmDialog({ open, onClose }: LogoutConfirmDialogProps) {
  const handleConfirm = () => {
    onClose()
    logout()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-gray-900 border-gray-200 shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-center sm:text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#A32328] flex items-center justify-center mx-auto mb-3 border border-red-100">
            <LogOut size={26} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">Log Out</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-2">
            Are you sure you want to log out of your account? You will need to verify OTP to log in again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-3 mt-6 sm:justify-stretch">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1 h-11 bg-[#A32328] hover:bg-[#8B1E22] text-white font-semibold rounded-xl shadow-md"
          >
            Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
