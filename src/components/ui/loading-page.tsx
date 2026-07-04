import { Loader2 } from 'lucide-react';

export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-[#A3232815] border-t-[#A32328] rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}
