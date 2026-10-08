'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_TASK, DEMO_TASK, DATA_TASK, STUDENTS, TASK_TEMPLATES, euro, formatDate, daysFromNow, getMatches, type Student, type TaskDraft, type View } from '@/lib/data';
import { Avatar, Badge, Icon, Modal } from './ui';
import TaskWizard from './TaskWizard';
import { Matches, StudentProfile } from './Matches';
import { ProjectConfirmation, ProjectWorkspace } from './ProjectWorkspace';
import { DemoTour } from './DemoTour';

const TITLES: Record<View, string> = { home: 'Welcome', overzicht: 'Overview', taak: 'Post a task', matches: 'Your matches', profiel: 'Talent profile', bevestiging: 'Confirm project', project: 'Project workspace', talent: 'For talent', feedback: 'Expert feedback', screens: 'Screen overview' };
const VIEWS = Object.keys(TITLES) as View[];
const ROUTES: Record<View, string> = { home: 'home', overzicht: 'overview', taak: 'post-a-task', matches: 'matches', profiel: 'profile', bevestiging: 'confirm-project', project: 'workspace', talent: 'for-talent', feedback: 'feedback', screens: 'screens' };
const STORAGE = 'taskjuvo-prototype-v2';

type FeedbackEntry = { id: string; section: string; role: string; clarity: string; trust: string; ease: string; comment: string; date: string };

