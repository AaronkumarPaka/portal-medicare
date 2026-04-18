import { useEffect, useMemo, useState } from 'react';
import { Agency, Provider } from '../types';
import { fetchAgencies, fetchProviders, deleteProvider } from '../services/api';
import ProviderForm from '../components/ProviderForm';

const skillOptions = ['Registered Nurse (RN)', 'Licensed Practical Nurse (LPN)', 'Physical Therapist (PT)', 'Physical Therapist Assistant (PTA)', 'Occupational Therapist (OT)', 'Occupational Therapist Assistant (OCTA)'];

function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [search, setSearch] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [skill, setSkill] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadProviders = () => {
    fetchProviders({ search, agencyId, skill, city, zip })
      .then(setProviders)
      .catch(console.error);
  };

  useEffect(() => {
    fetchAgencies().then(setAgencies).catch(console.error);
    loadProviders();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadProviders, 300);
    return () => clearTimeout(timeout);
  }, [search, agencyId, skill, city, zip]);

  const activeCount = useMemo(() => providers.filter((item) => item.status === 'ACTIVE').length, [providers]);
  const inactiveCount = useMemo(() => providers.length - activeCount, [providers, activeCount]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this provider?')) return;
    await deleteProvider(id);
    loadProviders();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Providers</p>
          <h2 className="text-3xl font-semibold">Manage your service providers</h2>
          <p className="mt-2 text-sm text-slate-600">Search providers, filter by agency, skills, location, and keep staff data up to date.</p>
        </div>
        <button
          type="button"
          className="rounded-2xl bg-brand-900 px-5 py-3 text-white shadow-sm hover:bg-brand-700"
          onClick={() => {
            setSelectedProvider(null);
            setIsFormOpen(true);
          }}
        >
          Add Provider
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold">{providers.length}</p>
        </div>
        <div className="rounded-3xl bg-emerald-500/10 p-5 text-emerald-900 shadow-sm">
          <p className="text-sm">Active</p>
          <p className="mt-2 text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-3xl bg-rose-500/10 p-5 text-rose-900 shadow-sm">
          <p className="text-sm">Inactive</p>
          <p className="mt-2 text-3xl font-bold">{inactiveCount}</p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          <select
            value={agencyId}
            onChange={(event) => setAgencyId(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All agencies</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
          <select
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All skills</option>
            {skillOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City / area"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            placeholder="Zip code"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead className="bg-slate-50 text-left text-sm uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Skills</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                    No providers found. Add your first provider to get started.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-slate-900">{provider.fullName}</div>
                      <div className="text-xs text-slate-500">{provider.email}</div>
                    </td>
                    <td className="px-6 py-4 align-top">{provider.agency.name}</td>
                    <td className="px-6 py-4 align-top">
                      {provider.skills.map((item) => item.skill).join(', ')}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {provider.areaCity} · {provider.zipCodes.map((item) => item.zipCode).join(', ')}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          provider.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <button
                        type="button"
                        className="mr-2 rounded-2xl border border-slate-200 px-3 py-1 text-sm text-brand-700 hover:bg-brand-50"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-rose-200 px-3 py-1 text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDelete(provider.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <ProviderForm
          providers={providers}
          agencies={agencies}
          provider={selectedProvider}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            loadProviders();
          }}
        />
      )}
    </div>
  );
}

export default Providers;
