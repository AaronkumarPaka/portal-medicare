import { useEffect, useMemo, useState } from 'react';
import { Agency, LicensePayload, Provider, ProviderCreatePayload } from '../types';
import { createProvider, updateProvider, uploadDocuments } from '../services/api';

const skillOptions = ['Registered Nurse (RN)', 'Licensed Practical Nurse (LPN)', 'Physical Therapist (PT)', 'Physical Therapist Assistant (PTA)', 'Occupational Therapist (OT)', 'Occupational Therapist Assistant (OCTA)'];
const documentLabels = [
  'LICENSE',
  'DRIVER_LICENSE',
  'SSN_CARD',
  'CERTIFICATES',
  'MEDICAL_CARD',
  'RESUME',
];

interface Props {
  agencies: Agency[];
  agenciesLoading: boolean;
  agenciesError: string | null;
  provider: Provider | null;
  providers: Provider[];
  onSaved: () => void;
  onClose: () => void;
}

function ProviderForm({ agencies, agenciesLoading, agenciesError, provider, onSaved, onClose }: Props) {
  const [form, setForm] = useState<ProviderCreatePayload>({
    fullName: '',
    dateOfBirth: '',
    gender: 'FEMALE',
    phone: '',
    email: '',
    profileImage: '',
    street: '',
    areaCity: '',
    notes: '',
    status: 'ACTIVE',
    agencyId: agencies[0]?.id || 0,
    agencyName: agencies[0]?.name || '',
    skills: [],
    zipCodes: [],
    license: {
      licenseType: '',
      licenseNumber: '',
      stateIssued: '',
      expirationDate: '',
    },
  });
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [documentLabel, setDocumentLabel] = useState(documentLabels[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider) {
      setForm({
        fullName: provider.fullName,
        dateOfBirth: provider.dateOfBirth.split('T')[0],
        gender: provider.gender,
        phone: provider.phone,
        email: provider.email,
        profileImage: provider.profileImage || '',
        street: provider.street,
        areaCity: provider.areaCity,
        notes: provider.notes || '',
        status: provider.status,
        agencyId: provider.agency.id,
        agencyName: provider.agency.name,
        skills: provider.skills.map((item) => item.skill),
        zipCodes: provider.zipCodes.map((item) => item.zipCode),
        license: {
          licenseType: provider.licenses[0]?.licenseType || '',
          licenseNumber: provider.licenses[0]?.licenseNumber || '',
          stateIssued: provider.licenses[0]?.stateIssued || '',
          expirationDate: provider.licenses[0]?.expirationDate.split('T')[0] || '',
        },
      });
    }
  }, [provider]);

  useEffect(() => {
    if (provider || agencies.length === 0) {
      return;
    }

    setForm((current) => {
      if (current.agencyId && agencies.some((agency) => agency.id === current.agencyId)) {
        return current;
      }

      return {
        ...current,
        agencyId: agencies[0].id,
        agencyName: agencies[0].name,
      };
    });
  }, [agencies, provider]);

  const subtitle = provider ? 'Edit provider details and documents' : 'Create a new provider record';
  const title = provider ? 'Edit Provider' : 'New Provider';

  const handleSave = async () => {
    if (!form.fullName || !form.dateOfBirth || !form.phone || !form.email || !form.agencyName) {
      alert('Please complete required fields.');
      return;
    }

    setLoading(true);
    try {
      if (provider) {
        await updateProvider(provider.id, form);
        if (documentFiles.length > 0) {
          await uploadDocuments(provider.id, documentFiles, documentLabel);
        }
      } else {
        const created = await createProvider(form);
        if (documentFiles.length > 0) {
          await uploadDocuments(created.id, documentFiles, documentLabel);
        }
      }
      onSaved();
    } catch (error) {
      console.error(error);
      alert('Unable to save provider.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };

  const zipString = useMemo(() => form.zipCodes.join(', '), [form.zipCodes]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Full Name
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Date of Birth
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-700">
              Gender
              <select
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value as 'MALE' | 'FEMALE' })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Agency
              <select
                value={form.agencyName}
                onChange={(event) => {
                  const selectedAgency = agencies.find((agency) => agency.name === event.target.value);
                  setForm({
                    ...form,
                    agencyId: selectedAgency?.id || 0,
                    agencyName: event.target.value,
                  });
                }}
                disabled={agencies.length === 0}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              >
                {agencies.length === 0 ? (
                  <option value="">Loading agencies...</option>
                ) : (
                  agencies.map((agency) => (
                    <option key={agency.name} value={agency.name}>
                      {agency.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Street Address
              <input
                value={form.street}
                onChange={(event) => setForm({ ...form, street: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Area / City
              <input
                value={form.areaCity}
                onChange={(event) => setForm({ ...form, areaCity: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Skills
            <div className="grid gap-2 sm:grid-cols-3">
              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-2xl border px-3 py-2 text-sm ${
                    form.skills.includes(skill)
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-500'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Covered Zip Codes
            <input
              value={zipString}
              onChange={(event) =>
                setForm({
                  ...form,
                  zipCodes: event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. 11211, 11221"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              License Type
              <input
                value={form.license.licenseType}
                onChange={(event) => setForm({ ...form, license: { ...form.license, licenseType: event.target.value } })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              License Number
              <input
                value={form.license.licenseNumber}
                onChange={(event) => setForm({ ...form, license: { ...form.license, licenseNumber: event.target.value } })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              State Issued
              <input
                value={form.license.stateIssued}
                onChange={(event) => setForm({ ...form, license: { ...form.license, stateIssued: event.target.value } })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Expiration Date
              <input
                type="date"
                value={form.license.expirationDate}
                onChange={(event) => setForm({ ...form, license: { ...form.license, expirationDate: event.target.value } })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Remarks
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Upload documents
              <input
                type="file"
                multiple
                onChange={(event) => setDocumentFiles(Array.from(event.target.files || []))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Document label
              <select
                value={documentLabel}
                onChange={(event) => setDocumentLabel(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              >
                {documentLabels.map((label) => (
                  <option key={label} value={label}>
                    {label.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? 'Saving...' : provider ? 'Update Provider' : 'Create Provider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderForm;
