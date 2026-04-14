import apiClient from './apiClient';

export interface Project {
  _id?: string;
  title: string;
  description: string;
  techStack: string[];
  websiteUrl?: string;
  sourceCodeUrl?: string;
  features?: string[];
  isComingSoon?: boolean;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    _id: '1',
    title: 'WebShield',
    description: 'An advanced vulnerability scanner leveraging four powerful Kali Linux tools (Nmap, Nikto, SQLMap, SSLScan). WebShield scans your website and provides a comprehensive, AI-generated security report.',
    techStack: ['Nmap', 'Nikto', 'SQLMap', 'SSLScan', 'AI Report'],
    websiteUrl: 'https://webshield.tech',
    features: ['Automated Scanning', 'AI-Driven Analysis', 'Comprehensive Reporting']
  },
  {
    _id: '2',
    title: 'WriteupForge',
    description: 'A powerful CLI and GUI tool designed for structuring raw security writeup notes. It uses AI to automatically format and organize chaotic notes into clean, structured documentation.',
    techStack: ['CLI', 'GUI', 'AI Structuring', 'Documentation'],
    sourceCodeUrl: 'https://github.com/fsociety-pk/writeupforge',
    features: ['Auto-formatting', 'Standardized Templates', 'Cross-Platform']
  }
];

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get('/projects');
      const dbProjects = response.data.data;
      return [...DEFAULT_PROJECTS, ...dbProjects];
    } catch (error) {
      console.error('Error fetching projects from backend', error);
      return [...DEFAULT_PROJECTS];
    }
  },

  addProject: async (project: Omit<Project, '_id'>): Promise<Project> => {
    const response = await apiClient.post('/projects', project);
    return response.data.data;
  },
  
  deleteProject: async (id: string): Promise<void> => {
    // Prevent deletion of hardcoded default projects
    if (id === '1' || id === '2') {
      throw new Error('Cannot delete system default projects.');
    }
    await apiClient.delete(`/projects/${id}`);
  }
};
