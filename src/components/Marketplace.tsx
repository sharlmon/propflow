import type React from 'react';
import { MapPin, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { MARKET_LISTINGS } from '../domains/listings/data';
import { calculatePropertyIntelligenceScore, getRecommendedListings } from '../domains/listings/intelligence';

export const Marketplace = () => {
  const recommendations = getRecommendedListings(MARKET_LISTINGS);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-2xl">
        <div className="grid min-h-[360px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
                Kenya Property Marketplace
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
                Verified homes, land, and yield assets with AI-backed decision signals.
              </h1>
              <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-3 text-slate-900 md:flex-row">
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent py-3 text-sm font-bold outline-none"
                    placeholder="Find 3-bedroom under 8M in Kilimani near schools"
                    aria-label="Search properties"
                  />
                </div>
                <button className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">
                  Search
                </button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <Metric label="Verified" value="67%" />
              <Metric label="Avg score" value="77" />
              <Metric label="Counties" value="3" />
            </div>
          </div>
          <img
            src={MARKET_LISTINGS[0].media.coverImage}
            alt="Verified Kilimani apartment"
            className="h-full min-h-[260px] w-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {MARKET_LISTINGS.map((listing) => (
          <article
            key={listing.id}
            className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm"
          >
            <img src={listing.media.coverImage} alt={listing.title} className="h-52 w-full object-cover" />
            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black leading-tight text-slate-950">{listing.title}</h2>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> {listing.neighborhood}, {listing.county}
                  </p>
                </div>
                <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  {calculatePropertyIntelligenceScore(listing)}
                </span>
              </div>
              <p className="text-sm font-medium leading-6 text-slate-600">{listing.ai.summary}</p>
              <div className="flex flex-wrap gap-2">
                {listing.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <p className="text-lg font-black text-slate-950">KSh {listing.priceKes.toLocaleString()}</p>
                <p className="flex items-center gap-1 text-xs font-black text-indigo-600">
                  <ShieldCheck className="h-4 w-4" /> {listing.verificationStatus.replace('_', ' ')}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecommendationPanel
          title="Similar Homes"
          icon={<Sparkles />}
          items={recommendations.similarHomes.map((item) => item.title)}
        />
        <RecommendationPanel
          title="Trending"
          icon={<TrendingUp />}
          items={recommendations.trendingProperties.map((item) => item.neighborhood)}
        />
        <RecommendationPanel
          title="Best Value"
          icon={<ShieldCheck />}
          items={recommendations.bestValueProperties.map((item) => item.title)}
        />
      </section>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
    <p className="text-2xl font-black">{value}</p>
    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</p>
  </div>
);

const RecommendationPanel = ({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) => (
  <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-3">
      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">{icon}</div>
      <h3 className="font-black text-slate-950">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.slice(0, 3).map((item) => (
        <p key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
          {item}
        </p>
      ))}
    </div>
  </div>
);
