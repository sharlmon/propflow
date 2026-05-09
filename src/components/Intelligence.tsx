import type React from 'react';
import { AlertTriangle, Brain, LineChart, ShieldCheck } from 'lucide-react';
import { platformMetrics } from '../domains/analytics/metrics';
import { moderationQueue } from '../domains/admin/moderation';

export const Intelligence = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <section className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
            Investor Intelligence
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Market, trust, and monetization signals</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            This layer is the bridge from property management to an East African real estate intelligence
            network.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Readiness</p>
          <p className="mt-2 text-4xl font-black">{platformMetrics.monetizationReadiness}%</p>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <SignalCard icon={<LineChart />} label="Listings" value={platformMetrics.activeListings.toString()} />
      <SignalCard
        icon={<ShieldCheck />}
        label="Verified"
        value={platformMetrics.verifiedListings.toString()}
      />
      <SignalCard
        icon={<Brain />}
        label="Avg AI Score"
        value={platformMetrics.averageIntelligenceScore.toString()}
      />
      <SignalCard icon={<AlertTriangle />} label="Review Queue" value={moderationQueue.length.toString()} />
    </section>

    <section className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
      <h2 className="text-xl font-black text-slate-950">Moderation Queue</h2>
      <div className="mt-6 space-y-4">
        {moderationQueue.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-black text-slate-900">{item.title}</p>
              <p className="text-sm font-medium text-slate-500">{item.reason}</p>
            </div>
            <span className="rounded-2xl bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-700">
              Risk {item.risk}
            </span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const SignalCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
    <div className="mb-5 w-fit rounded-2xl bg-indigo-50 p-3 text-indigo-600">{icon}</div>
    <p className="text-3xl font-black text-slate-950">{value}</p>
    <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
  </div>
);
