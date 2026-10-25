import { ReactNode } from 'react';
export default function PageHeading({ title, description, eyebrow, children }: { title: string; description?: string; eyebrow?: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}
