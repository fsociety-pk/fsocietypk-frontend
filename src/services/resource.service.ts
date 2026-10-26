import api from './api';
import { ApiResponse } from '../types';

export interface IResource {
  _id: string;
  title: string;
  description: string;
  githubLink: string;
  category: string;
  createdBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitResourcePayload {
  title: string;
  description: string;
  githubLink: string;
  category: string;
}

export const resourceService = {
  getAdminResources: async (status = 'pending'): Promise<ApiResponse<IResource[]>> => (await api.get('/admin/resources', { params: { status } })).data,
  /** Get all approved resources */
  getApprovedResources: async (): Promise<ApiResponse<IResource[]>> => {
    const response = await api.get<ApiResponse<IResource[]>>('/resources');
    return response.data;
  },

  /** Get resources by category */
  getResourcesByCategory: async (category: string): Promise<ApiResponse<IResource[]>> => {
    const response = await api.get<ApiResponse<IResource[]>>(`/resources/category/${category}`);
    return response.data;
  },

  /** Submit a new learning resource */
  submitResource: async (payload: SubmitResourcePayload): Promise<ApiResponse<IResource>> => {
    const response = await api.post<ApiResponse<IResource>>('/resources', payload);
    return response.data;
  },

  /** Get user's submitted resources */
  getMyResources: async (): Promise<ApiResponse<IResource[]>> => {
    const response = await api.get<ApiResponse<IResource[]>>('/resources/my-submissions');
    return response.data;
  },

  /** Get pending resources (admin only) */
  getPendingResources: async (): Promise<ApiResponse<IResource[]>> => {
    const response = await api.get<ApiResponse<IResource[]>>('/admin/resources/pending');
    return response.data;
  },

  /** Approve a resource (admin only) */
  approveResource: async (resourceId: string): Promise<ApiResponse<IResource>> => {
    const response = await api.patch<ApiResponse<IResource>>(`/admin/resources/${resourceId}/approve`);
    return response.data;
  },

  /** Delete a resource (admin only) */
  deleteResource: async (resourceId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete<ApiResponse<any>>(`/admin/resources/${resourceId}`);
    return response.data;
  },
};
