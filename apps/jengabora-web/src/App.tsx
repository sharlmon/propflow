import { createApiClient } from '@propflow/api-client';
import { ecosystemFeatures } from '@propflow/config';
import type { PlatformHealth } from '@propflow/contracts';
import { Card, EmptyState, ErrorState, PageHeader, StatusBadge } from '@propflow/ui';
import { useQuery } from '@tanstack/react-query';
import { Building2, ClipboardCheck, HardHat, Menu, ReceiptText, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

const api = createApiClient();
const routes = [
  ['Dashboard', '/dashboard'],
  ['Projects', '/projects'],
  ['Reviews', '/reviews'],
  ['Payment releases', '/payment-releases'],
  ['Audit', '/audit'],
] as const;

function Shell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white p-4 lg:hidden">
        <Link to="/" className="font-bold text-[#07101F]">
          JengaBora
        </Link>
        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <aside
        className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-72 flex-col bg-[#0D1B33] p-5 text-white lg:sticky lg:flex lg:h-screen`}
      >
        <Link to="/" className="mb-8 flex items-center gap-3 text-xl font-bold">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-600">
            <HardHat aria-hidden="true" />
          </span>
          <span>
            JengaBora
            <small className="block text-[10px] font-medium uppercase tracking-wider text-blue-300">
              PropFlow ecosystem
            </small>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="JengaBora navigation">
          {routes.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <a
          className="rounded-xl px-4 py-3 text-sm font-medium text-blue-200 hover:bg-white/10"
          href="http://localhost:3000"
        >
          Back to ecosystem
        </a>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Landing() {
  const health = useQuery({ queryKey: ['platform-health'], queryFn: () => api<PlatformHealth>('/health') });
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Construction control"
        title="Milestones before money moves."
        description="JengaBora is the focused construction application for project records, proof of work, review decisions and an auditable payment-release ledger."
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <Building2 className="text-blue-600" />
          <h2 className="mt-5 text-xl font-bold text-[#07101F]">Projects</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Teams, milestones, values and due dates will share one project record.
          </p>
        </Card>
        <Card>
          <ClipboardCheck className="text-blue-600" />
          <h2 className="mt-5 text-xl font-bold text-[#07101F]">Evidence</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Versioned proof of work will be stored in the shared object store.
          </p>
        </Card>
        <Card>
          <ReceiptText className="text-blue-600" />
          <h2 className="mt-5 text-xl font-bold text-[#07101F]">Release ledger</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Approval controls precede sandbox payment-release accounting.
          </p>
        </Card>
      </div>
      {health.isError ? (
        <ErrorState message="The shared API is unavailable." onRetry={() => void health.refetch()} />
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[#07101F]">Shared platform connection</h2>
            <p className="mt-1 text-sm text-[#667085]">
              API identity, media and audit infrastructure will be shared across both applications.
            </p>
          </div>
          <StatusBadge tone={health.data ? 'blue' : 'slate'}>
            {health.data ? 'API connected' : 'Checking API'}
          </StatusBadge>
        </Card>
      )}
    </section>
  );
}

function FoundationRoute({ area, branch }: { area: string; branch: string }) {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Foundation route"
        title={area}
        description="This URL and application shell are ready. The database-backed workflow is deliberately disabled until its feature branch implements authorization, persistence, validation and tests."
      />
      <EmptyState
        title="Not presented as complete"
        description={`Implementation begins on ${branch}. No payment or approval action is active in the foundation branch.`}
      />
    </section>
  );
}

function Login() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Shared identity"
        title="Sign in through the platform"
        description="Both localhost applications use the same secure server-side session. Shared multi-role identity is completed on feat/shared-auth-rbac."
      />
      <Card>
        <a
          className="font-semibold text-blue-700"
          href="http://localhost:3000/login?return_to=http://localhost:3001/dashboard"
        >
          Continue to shared sign in
        </a>
      </Card>
    </section>
  );
}

function NotFound() {
  return (
    <section className="space-y-6">
      <PageHeader eyebrow="404" title="Page not found" />
      <Link className="font-semibold text-blue-700" to="/">
        Return to JengaBora
      </Link>
    </section>
  );
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/login', element: <Login /> },
      {
        path: '/dashboard',
        element: (
          <FoundationRoute area="Construction dashboard" branch="feat/jengabora-projects-milestones" />
        ),
      },
      {
        path: '/projects',
        element: <FoundationRoute area="Projects" branch="feat/jengabora-projects-milestones" />,
      },
      {
        path: '/projects/new',
        element: <FoundationRoute area="New project" branch="feat/jengabora-projects-milestones" />,
      },
      {
        path: '/projects/:projectId',
        element: <FoundationRoute area="Project workspace" branch="feat/jengabora-projects-milestones" />,
      },
      {
        path: '/projects/:projectId/milestones',
        element: <FoundationRoute area="Project milestones" branch="feat/jengabora-projects-milestones" />,
      },
      {
        path: '/milestones/:milestoneId',
        element: <FoundationRoute area="Milestone evidence" branch="feat/jengabora-proof-of-work" />,
      },
      {
        path: '/reviews',
        element: <FoundationRoute area="Supervisor reviews" branch="feat/jengabora-approval-workflow" />,
      },
      {
        path: '/payment-releases',
        element: (
          <FoundationRoute area="Payment-release ledger" branch="feat/jengabora-payment-release-ledger" />
        ),
      },
      {
        path: '/audit',
        element: <FoundationRoute area="Immutable audit history" branch="feat/jengabora-approval-workflow" />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  if (!ecosystemFeatures.jengaBoraFoundation) return <p>JengaBora is disabled.</p>;
  return <RouterProvider router={router} />;
}