function Brand({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="brand" aria-label="TaskJuvo homepage"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 8h18M16 8v18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="m6 19 4 4 7-7" stroke="#eaaa80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>TaskJuvo<span style={{ color: 'var(--orange)' }}>.</span></button>;
}

function Landing({ navigate, startDemo }: { navigate: (view: View) => void; startDemo: () => void }) {
  return <div className="landing">
    <header className="landing-nav"><Brand onClick={() => navigate('home')} /><nav className="landing-links" aria-label="Main navigation"><a href="#home" aria-current="page">For businesses</a><a href="#for-talent">For talent</a><a href="#how-it-works">How it works</a></nav><div className="landing-actions"><button className="button ghost" onClick={startDemo}>Explore the demo</button><button className="button primary" onClick={() => navigate('taak')}>Post a task<Icon name="arrowRight" size={16} /></button></div></header>
    <main id="main-content" tabIndex={-1}>
      <section className="landing-hero" aria-labelledby="hero-title"><div className="hero-copy"><div className="hero-kicker"><span />For small teams with big plans</div><h1 id="hero-title">Get the task done.<br /><em>Without hiring<br />full-time.</em></h1><p>Your business has a task. We connect you with student talent who can deliver it. A clear outcome, an agreed scope and room to keep growing.</p><div className="hero-actions"><button className="button primary" onClick={() => navigate('taak')}>Post your first task<Icon name="arrowRight" size={17} /></button><button className="button secondary" onClick={startDemo}><Icon name="monitor" size={16} />Explore the demo</button></div><div className="hero-footnote"><Icon name="check" size={14} />Clear expectations. A shorter path to the right talent.</div></div>
        <div className="hero-visual" aria-label="Example task with three fictional talent matches"><div className="hero-task"><div className="hero-card-top"><div className="hero-company"><span className="company-monogram">CS</span><div><strong>Canal Studio</strong><small>Utrecht · Small business</small></div></div><Badge variant="orange">Example task</Badge></div><h2>A new market.<br />A clear plan.</h2><p>A competitor analysis for our next move into Germany.</p><div className="chips"><span className="chip">Market research</span><span className="chip">Excel</span><span className="chip">PowerPoint</span></div><div className="hero-metrics"><div><span>Fixed budget</span><strong>€300</strong></div><div><span>Delivery</span><strong>10 days</strong></div><div><span>Work arrangement</span><strong>Remote</strong></div></div><div className="hero-matches"><div className="hero-matches-top"><p>Talent matched to your task</p><Icon name="sparkle" size={15} /></div>{STUDENTS.slice(0, 3).map(student => <div className="hero-student" key={student.id}><div className="hero-student-name"><Avatar student={student} size="sm" /><div><strong>{student.name}</strong><small>{student.role}</small></div></div><span className="hero-student-score">{student.score}% match</span></div>)}</div></div><div className="hero-match-notice"><span><Icon name="shield" size={18} /></span><div><strong>The right talent. Skills you can see.</strong><small>3 fictional matches to explore the experience</small></div></div></div>
      </section>
      <section className="landing-trust" aria-label="What TaskJuvo offers"><div><Icon name="shield" size={18} />Evidence of skills</div><div><Icon name="target" size={18} />Your task comes first</div><div><Icon name="checklist" size={18} />A clearly defined scope</div><div><Icon name="handshake" size={18} />Support throughout your project</div></section>
      <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="section-heading"><div><span className="eyebrow">From a need to an outcome</span><h2 id="how-title">Less searching. More progress.</h2></div><p>A focused shortlist and a clear path to someone who can move your task forward.</p></div><div className="how-grid">{[{ title: 'Describe your task', text: 'What do you need done? Define the outcome, timeline and budget in a few simple steps.' }, { title: 'Meet the right talent', text: 'Compare three focused matches. Explore their work, skills and availability.' }, { title: 'Work towards a clear outcome', text: 'Agree on milestones and keep everything together in one clear project workspace.' }].map((step, i) => <div className="how-step" key={step.title}><div className="how-step-number">0{i + 1}</div><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}</div></section>
      <section className="landing-bottom"><div><h2>A task on your list. Talent on your side.</h2><p>See how TaskJuvo can help your team take its next step.</p></div><button className="button primary" onClick={() => navigate('taak')}>Describe your task<Icon name="arrowRight" size={17} /></button></section>
    </main><footer className="landing-footer"><Brand onClick={() => navigate('home')} /><p>Interactive prototype · All people, projects and scores are fictional.</p><button className="text-button" onClick={() => navigate('feedback')}>Share expert feedback<Icon name="arrowRight" size={14} /></button></footer>
  </div>;
}

function Dashboard({ draft, confirmed, student, navigate, useDemo, startTemplate }: { draft: TaskDraft; confirmed: boolean; student: Student; navigate: (view: View) => void; useDemo: (view: View) => void; startTemplate: (index: number) => void }) {
  const task = draft.title ? draft : DEMO_TASK;
  const matches = getMatches(task);
  const openCurrentTask = () => draft.title ? navigate(confirmed ? 'project' : 'matches') : useDemo('matches');
  return <><div className="dashboard-heading"><div><span className="eyebrow">Your workspace</span><h1>Hi Alex, ready for your next move?</h1><p>Your tasks, talent and progress, clearly in view.</p></div><span className="date">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(new Date())}</span></div>
    <section className="dashboard-banner"><div><span className="eyebrow">From idea to action</span><h2>What would you like done today?</h2><p>Describe your task. We help you find the right talent and a clear way forward.</p></div><button className="button primary" onClick={() => navigate('taak')}><Icon name="plus" size={16} />Post a new task</button></section>
    <div className="stat-grid"><div className="panel stat"><div className="stat-label">{confirmed ? 'Active projects' : 'Open tasks'}<Icon name="briefcase" size={17} /></div><strong>2</strong><small>{confirmed ? 'With clear milestones' : '1 in progress · 1 with matches'}</small></div><div className="panel stat"><div className="stat-label">Matching talent<Icon name="users" size={17} /></div><strong>3</strong><small><span className="green-text">Ready to explore</span></small></div><div className="panel stat"><div className="stat-label">Total project budget<Icon name="wallet" size={17} /></div><strong>{euro(Number(task.budget) + 600)}</strong><small>Example amounts · No payments</small></div></div>
    <div className="dashboard-grid"><div><div className="dashboard-section-head"><h2>Your projects <span className="badge badge-neutral">2</span></h2><button className="text-button" onClick={() => navigate('taak')}>New task<Icon name="plus" size={13} /></button></div>
      <article className="panel dashboard-project"><div className="dashboard-project-body"><div className="project-category"><Icon name="search" size={14} />{task.category}</div><div className="dashboard-project-title"><h3>{task.title}</h3><Badge variant={confirmed ? 'green' : 'orange'}>{confirmed ? 'In progress' : '3 matches ready'}</Badge></div><p>{task.description}</p><div className="dashboard-project-details"><span><strong>{euro(task.budget)}</strong>fixed budget</span><span><Icon name="calendar" size={13} />{formatDate(task.deadline)}</span><span><Icon name="location" size={13} />{task.arrangement}</span></div></div><div className="dashboard-project-footer"><div className="avatar-stack">{(confirmed ? [student] : matches).map(match => <Avatar key={match.id} student={match} size="sm" />)}<span>{confirmed ? student.name : 'Matching talent'}</span></div><button className="text-button" onClick={openCurrentTask}>{confirmed ? 'Open workspace' : 'View matches'}<Icon name="arrowRight" size={15} /></button></div></article>
      <article className="panel dashboard-project"><div className="dashboard-project-body"><div className="project-category"><Icon name="chart" size={14} />Data & analytics · Example project</div><div className="dashboard-project-title"><h3>Customer insights in one dashboard</h3><Badge variant="green">In progress</Badge></div><p>Our customer data turned into a clear Power BI dashboard, with a practical handover guide.</p><div className="dashboard-project-details"><span><strong>€600</strong>fixed budget</span><span><Icon name="calendar" size={13} />{formatDate(daysFromNow(21))}</span><span><Icon name="location" size={13} />Remote</span></div><div className="progress-strip"><div className="progress-track"><span /></div><span>2 of 4 milestones</span></div></div><div className="dashboard-project-footer"><div className="assigned-talent"><Avatar student={STUDENTS[1]} size="sm" /><span>Lucas van Dijk</span><Icon name="shield" size={13} /></div><button className="text-button" onClick={() => useDemo('project')}>Explore sample workspace<Icon name="arrowRight" size={15} /></button></div></article>
      <div className="dashboard-section-head templates-heading"><h2>Start with a template</h2><span className="muted" style={{ fontSize: 11 }}>Make it your own</span></div><div className="template-grid">{TASK_TEMPLATES.slice(0, 3).map((template, index) => <button className="panel template-card" key={template.title} onClick={() => startTemplate(index)}><span className="template-icon"><Icon name={template.icon} size={17} /></span><div><h3>{template.title}</h3><p>{template.description}</p></div><footer><span>{euro(template.budget)} · {template.duration}</span><Icon name="arrowUpRight" size={15} /></footer></button>)}</div>
    </div><aside className="dashboard-aside"><section className="panel next-steps"><h2><Icon name="calendar" size={16} />Next steps</h2><div className="timeline-item"><small>Your next step</small><h3>{confirmed ? 'Keep your project moving' : 'Explore your talent matches'}</h3><p>{confirmed ? `Review the next deliverable with ${student.name.split(' ')[0]}.` : 'Three candidates with relevant skills.'}</p><button className="text-button" onClick={openCurrentTask}>{confirmed ? 'Open your workspace' : 'View your shortlist'}<Icon name="arrowRight" size={13} /></button></div><div className="timeline-item"><small>After your selection</small><h3>Define the scope</h3><p>Agree on outcomes and milestones with your talent.</p></div><div className="timeline-item"><small>During your project</small><h3>Stay in the loop</h3><p>Progress, messages and deliverables in one place.</p></div></section><section className="help-card"><Icon name="handshake" size={24} /><h3>A little support goes a long way.</h3><p>A clear task and good communication make a difference. Explore the support in the sample workspace.</p><button className="text-button" onClick={() => useDemo('project')}>Explore the workspace<Icon name="arrowRight" size={13} /></button></section></aside></div>
  </>;
}

function Talent({ navigate }: { navigate: (view: View) => void }) {
  const [opportunity, setOpportunity] = useState<number | null>(null);
  const [interest, setInterest] = useState(false);
  return <><section className="talent-hero"><div><span className="eyebrow">For talent</span><h1>Turn your skills<br />into real experience.</h1><p>Work on paid, clearly scoped business tasks that fit your skills and your studies. Show what you can do with work that matters.</p><button className="button primary" onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}>Explore sample tasks<Icon name="arrowRight" size={17} /></button></div><div className="talent-benefits">{[['wallet', 'A clear project budget'], ['calendar', 'Flexible around your studies'], ['target', 'Real tasks, tangible outcomes'], ['shield', 'Build a portfolio that shows your skills']].map(([icon, text]) => <div key={text}><span><Icon name={icon} size={17} /></span>{text}</div>)}</div></section><div className="section-heading" id="opportunities"><div><span className="eyebrow">A glimpse of the opportunities</span><h2>Work that moves you forward.</h2></div><p>Fictional sample tasks. See what an opportunity could look like.</p></div><div className="opportunities-grid">{TASK_TEMPLATES.map((template, index) => <article className="panel opportunity-card" key={template.title}><Badge>{template.category}</Badge><h3>{template.title}</h3><p>{template.description}</p><div className="opportunity-meta"><strong>{euro(template.budget)}</strong><span>{template.duration}</span><span>Remote</span></div><Badge variant="green"><Icon name="check" size={12} />Clearly scoped</Badge><button className="button secondary" onClick={() => { setOpportunity(index); setInterest(false); }}>View sample task<Icon name="arrowRight" size={15} /></button></article>)}</div><Modal open={opportunity !== null} title={opportunity !== null ? TASK_TEMPLATES[opportunity].title : 'Example task'} onClose={() => setOpportunity(null)}>{opportunity !== null && <><p className="muted">{TASK_TEMPLATES[opportunity].description}</p><div className="opportunity-meta"><strong>{euro(TASK_TEMPLATES[opportunity].budget)}</strong><span>{TASK_TEMPLATES[opportunity].duration}</span><span>Remote</span></div><h3>What will you deliver?</h3><ul><li>A well-supported outcome with clear sources.</li><li>A concise handover the business can put to use.</li><li>A progress update at an agreed point in the project.</li></ul><p className="notice">This is a sample task. Showing interest does not submit an application.</p>{interest ? <p className="feedback-saved" role="status" style={{ marginTop: 20 }}>Your interest is shown in this demo. Nothing has been sent.</p> : <button className="button primary" onClick={() => setInterest(true)}>Show interest in this demo<Icon name="arrowRight" size={16} /></button>}<button className="button ghost" onClick={() => { setOpportunity(null); navigate('feedback'); }}>Give feedback on the talent experience</button></>}</Modal></>;
}

