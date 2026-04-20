import axios from 'axios';
import { Agency, LicensePayload, Provider, ProviderCreatePayload } from '../types';

const localHosts = new Set(['localhost', '127.0.0.1']);
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && localHosts.has(window.location.hostname);
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()?.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (!isBrowser) {
    return 'http://localhost:4000/api';
  }

  if (isLocalHost) {
    return 'http://localhost:4000/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

const LOCAL_PROVIDERS_KEY = 'wonese-local-providers';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readLocalProviders = (): Provider[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PROVIDERS_KEY);
    return raw ? (JSON.parse(raw) as Provider[]) : [];
  } catch {
    return [];
  }
};

const writeLocalProviders = (providers: Provider[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_PROVIDERS_KEY, JSON.stringify(providers));
};

const buildLocalProvider = (payload: ProviderCreatePayload, id: number): Provider => ({
  id,
  fullName: payload.fullName,
  dateOfBirth: payload.dateOfBirth,
  gender: payload.gender,
  phone: payload.phone,
  email: payload.email,
  profileImage: payload.profileImage || null,
  street: payload.street,
  areaCity: payload.areaCity,
  notes: payload.notes || null,
  status: payload.status,
  agency: {
    id: payload.agencyId || id,
    name: payload.agencyName,
    providerCount: 0,
  },
  skills: payload.skills.map((skill) => ({ skill })),
  zipCodes: payload.zipCodes.map((zipCode) => ({ zipCode })),
  licenses: [
    {
      licenseType: payload.license.licenseType,
      licenseNumber: payload.license.licenseNumber,
      stateIssued: payload.license.stateIssued,
      expirationDate: payload.license.expirationDate,
    },
  ],
  documents: [],
});

const mergeProviders = (remoteProviders: Provider[]) => {
  const localProviders = readLocalProviders();
  const remoteIds = new Set(remoteProviders.map((provider) => provider.id));
  return [...remoteProviders, ...localProviders.filter((provider) => !remoteIds.has(provider.id))];
};

export const fetchAgencies = async (): Promise<Agency[]> => {
  const response = await api.get('/agencies');
  return response.data;
};

export const fetchProviders = async (params?: Record<string, string | number | boolean>) => {
  try {
    const response = await api.get<Provider[]>('/providers', { params });
    return mergeProviders(response.data);
  } catch {
    return readLocalProviders();
  }
};

export const createProvider = async (payload: ProviderCreatePayload) => {
  try {
    const response = await api.post('/providers', payload);
    return response.data;
  } catch {
    const localProvider = buildLocalProvider(payload, -Date.now());
    writeLocalProviders([localProvider, ...readLocalProviders()]);
    return localProvider;
  }
};

export const updateProvider = async (id: number, payload: ProviderCreatePayload) => {
  if (id < 0) {
    const updatedProvider = buildLocalProvider(payload, id);
    writeLocalProviders(readLocalProviders().map((provider) => (provider.id === id ? updatedProvider : provider)));
    return updatedProvider;
  }

  try {
    const response = await api.put(`/providers/${id}`, payload);
    return response.data;
  } catch (error) {
    const updatedProvider = buildLocalProvider(payload, id);
    const localProviders = readLocalProviders();
    const nextProviders = localProviders.some((provider) => provider.id === id)
      ? localProviders.map((provider) => (provider.id === id ? updatedProvider : provider))
      : [updatedProvider, ...localProviders];
    writeLocalProviders(nextProviders);
    return updatedProvider;
  }
};

export const deleteProvider = async (id: number) => {
  if (id < 0) {
    writeLocalProviders(readLocalProviders().filter((provider) => provider.id !== id));
    return;
  }

  try {
    await api.delete(`/providers/${id}`);
  } catch {
    writeLocalProviders(readLocalProviders().filter((provider) => provider.id !== id));
  }
};

export const uploadDocuments = async (providerId: number, files: File[], label: string) => {
  if (providerId < 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));
  formData.append('label', label);

  try {
    const response = await api.post(`/providers/${providerId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch {
    return [];
  }
};

export const deleteDocument = async (documentId: number) => {
  try {
    await api.delete(`/providers/documents/${documentId}`);
  } catch {
    return;
  }
};
