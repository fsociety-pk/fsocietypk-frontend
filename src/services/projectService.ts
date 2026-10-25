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
    description: 'Check your website with Nmap, Nikto, SQLMap, and SSLScan. WebShield brings the results together in a security report.',
    techStack: ['Nmap', 'Nikto', 'SQLMap', 'SSLScan', 'AI Report'],
    websiteUrl: 'https://webshield.tech',
    features: ['Automated Scanning', 'AI-Driven Analysis', 'Comprehensive Reporting']
  },
  {
    _id: '2',
    title: 'WriteupForge',
    description: 'Turn your security notes into a clear writeup. Use the command line or desktop app to format and organize your work.',
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
