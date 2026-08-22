import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { globalAdminApi } from '@/lib/global-admin-api';
import { toast } from 'sonner';

export function AdminChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch (e) {
      return {};
    }
  }, []);

  const isGlobalAdmin = localStorage.getItem('is_global_admin') === 'true';

  const fetchMessages = React.useCallback(async () => {
    try {
      const res = await globalAdminApi.getChatMessages(userData.phone_number || '9999900001');
      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (e) {}
  }, [userData.phone_number]);

  React.useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      const res = await globalAdminApi.sendChatMessage({
        phone_number: userData.phone_number || '9999900001',
        sender_name: isGlobalAdmin
          ? 'Rajesh Patel (Admin)'
          : `${userData.first_name || 'Member'} ${userData.surname || ''}`,
        message: inputText.trim(),
        is_from_admin: isGlobalAdmin,
      });

      if (res.success) {
        setInputText('');
        fetchMessages();
      }
    } catch (e: any) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Direct Chat with Global Admin Rajesh Patel"
        className="relative p-2 text-gray-600 hover:text-theme hover:bg-red-50 rounded-xl transition flex items-center gap-1 font-medium text-xs border border-gray-200 bg-white shadow-sm"
      >
        <MessageSquare size={18} className="text-theme" />
        <span className="hidden sm:inline">Admin Chat</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-white p-5 rounded-3xl border text-gray-900 shadow-2xl flex flex-col h-[500px]">
          <DialogHeader className="border-b pb-3 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-theme/10 text-theme flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isGlobalAdmin ? 'Admin Support Desk' : 'Chat with Admin (Rajesh Patel)'}
              </DialogTitle>
              <p className="text-xs text-gray-500">Direct message channel with Global Admin</p>
            </div>
          </DialogHeader>

          {/* Messages display */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-12">
                No messages yet. Ask a question or send a note to Global Admin.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${
                    msg.is_from_admin ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.is_from_admin
                        ? 'bg-theme/10 text-theme-hover border border-theme/20 rounded-tl-none'
                        : 'bg-theme text-white rounded-tr-none'
                    }`}
                  >
                    <span className="block font-bold text-[10px] opacity-80 mb-0.5">
                      {msg.sender_name}
                    </span>
                    {msg.message}
                    <span className="block text-[9px] opacity-60 text-right mt-1">
                      {msg.created_at}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="pt-2 border-t flex gap-2">
            <Input
              placeholder="Type message to Global Admin..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-10 text-xs flex-1 rounded-xl"
            />
            <Button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="h-10 px-4 bg-theme hover:bg-theme-hover text-white rounded-xl"
            >
              <Send size={16} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
