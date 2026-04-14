export interface Project {
  id: string;
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
    id: '1',
    title: 'WebShield',
    description: 'An advanced vulnerability scanner leveraging four powerful Kali Linux tools (Nmap, Nikto, SQLMap, SSLScan). WebShield scans your website and provides a comprehensive, AI-generated security report.',
    techStack: ['Nmap', 'Nikto', 'SQLMap', 'SSLScan', 'AI Report'],
    websiteUrl: 'https://webshield.tech',
    features: ['Automated Scanning', 'AI-Driven Analysis', 'Comprehensive Reporting']
  },
  {
    id: '2',
    title: 'WriteupForge',
    description: 'A powerful CLI and GUI tool designed for structuring raw security writeup notes. It uses AI to automatically format and organize chaotic notes into clean, structured documentation.',
    techStack: ['CLI', 'GUI', 'AI Structuring', 'Documentation'],
    sourceCodeUrl: 'https://github.com/fsociety-pk/writeupforge',
    features: ['Auto-formatting', 'Standardized Templates', 'Cross-Platform']
  }
];

export const projectService = {
  getProjects: (): Project[] => {
    try {
      const stored = localStorage.getItem('fsocietypk_projects');
      if (stored) {
        return [...DEFAULT_PROJECTS, ...JSON.parse(stored)];
      }
    } catch (error) {
      console.error('Error parsing projects', error);
    }
    return [...DEFAULT_PROJECTS];
  },

  getAllProjects: (): Project[] => {
    return projectService.getProjects();
  },

  addProject: (project: Omit<Project, 'id'>): Project => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    
    try {
      const stored = localStorage.getItem('fsocietypk_projects');
      let customProjects: Project[] = [];
      if (stored) {
        customProjects = JSON.parse(stored);
      }
      customProjects.push(newProject);
      localStorage.setItem('fsocietypk_projects', JSON.stringify(customProjects));
    } catch (error) {
      console.error('Error saving project', error);
    }
    
    return newProject;
  },
  
  deleteProject: (id: string): void => {
    // We only allow deleting custom projects for now
    try {
      const stored = localStorage.getItem('fsocietypk_projects');
      if (stored) {
        let customProjects: Project[] = JSON.parse(stored);
        customProjects = customProjects.filter(p => p.id !== id);
        localStorage.setItem('fsocietypk_projects', JSON.stringify(customProjects));
      }
    } catch (error) {
      console.error('Error deleting project', error);
    }
  }
};