function Feedback({ entries, onSave, context }: { entries: FeedbackEntry[]; onSave: (entry: FeedbackEntry) => void; context: string }) {
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [section, setSection] = useState(context);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const comment = (data.get('comment') as string).trim();
    if (comment.length < 5) {
      const field = event.currentTarget.querySelector<HTMLTextAreaElement>('#feedback-comment');
      field?.setCustomValidity('Describe your observation using at least 5 characters.');
      field?.reportValidity();
      return;
    }
    onSave({ id: crypto.randomUUID(), section: data.get('section') as string, role: data.get('role') as string, clarity: data.get('clarity') as string, trust: data.get('trust') as string, ease: data.get('ease') as string, comment: (data.get('comment') as string).trim(), date: new Date().toISOString() });
    setSaved(true);
    formRef.current?.reset();
  }
  function download() {
    const text = '# TaskJuvo — Expert feedback\n\n' + entries.map((entry, i) => `## Observation ${i + 1}: ${entry.section}\n\nPerspective: ${entry.role || 'Not provided'}\nClarity: ${entry.clarity}/5 · Evidence: ${entry.trust}/5 · Ease of use: ${entry.ease}/5\n\n${entry.comment}\n\nRecorded: ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam' }).format(new Date(entry.date))}\n`).join('\n---\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'taskjuvo-expert-feedback.md'; a.click(); URL.revokeObjectURL(url);
  }
  return <><div className="page-heading"><span className="eyebrow">Help shape a better experience</span><h1>Your perspective makes a difference.</h1><p>Review the experience, evidence and clarity. Your feedback stays in this browser and can be downloaded to share.</p></div><div className="feedback-grid"><form ref={formRef} className="panel feedback-form" onSubmit={submit}><h2>Record an observation</h2>{saved && <div className="feedback-saved" role="status">Feedback saved locally. Add another observation or download all your feedback.</div>}<div className="field"><label htmlFor="feedback-section">Which part are you reviewing?</label><select id="feedback-section" name="section" className="input" value={section} onChange={e => setSection(e.target.value)}>{['Overall experience', 'Homepage', 'Overview', 'Post a task', 'Your matches', 'Talent profile', 'Confirm project', 'Project workspace', 'For talent', 'Screen overview'].map(value => <option key={value}>{value}</option>)}</select></div><div className="field"><label htmlFor="feedback-role">What is your perspective? <span className="muted">(optional)</span></label><select id="feedback-role" name="role" className="input"><option value="">Select a perspective</option><option>Business owner / SME</option><option>Student / talent</option><option>UX / accessibility</option><option>Coach / business expert</option></select></div>{[{ key: 'clarity', label: 'How clear is this part?' }, { key: 'trust', label: 'How convincing is the evidence?' }, { key: 'ease', label: 'How easy is the next step?' }].map(question => <fieldset className="feedback-rating" key={question.key}><legend>{question.label}</legend><div className="rating-options">{[1, 2, 3, 4, 5].map(value => <label key={value}><input type="radio" name={question.key} value={value} required aria-label={`${value} out of 5`} />{value}</label>)}</div><div className="rating-caption"><span>1 · Not at all</span><span>5 · Very much</span></div></fieldset>)}<div className="field"><label htmlFor="feedback-comment">What did you notice, and what would you improve?</label><textarea id="feedback-comment" name="comment" onChange={event => event.currentTarget.setCustomValidity('')} className="textarea" placeholder="For example: I understand the score, but I would like to see the work sample first…" required minLength={5} maxLength={4000} /></div><button className="button primary" type="submit"><Icon name="check" size={16} />Save feedback locally</button></form><aside className="panel feedback-context"><h2>A useful demo scenario</h2><p>You want to expand into Germany. Find talent for a competitor analysis with a €300 budget and a deadline in 10 days.</p><ol><li>Post a task and define a clear outcome.</li><li>Compare matches and explore their evidence.</li><li>Confirm a project and explore the workspace.</li></ol><p><strong>Consider:</strong> is the next step always clear? What builds confidence, and what evidence is missing?</p><button className="button secondary" onClick={() => window.location.hash = 'post-a-task'}>Back to the task flow<Icon name="arrowRight" size={15} /></button><p style={{ marginTop: 20 }}>Also try the screens using only your keyboard and on a narrow screen.</p></aside></div>{entries.length > 0 && <section className="saved-feedback-list" aria-label="Saved feedback"><div className="feedback-export"><div><h2>{entries.length} saved observation{entries.length !== 1 ? 's' : ''}</h2><p>Saved locally · Download before resetting the demo.</p></div><button className="button secondary" onClick={download}><Icon name="download" size={16} />Download feedback</button></div>{entries.slice().reverse().map(entry => <article className="panel saved-feedback" key={entry.id}><h3>{entry.section}</h3><Badge>Clarity {entry.clarity}/5 · Evidence {entry.trust}/5 · Ease {entry.ease}/5</Badge><p>{entry.comment}</p></article>)}</section>}</>;
}

