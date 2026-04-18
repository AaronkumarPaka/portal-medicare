import axios from 'axios';
import { Agency, LicensePayload, Provider, ProviderCreatePayload } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

export const fetchAgencies = async (): Promise<Agency[]> => {
  const response = await api.get('/agencies');
  return response.data;
};

export const fetchProviders = async (params?: Record<string, string | number | boolean>) => {
  const response = await api.get<Provider[]>('/providers', { params });
  return response.data;
};

export const createProvider = async (payload: ProviderCreatePayload) => {
  const response = await api.post('/providers', payload);
  return response.data;
};

export const updateProvider = async (id: number, payload: ProviderCreatePayload) => {
  const response = await api.put(`/providers/${id}`, payload);
  return response.data;
};

export const deleteProvider = async (id: number) => {
  await api.delete(`/providers/${id}`);
};

export const uploadDocuments = async (providerId: number, files: File[], label: string) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));
  formData.append('label', label);

  const response = await api.post(`/providers/${providerId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteDocument = async (documentId: number) => {
  await api.delete(`/providers/documents/${documentId}`);
};
