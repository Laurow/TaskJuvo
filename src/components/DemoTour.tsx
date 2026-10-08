'use client';

import type { View } from '@/lib/data';
import { Badge, Icon } from './ui';
import './demo-tour.css';

const SCREENS: { view: View; name: string; stage: string; image: string; description: string; icon: string }[] = [
  { view: 'home', name: 'Homepage', stage: '01 · Discover', image: 'homepage', description: 'A clear introduction to the idea: start with a task, find the right talent, get it done.', icon: 'monitor' },
  { view: 'overzicht', name: 'Business overview', stage: '02 · Plan', image: 'overview', description: 'Projects, next steps and ready-to-use task examples in one calm workspace.', icon: 'dashboard' },
  { view: 'taak', name: 'Task wizard', stage: '03 · Define', image: 'task-wizard', description: 'Turn a business challenge into a clear outcome, scope, timeline and budget.', icon: 'file' },
  { view: 'matches', name: 'Curated matches', stage: '04 · Compare', image: 'matches', description: 'Three focused candidates. Relevant evidence, availability and honest points to discuss.', icon: 'users' },
  { view: 'profiel', name: 'Talent profile', stage: '05 · Understand', image: 'profile', description: 'Look beyond a CV. Explore project examples, skills and the meaning of verification.', icon: 'graduation' },
  { view: 'bevestiging', name: 'Project confirmation', stage: '06 · Agree', image: 'confirmation', description: 'See exactly who is doing the work, what they will deliver and when it is due.', icon: 'checklist' },
  { view: 'project', name: 'Project workspace', stage: '07 · Deliver', image: 'workspace', description: 'Follow milestones, review work and try project communication in the local demo.', icon: 'folder' },
  { view: 'talent', name: 'For talent', stage: '08 · Participate', image: 'talent', description: 'Paid, clearly defined projects that give students practical experience and proof of work.', icon: 'briefcase' },
  { view: 'feedback', name: 'Expert feedback', stage: '09 · Improve', image: 'feedback', description: 'Record observations, rate the experience and download feedback to share with the team.', icon: 'message' },
];

export function DemoTour({ onOpen }: { onOpen: (view: View) => void }) {
  return <div className="demo-tour">
    <div className="page-heading tour-heading"><div><span className="eyebrow">A closer look at TaskJuvo</span><h1>One idea. A complete experience.</h1><p>Explore every screen, or follow the journey from your first task to a finished project.</p></div><Badge variant="green"><Icon name="monitor" size={13} />9 interactive screens</Badge></div>
    <section className="tour-start"><div className="tour-start-icon"><Icon name="sparkles" size={25} /></div><div><h2>Start with a real business question.</h2><p>“We’re expanding into Germany. Can someone map our competitors?” Try the €300, 10-day example in the task wizard.</p></div><button className="button primary" onClick={() => onOpen('taak')}>Try the complete journey<Icon name="arrowRight" size={17} /></button></section>
    <div className="tour-grid">{SCREENS.map(screen => <article className="screen-card panel" key={screen.view}><button className="screen-preview" onClick={() => onOpen(screen.view)} aria-label={`Preview ${screen.name}`}><img src={`/previews/${screen.image}.jpg`} width={1440} height={960} alt="" loading="lazy" /><span className="screen-preview-overlay"><Icon name="arrowUpRight" size={24} /></span></button><div className="screen-card-content"><span className="eyebrow">{screen.stage}</span><h2><span><Icon name={screen.icon} size={17} /></span>{screen.name}</h2><p>{screen.description}</p><button className="text-button" onClick={() => onOpen(screen.view)} aria-label={`Open ${screen.name}`}>Open screen<Icon name="arrowRight" size={15} /></button></div></article>)}</div>
    <p className="tour-note"><Icon name="info" size={16} />All people, projects and scores are fictional. Your task and feedback stay in this browser.</p>
  </div>;
}
