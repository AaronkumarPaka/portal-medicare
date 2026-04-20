import { useEffect, useState } from 'react';
import { fetchProviders } from '../services/api';
import { Agency, Provider } from '../types';
import { defaultAgencies } from '../constants/agencies';

function Dashboard() {
  const [agencies, setAgencies] = useState<Agency[]>(defaultAgencies);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetchProviders()
      .then((result) => {
        setProviders(result);
        setAgencies(
          defaultAgencies.map((agency) => ({
            ...agency,
            providerCount: result.filter((provider) => provider.agency.name === agency.name).length,
          })),
        );
      })
      .catch(console.error);
  }, []);

  const activeCount = providers.filter((provider) => provider.status === 'ACTIVE').length;
  const inactiveCount = providers.length - activeCount;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-slate-500">Overview</p>
            <h2 className="mt-2 text-3xl font-semibold">Provider Operations</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-900 px-5 py-4 text-white shadow-sm">
              <p className="text-sm text-slate-200">Total Providers</p>
              <p className="mt-2 text-3xl font-bold">{providers.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-emerald-900">
              <p className="text-sm">Active</p>
              <p className="mt-2 text-3xl font-bold">{activeCount}</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 px-5 py-4 text-rose-900">
              <p className="text-sm">Inactive</p>
              <p className="mt-2 text-3xl font-bold">{inactiveCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agencies.map((agency) => (
          <div key={agency.id} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Agency</p>
            <h3 className="mt-2 text-xl font-semibold text-brand-900">{agency.name}</h3>
            <p className="mt-4 text-4xl font-bold">{agency.providerCount}</p>
          </div>
        ))}
      </section>

    </div>
  );
}

export default Dashboard;
