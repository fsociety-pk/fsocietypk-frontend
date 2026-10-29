import axios from 'axios';
import apiClient from './apiClient';
import { API_BASE_URL } from './apiConfig';
import type { TeamProfileData } from '../data/team';

export interface TeamCertificateInput {
  title: string; eventDate: string; placement: string; description: string;
  eventUrl: string; isPublished: boolean;
}
export interface TeamCertificate extends TeamCertificateInput {
  id: string; version: number;
  certificate: { name: string; contentType: string; size: number };
}
export type PublicTeamCertificate = Omit<TeamCertificate, 'version' | 'isPublished'>;
export interface TeamCertificatePage<T = PublicTeamCertificate> {
  certificates: T[]; years: number[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export type AdminTeamProfile = TeamProfileData & { version: number };
const publicApi = axios.create({ baseURL: API_BASE_URL, timeout: 15000, withCredentials: false });
export const teamService = {
  getProfile: async (): Promise<TeamProfileData> => (await publicApi.get('/team')).data.data,
  listCertificates: async (page = 1, year = ''): Promise<TeamCertificatePage> => (await publicApi.get('/team/certificates', { params: { page, ...(year && { year }) } })).data.data,
  fileUrl: (id: string, admin = false, download = false) => `${API_BASE_URL}/${admin ? 'admin/team' : 'team'}/certificates/${encodeURIComponent(id)}/file${download ? '?download=1' : ''}`,
  getAdminProfile: async (): Promise<AdminTeamProfile> => (await apiClient.get('/admin/team')).data.data,
  saveProfile: async (profile: AdminTeamProfile): Promise<AdminTeamProfile> => (await apiClient.put('/admin/team', profile)).data.data,
  listAdminCertificates: async (page = 1, status = 'all'): Promise<TeamCertificatePage<TeamCertificate>> => (await apiClient.get('/admin/team/certificates', { params: { page, status } })).data.data,
  saveCertificate: async ({ id, version, details, file }: { id?: string; version?: number; details: TeamCertificateInput; file?: File }): Promise<TeamCertificate> => {
    const form = new FormData();
    form.append('data', JSON.stringify({ ...details, ...(id && { version }) }));
    if (file) form.append('certificate', file);
    const config = { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 };
    const result = id ? await apiClient.patch(`/admin/team/certificates/${id}`, form, config) : await apiClient.post('/admin/team/certificates', form, config);
    return result.data.data;
  },
  deleteCertificate: async (record: TeamCertificate): Promise<void> => { await apiClient.delete(`/admin/team/certificates/${record.id}`, { params: { version: record.version } }); },
};
