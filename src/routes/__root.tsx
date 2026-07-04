import { Outlet, createRootRoute } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { queryClient } from '../lib/queryClient';
import { Toaster } from '@/components/ui/sonner';

import '../styles.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        }}
      />
      {/* Devtools */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </QueryClientProvider>
  );
}