export default function TaskJuvo() {
  const [view, setView] = useState<View>('home');
  const [draft, setDraft] = useState<TaskDraft>(DEFAULT_TASK);
  const [studentId, setStudentId] = useState('emma');
  const [confirmedStudentId, setConfirmedStudentId] = useState('emma');
  const [confirmed, setConfirmed] = useState(false);
  const [sampleWorkspace, setSampleWorkspace] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [help, setHelp] = useState(false);
  const [reset, setReset] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState('Overall experience');
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => { setMobile(query.matches); if (!query.matches) setMenu(false); };
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.draft && Object.keys(DEFAULT_TASK).every(key => typeof data.draft[key] === typeof DEFAULT_TASK[key as keyof TaskDraft]) && Array.isArray(data.draft.deliverables) && Array.isArray(data.draft.skills)) setDraft(data.draft);
        if (STUDENTS.some(student => student.id === data.studentId)) setStudentId(data.studentId);
        if (STUDENTS.some(student => student.id === data.confirmedStudentId)) setConfirmedStudentId(data.confirmedStudentId);
        else if (STUDENTS.some(student => student.id === data.studentId)) setConfirmedStudentId(data.studentId);
        setConfirmed(data.confirmed === true);
        if (Array.isArray(data.feedback)) setFeedback(data.feedback.filter((entry: FeedbackEntry) => entry && typeof entry.comment === 'string' && typeof entry.section === 'string' && !isNaN(Date.parse(entry.date))));
      }
    } catch { setStorageError(true); }
    function updateHash() {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'sample-workspace') {
        setSampleWorkspace(true); setView('project'); setMenu(false);
        return;
      }
      const next = VIEWS.find(candidate => candidate === hash || ROUTES[candidate] === hash);
      if (next || !hash) { setSampleWorkspace(false); setView(next || 'home'); setMenu(false); }
    }
    updateHash();
    window.addEventListener('hashchange', updateHash);
    setHydrated(true);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE, JSON.stringify({ draft, studentId, confirmedStudentId, confirmed, feedback })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [draft, studentId, confirmedStudentId, confirmed, feedback, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const target = document.querySelector<HTMLElement>('#main-content h1');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view, sampleWorkspace, hydrated]);

  useEffect(() => {
    if (!menu) return;
    const sidebar = document.getElementById('sidebar');
    const first = sidebar?.querySelector<HTMLElement>('button');
    first?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function trap(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenu(false); requestAnimationFrame(() => document.getElementById('menu-toggle')?.focus()); }
      if (event.key === 'Tab' && sidebar) {
        const controls = Array.from(sidebar.querySelectorAll<HTMLElement>('button, a[href]'));
        const start = controls[0], end = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === start) { event.preventDefault(); end?.focus(); }
        else if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); start?.focus(); }
      }
    }
    document.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', trap); };
  }, [menu]);

  function navigate(next: View) {
    if (next === 'feedback' && view !== 'feedback') setFeedbackContext(view === 'home' ? 'Homepage' : TITLES[view]);
    setMenu(false);
    setSampleWorkspace(false);
    window.location.hash = ROUTES[next];
    setView(next);
  }
  function useDemo(next: View) {
    if (next !== 'project') { navigate(next); return; }
    setSampleWorkspace(true); setMenu(false); setView('project');
    window.location.hash = 'sample-workspace';
  }
  function startTemplate(index: number) {
    if (index === 0) setDraft(DEMO_TASK);
    else {
      const template = TASK_TEMPLATES[index];
      setDraft({ ...DEFAULT_TASK, title: template.title, category: template.category, budget: template.budget, deadline: daysFromNow(parseInt(template.duration)), description: template.description, skills: index === 1 ? ['PowerPoint', 'Financial modelling'] : ['Power BI', 'Excel'] });
    }
    setConfirmed(false); navigate('taak');
  }
  function clearDemo() {
    try { Object.keys(localStorage).filter(key => key === STORAGE || key.startsWith('taskjuvo:v2:project-messages:') || key.startsWith('taskjuvo:v2:sample-project-messages:')).forEach(key => localStorage.removeItem(key)); } catch { setStorageError(true); }
    setDraft({ ...DEFAULT_TASK, deadline: daysFromNow(10) }); setStudentId('emma'); setConfirmedStudentId('emma'); setConfirmed(false); setFeedback([]); setReset(false); navigate('home');
  }
  const student = STUDENTS.find(value => value.id === studentId) || STUDENTS[0];
  const confirmedStudent = STUDENTS.find(value => value.id === confirmedStudentId) || STUDENTS[0];
  const task = draft.title ? draft : DEMO_TASK;
  const workspaceTask = sampleWorkspace ? DATA_TASK : task;
  const workspaceStudent = sampleWorkspace ? STUDENTS[1] : confirmed ? confirmedStudent : student;
  const isHome = view === 'home';
  const sidebarNav: { view: View; icon: string; label: string; count?: string }[] = [{ view: 'overzicht', icon: 'dashboard', label: 'Overview' }, { view: 'taak', icon: 'file', label: 'My task' }, { view: 'matches', icon: 'users', label: 'Your matches', count: '3' }, { view: 'project', icon: 'folder', label: 'Project workspace' }];

  return <><title>{view === 'home' ? 'TaskJuvo — Your task. The right talent.' : `${TITLES[view]} · TaskJuvo`}</title><a className="skip-link" href="#main-content">Skip to content</a>{isHome ? <Landing navigate={navigate} startDemo={() => navigate('screens')} /> : <div className="app-shell">
    {menu && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => { setMenu(false); requestAnimationFrame(() => document.getElementById('menu-toggle')?.focus()); }} tabIndex={-1} />}
    <aside className={`sidebar ${menu ? 'open' : ''}`} id="sidebar" aria-label="Workspace navigation" inert={mobile && !menu} role={mobile && menu ? 'dialog' : undefined} aria-modal={mobile && menu ? true : undefined}><Brand onClick={() => navigate('home')} /><button className="button primary" onClick={() => navigate('taak')}><Icon name="plus" size={17} />Post a task</button><div className="nav-group-label">WORKSPACE</div><nav className="sidebar-nav" aria-label="Workspace">{sidebarNav.map(item => <button key={item.view} className={`sidebar-link ${view === item.view || (item.view === 'matches' && (view === 'profiel' || view === 'bevestiging')) ? 'active' : ''}`} aria-current={view === item.view ? 'page' : undefined} onClick={() => navigate(item.view)}><Icon name={item.icon} size={18} />{item.label}{item.count && <span className="nav-counter">{item.count}</span>}</button>)}</nav><div className="sidebar-spacer" /><nav className="sidebar-nav" aria-label="Additional navigation"><button className={`sidebar-link ${view === 'talent' ? 'active' : ''}`} onClick={() => navigate('talent')} aria-current={view === 'talent' ? 'page' : undefined}><Icon name="graduation" size={18} />For talent</button><button className={`sidebar-link ${view === 'feedback' ? 'active' : ''}`} onClick={() => navigate('feedback')} aria-current={view === 'feedback' ? 'page' : undefined}><Icon name="message" size={18} />Expert feedback</button><button className={`sidebar-link ${view === 'screens' ? 'active' : ''}`} onClick={() => navigate('screens')} aria-current={view === 'screens' ? 'page' : undefined}><Icon name="monitor" size={18} />Explore screens</button><button className="sidebar-link" onClick={() => setHelp(true)}><Icon name="support" size={18} />About this demo</button></nav><div className="sidebar-demo"><div className="sidebar-demo-title"><Icon name="sparkle" size={14} />Room to explore</div><p>Try the complete task flow using fictional sample data.</p><button className="text-button" onClick={() => setReset(true)}>Start again<Icon name="reset" size={12} /></button></div><div className="sidebar-profile"><span className="profile-initial">AV</span><div><strong>Alex van Leeuwen</strong><small>Canal Studio · Demo account</small></div></div></aside>
    <div className="app-main" inert={mobile && menu}><header className="app-topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" id="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Open navigation" aria-expanded={menu} aria-controls="sidebar"><Icon name="menu" size={19} /></button><span>Workspace</span><Icon name="chevron-right" size={13} /><strong>{TITLES[view]}</strong></div><div className="topbar-right"><span className="demo-indicator"><i />Prototype · fictional data</span><button className="button secondary small" onClick={() => navigate('feedback')}><Icon name="message" size={14} />Give feedback</button></div></header>
      <main className="app-content" id="main-content" ref={contentRef} tabIndex={-1}>{storageError && <p className="notice" role="alert" style={{ marginBottom: 20 }}>This browser cannot save your changes. You can still explore the demo and download your feedback.</p>}
        {view === 'screens' && <DemoTour onOpen={navigate} />}
        {view === 'overzicht' && <Dashboard draft={draft} confirmed={confirmed} student={confirmedStudent} navigate={navigate} useDemo={useDemo} startTemplate={startTemplate} />}
        {view === 'taak' && <TaskWizard draft={draft} onChange={value => { setDraft(value); setConfirmed(false); }} onComplete={() => navigate('matches')} onCancel={() => navigate('overzicht')} />}
        {view === 'matches' && <Matches task={task} onProfile={id => { setStudentId(id); navigate('profiel'); }} onSelect={id => { setStudentId(id); navigate('bevestiging'); }} onEdit={() => { if (!draft.title) setDraft(task); navigate('taak'); }} />}
        {view === 'profiel' && <StudentProfile student={student} task={task} onBack={() => navigate('matches')} onSelect={() => navigate('bevestiging')} />}
        {view === 'bevestiging' && <ProjectConfirmation task={task} student={student} onBack={() => navigate('profiel')} onConfirm={() => { setDraft(task); setConfirmedStudentId(student.id); setConfirmed(true); navigate('project'); }} />}
        {view === 'project' && <>
          {sampleWorkspace && <div className="notice" style={{ marginBottom: 20 }}><p>You are viewing a sample workspace. Your own task and selection are saved.</p><button className="text-button" onClick={() => navigate(confirmed ? 'project' : 'taak')}>{confirmed ? 'Resume my project' : 'Return to my task'}<Icon name="arrowRight" size={14} /></button></div>}
          <ProjectWorkspace key={`${sampleWorkspace ? 'sample' : 'own'}:${workspaceTask.title}:${workspaceStudent.id}`} task={workspaceTask} student={workspaceStudent} isSample={sampleWorkspace} onBrowseMatches={() => navigate('matches')} />
        </>}
        {view === 'talent' && <Talent navigate={navigate} />}
        {view === 'feedback' && <Feedback entries={feedback} context={feedbackContext} onSave={entry => setFeedback(previous => [...previous, entry])} />}
        <footer className="app-footnote"><span>TaskJuvo · Prototype for expert review. People and projects are fictional.</span><button className="text-button" onClick={() => navigate('home')}>Back to the homepage<Icon name="arrowUpRight" size={12} /></button></footer>
      </main></div></div>}
    <Modal open={help} title="Welcome to the TaskJuvo demo" onClose={() => setHelp(false)}><p>This demo helps business owners, students and experts review the concept and user experience.</p><ol><li>Describe a task or use the prefilled example.</li><li>Compare three matches and explore evidence of their skills.</li><li>Confirm a project and explore the milestones.</li><li>Save expert feedback and download it to share.</li></ol><p className="notice">All data is fictional. Verification and the project guarantee are proposed concepts. No payments, real matches or messages are processed.</p><p className="muted">Your task and feedback are stored only in this browser.</p><button className="button primary" onClick={() => { setHelp(false); navigate('taak'); }}>Start with your task<Icon name="arrowRight" size={16} /></button></Modal>
    <Modal open={reset} title="Start the demo again?" onClose={() => setReset(false)}><p>Your task, selection, project progress and saved feedback for this version of the demo will be cleared from this browser.</p>{feedback.length > 0 && <p className="notice">You have {feedback.length} feedback observation{feedback.length !== 1 ? 's' : ''}. Download them from Expert feedback first if you want to keep them.</p>}<div style={{ display: 'flex', gap: 10 }}><button className="button secondary" onClick={() => setReset(false)}>Cancel</button><button className="button primary" onClick={clearDemo}>Clear demo and start again<Icon name="reset" size={15} /></button></div></Modal>
  </>;
}
