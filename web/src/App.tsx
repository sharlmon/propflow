import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
});

function FoundationPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">FindYourKeja</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Powered by PropFlow</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          The full-stack marketplace and property-operations MVP foundation is ready. Product routes are added as
          their database-backed vertical slices are completed.
        </p>
      </div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-700">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <Link className="mt-6 inline-block font-semibold text-blue-700 underline" to="/">
          Return home
        </Link>
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <FoundationPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
