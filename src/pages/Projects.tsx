import { useQuery } from '@tanstack/react-query';
import { Folder, ExternalLink, Github, Check } from 'lucide-react';
import { projectService } from '../services/projectService';
import PageHeading from '../components/common/PageHeading';
import PageState from '../components/common/PageState';
export default function Projects() {
  const {data: projects = [], isLoading, isError, refetch} = useQuery({queryKey: ['projects'], queryFn: projectService.getProjects});
  return <div className="page-wrap">
    <PageHeading eyebrow="Made by Fsociety PK" title="Our projects" description="Tools built by the community to help you learn and work on security." />
    {isLoading ? <PageState loading /> : isError ? <PageState title="Could not load projects" retry={()=>refetch()} /> : !projects.length ? <PageState title="No projects yet" description="Community projects will appear here." /> : <div className="project-grid">{projects.map(project=><article key={project._id} className="soft-panel project-card">
      <div className="flex justify-between items-center"><span className="feature-icon mb-0"><Folder size={23}/></span>{project.isComingSoon && <span className="status-pill">Coming soon</span>}</div>
      <h2>{project.title}</h2><p>{project.description}</p><div className="flex flex-wrap gap-2 mt-5">{project.techStack.map(tech=><span className="status-pill" key={tech}>{tech}</span>)}</div>
      {project.features && <ul>{project.features.map(feature=><li key={feature}><Check size={15}/>{feature}</li>)}</ul>}
      <footer>{project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="btn-primary">Open project <ExternalLink size={15}/></a>}{project.sourceCodeUrl && <a href={project.sourceCodeUrl} target="_blank" rel="noreferrer" className="btn-outline"><Github size={15}/> View code</a>}</footer>
    </article>)}</div>}
  </div>;
}
