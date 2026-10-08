'use client';

import { useEffect, useState } from 'react';
import { euro, formatDate, type Student, type TaskDraft } from '../lib/data';
import { Avatar, Badge, Icon, Modal } from './ui';
import './project.css';

type ProjectProps = { task: TaskDraft; student: Student };
type MilestoneStatus = 'approved' | 'review' | 'working' | 'planned';
type Message = { text: string; time: string };
type ProjectModal = 'message' | 'support' | 'agreement' | 'review' | 'deliverable' | null;

const statusLabels: Record<MilestoneStatus, string> = {
  approved: 'Approved', review: 'Ready for review', working: 'In progress', planned: 'Planned',
};
const initialMilestones: MilestoneStatus[] = ['approved', 'review', 'planned', 'planned'];

function isMilestoneStatus(value: unknown): value is MilestoneStatus {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(statusLabels, value);
}

function getMilestones(task: TaskDraft) {
  const research = ['market research', 'marketing'].includes(task.category.toLowerCase());
  return [
    { title: research ? 'Research & sources' : 'Scope & preparation', description: research ? 'Research questions, relevant sources and an agreed approach.' : 'An agreed approach, the required inputs and clear expectations.' },
    { title: research ? 'Analysis & insights' : 'First version', description: research ? 'Collected information translated into a well-supported analysis.' : 'The core components developed in line with the project brief.' },
    { title: 'Draft & feedback', description: 'A complete draft, with space for your focused feedback.' },
    { title: 'Final delivery', description: 'All agreed deliverables completed and ready to hand over.' },
  ];
}

function ScopeList({ task }: { task: TaskDraft }) {
  return <ul className="project-scope-list">{task.deliverables.map((item, index) => <li key={`${index}-${item}`}><Icon name="check" size={17} /><span>{item}</span></li>)}</ul>;
}

function Guarantee({ compact = false }: { compact?: boolean }) {
  return <section className={`project-guarantee ${compact ? 'compact' : ''}`} aria-label="Proposed project support">
    <div className="project-guarantee-icon"><Icon name="shield" size={22} /></div>
    <div><h3>TaskJuvo Project Guarantee</h3><p>If the student cannot meet the agreed requirements, the proposed TaskJuvo service helps you work towards a solution or find replacement talent.</p><span className="project-concept-label">Proposed concept · not a legally binding guarantee</span></div>
  </section>;
}

export function ProjectConfirmation({ task, student, onBack, onConfirm }: ProjectProps & { onBack: () => void; onConfirm: () => void }) {
  const milestones = getMilestones(task);
  return <div className="project-page confirmation-page">
    <button className="button ghost small project-back" onClick={onBack}><Icon name="arrow-left" size={17} />Back to profile</button>
    <div className="page-heading"><p className="eyebrow">A CLEAR SCOPE. A CONFIDENT START.</p><h1>Ready to make it happen.</h1><p className="muted">The right talent, a defined outcome and a shared plan. Review the project details before you continue.</p></div>
    <div className="project-columns confirmation-columns">
      <div className="project-main">
        <section className="panel project-brief"><div className="project-section-heading"><span className="project-icon-box"><Icon name="file" size={21} /></span><div><p className="section-label">YOUR PROJECT</p><h2>{task.title}</h2></div></div>
          <p className="project-description">{task.description}</p><div className="project-divider" /><h3>Your agreed deliverables</h3><ScopeList task={task} />
          <dl className="project-terms-grid"><div><dt>Deadline</dt><dd>{formatDate(task.deadline)}</dd></div><div><dt>Fixed project budget</dt><dd>{euro(task.budget)}</dd></div><div><dt>Estimated workload</dt><dd>{task.hours} hours in total</dd></div><div><dt>Work arrangement</dt><dd>{task.arrangement}{task.arrangement !== 'Remote' && task.location ? ` · ${task.location}` : ''}</dd></div></dl>
        </section>
        <section className="panel project-milestone-plan"><div className="project-section-heading"><div><p className="section-label">SMALL STEPS. A CLEAR OUTCOME.</p><h2>Your proposed project plan</h2></div><Badge variant="neutral">4 milestones</Badge></div>
          <ol className="project-plan-list">{milestones.map((milestone, index) => <li key={milestone.title}><span className="project-plan-number">{index + 1}</span><div><h3>{milestone.title}</h3><p>{milestone.description}</p></div>{index === 3 && <span className="project-plan-date">{formatDate(task.deadline)}</span>}</li>)}</ol>
          <p className="project-fine-print">This plan is a proposal. In the full service, you and your student would agree the interim milestones together.</p>
        </section>
      </div>
      <aside className="project-sidebar">
        <section className="panel project-talent-card"><p className="section-label">YOUR SELECTED TALENT</p><Avatar student={student} size="lg" /><h2>{student.name}</h2><p>{student.role}</p><Badge variant="green"><Icon name="check" size={14} />TaskJuvo Verified · demo</Badge><div className="project-talent-study"><span>{student.study}</span><span>{student.university}</span></div><div className="project-talent-meta"><span><strong>{student.available} hours</strong> available per week</span><span><strong>{student.projects}</strong> completed example projects</span></div></section>
        <Guarantee compact />
        <section className="project-confirm-action"><div className="project-confirm-total"><span>Fixed project budget</span><strong>{euro(task.budget)}</strong></div><p>Covers the agreed deliverables. Any platform fees are still part of the concept being evaluated.</p><button className="button primary" onClick={onConfirm}>Confirm project<Icon name="arrow-right" size={18} /></button><p className="project-prototype-note"><Icon name="info" size={15} />You are opening a demo project. No legal agreement is created and no payment takes place.</p></section>
      </aside>
    </div>
  </div>;
}

export function ProjectWorkspace({ task, student, onBrowseMatches, isSample = false }: ProjectProps & { onBrowseMatches: () => void; isSample?: boolean }) {
  const milestones = getMilestones(task);
  const [statuses, setStatuses] = useState<MilestoneStatus[]>(initialMilestones);
  const [modal, setModal] = useState<ProjectModal>(null);
  const [selectedMilestone, setSelectedMilestone] = useState(1);
  const [selectedDeliverable, setSelectedDeliverable] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [revision, setRevision] = useState('');
  const [supportTopic, setSupportTopic] = useState('Planning or progress');
  const [supportText, setSupportText] = useState('');
  const [notice, setNotice] = useState('');
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [messageSaved, setMessageSaved] = useState(false);
  const storageKey = `${isSample ? 'taskjuvo:v2:sample-project-messages:' : 'taskjuvo:v2:project-messages:'}${student.id}:${task.title}`;
  const complete = statuses.filter(status => status === 'approved').length;
  const reviewIndex = statuses.findIndex(status => status === 'review');

  useEffect(() => {
    setLoadedStorageKey(null);
    setStorageError(false);
    setMessages([]);
    setMessageDraft('');
    setStatuses(initialMilestones);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const record = parsed as Record<string, unknown>;
          if (typeof record.draft === 'string') setMessageDraft(record.draft);
          if (Array.isArray(record.messages)) setMessages(record.messages.filter((entry): entry is Message => Boolean(entry && typeof entry === 'object' && typeof entry.text === 'string' && typeof entry.time === 'string')));
          const savedStatuses = record.statuses;
          if (Array.isArray(savedStatuses) && savedStatuses.length === 4 && savedStatuses.every(isMilestoneStatus)) setStatuses(savedStatuses);
        }
      }
    } catch { setStorageError(true); }
    setLoadedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ draft: messageDraft, messages, statuses })); }
    catch { setStorageError(true); }
  }, [messageDraft, messages, statuses, storageKey, loadedStorageKey]);

  function approveMilestone() {
    setStatuses(current => current.map((status, index) => index === selectedMilestone ? 'approved' : index === selectedMilestone + 1 && status === 'planned' ? 'working' : status));
    setNotice(`“${milestones[selectedMilestone].title}” has been approved in this demo. ${selectedMilestone === 3 ? 'All milestones are complete.' : 'The next milestone is now in progress.'}`);
    setModal(null);
  }

  function closeModal() { setModal(null); }

  return <div className="project-page workspace-page">
    <div className="project-workspace-heading"><div className="page-heading"><p className="eyebrow">YOUR PROJECT WORKSPACE</p><h1>{task.title}</h1><p className="muted">Clear progress. A shared plan. Everything you need to move the task forward.</p></div><Badge variant={complete === 4 ? 'green' : 'orange'}>{complete === 4 ? 'Project complete' : 'In progress'}</Badge></div>
    <div className="project-demo-strip"><Icon name="info" size={17} /><span>Interactive demo project. Try reviews and communication; no messages are sent and no payments are made.</span></div>
    {notice && <div className="project-notice" role="status"><Icon name="check" size={18} /><span>{notice}</span><button className="button ghost small" onClick={() => setNotice('')} aria-label="Dismiss notification"><Icon name="x" size={17} /></button></div>}
    <div className="project-columns">
      <div className="project-main">
        <section className="panel project-progress"><div className="project-section-heading"><div><p className="section-label">FROM A CLEAR PLAN TO A FINISHED TASK</p><h2>Project progress</h2></div><span className="project-progress-number">{Math.round(complete / 4 * 100)}<small>%</small></span></div>
          <progress value={complete} max={4} aria-label={`${complete} of 4 milestones approved`} /><div className="project-progress-label"><span>{complete} of 4 milestones approved</span><span><Icon name="calendar" size={15} />Deadline {formatDate(task.deadline)}</span></div>
          <div className={`project-next-action ${complete === 4 ? 'finished' : ''}`}><span className="project-next-icon"><Icon name={complete === 4 ? 'check' : 'file'} size={21} /></span><div><h3>{reviewIndex >= 0 ? 'Your feedback moves the project forward.' : complete === 4 ? 'Your project is complete.' : 'The next deliverable is taking shape.'}</h3><p>{reviewIndex >= 0 ? `${student.name.split(' ')[0]} has prepared a sample of “${milestones[reviewIndex].title}” for you. Take a look and check it against the agreed scope.` : complete === 4 ? 'All agreed milestones have been approved in this demo. The sample files remain available below.' : 'Simulate a delivery to try the next step of the collaboration.'}</p></div>{reviewIndex >= 0 && <button className="button primary small" onClick={() => { setSelectedMilestone(reviewIndex); setRevision(''); setModal('review'); }}>View deliverable<Icon name="arrow-right" size={16} /></button>}</div>
        </section>
        <section className="panel project-milestones"><div className="project-section-heading"><div><p className="section-label">ONE STEP AT A TIME</p><h2>Project milestones</h2></div><span className="project-section-count">04</span></div>
          <ol className="project-timeline">{milestones.map((milestone, index) => <li key={milestone.title} className={`milestone-${statuses[index]}`}><span className="project-milestone-number" aria-hidden="true">{statuses[index] === 'approved' ? <Icon name="check" size={17} /> : String(index + 1).padStart(2, '0')}</span><div className="project-milestone-content"><div className="project-milestone-title"><h3>{milestone.title}</h3><span className={`project-milestone-status ${statuses[index]}`}>{statusLabels[statuses[index]]}</span></div><p>{milestone.description}</p>{statuses[index] === 'review' && <button className="project-inline-action" onClick={() => { setSelectedMilestone(index); setRevision(''); setModal('review'); }}>Review this milestone<Icon name="arrow-right" size={15} /></button>}{statuses[index] === 'working' && <button className="project-inline-action" onClick={() => { setStatuses(current => current.map((status, currentIndex) => currentIndex === index ? 'review' : status)); setNotice(`A sample delivery for “${milestone.title}” is ready for review.`); }}>Simulate delivery<Icon name="arrow-right" size={15} /></button>}</div></li>)}</ol>
        </section>
        <section className="panel project-deliverables"><div className="project-section-heading"><div><p className="section-label">THE OUTCOME YOU AGREED</p><h2>Project deliverables</h2></div><Badge variant="neutral">{task.deliverables.length} deliverables</Badge></div><ul className="project-file-list">{task.deliverables.map((deliverable, index) => <li key={`${index}-${deliverable}`}><span className="project-file-icon"><Icon name="file" size={22} /></span><div><h3>{deliverable}</h3><p>{complete === 4 ? 'Final sample' : 'Draft sample'} · demo file</p></div><button className="button ghost small" aria-label={`View sample: ${deliverable}`} onClick={() => { setSelectedDeliverable(deliverable); setModal('deliverable'); }}>View sample<Icon name="arrow-right" size={16} /></button></li>)}</ul><p className="project-fine-print">These sample files demonstrate the delivery experience. Their content is fictional; no actual research has been carried out.</p></section>
        <button className="button ghost small project-reset" onClick={() => { setStatuses(initialMilestones); setNotice('Demo progress has been reset. Your locally saved messages are kept.'); }}>Reset demo progress</button>
      </div>
      <aside className="project-sidebar">
        <section className="panel project-partner"><p className="section-label">YOUR PROJECT PARTNER</p><div className="project-partner-identity"><Avatar student={student} size="md" /><div><h2>{student.name}</h2><p>{student.role}</p></div></div><Badge variant="green"><Icon name="check" size={14} />TaskJuvo Verified · demo</Badge><p className="project-partner-description">{student.study}<br />{student.university}</p><button className="button secondary" onClick={() => setModal('message')}><Icon name="message" size={18} />Message {student.name.split(' ')[0]}{messages.length > 0 && <span className="project-message-count">{messages.length}</span>}</button></section>
        <section className="panel project-summary"><p className="section-label">THE PROJECT DETAILS</p><dl><div><dt>Fixed budget</dt><dd>{euro(task.budget)}</dd></div><div><dt>Deadline</dt><dd>{formatDate(task.deadline)}</dd></div><div><dt>Estimated workload</dt><dd>{task.hours} hours in total</dd></div><div><dt>Work arrangement</dt><dd>{task.arrangement}</dd></div>{task.arrangement !== 'Remote' && <div><dt>Location</dt><dd>{task.location}</dd></div>}</dl><button className="button ghost small" onClick={() => setModal('agreement')}><Icon name="file" size={17} />View project agreement<Icon name="arrow-right" size={16} /></button></section>
        <Guarantee compact />
        <section className="project-support-card"><span className="project-icon-box"><Icon name="support" size={22} /></span><h3>A little support goes a long way.</h3><p>Need a hand with the scope, planning or collaboration? The proposed service offers support along the way.</p><button className="button secondary" onClick={() => setModal('support')}>Request support<Icon name="arrow-right" size={16} /></button></section>
        <button className="button ghost small project-other-talent" onClick={onBrowseMatches}>Back to my matches<Icon name="arrow-right" size={16} /></button>
      </aside>
    </div>

    <Modal open={modal === 'message'} title={`Message ${student.name.split(' ')[0]}`} onClose={closeModal}>
      <p className="project-modal-intro">Try project communication. Messages are saved only in this browser and are never sent to the student.</p>
      <div className="project-message-thread"><div className="project-example-message"><span className="section-label">EXAMPLE MESSAGE FROM {student.name.split(' ')[0].toUpperCase()}</span><p>Hi! The first version is ready. I would love to hear whether the approach fits what you need. If you have any extra context, feel free to add it here.</p><span>Fictional example · not a live conversation</span></div>{messages.map((message, index) => <div className="project-own-message" key={`${index}-${message.time}`}><span>Your locally saved message · {message.time}</span><p>{message.text}</p></div>)}</div>
      <form onSubmit={event => { event.preventDefault(); if (!messageDraft.trim()) return; setMessages(current => [...current, { text: messageDraft.trim(), time: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date()) }]); setMessageDraft(''); setMessageSaved(true); setNotice('Your message has been saved locally. It has not been sent to the student.'); }}><label className="field" htmlFor="project-message">Your message<textarea className="textarea" id="project-message" rows={4} value={messageDraft} maxLength={2000} onChange={event => { setMessageDraft(event.target.value); setMessageSaved(false); }} placeholder="For example: thanks for the analysis. Could you explain how you selected the sources?" required /></label>{messageSaved && <p className="project-message-saved" role="status">Message saved locally. Nothing has been sent.</p>}<div className="project-modal-actions"><button className="button secondary" type="button" onClick={closeModal}>Close</button><button className="button primary" type="submit" disabled={!messageDraft.trim()}>Save message locally<Icon name="check" size={17} /></button></div></form>
      {storageError && <p className="project-storage-note" role="status">Browser storage is unavailable. Your messages are kept only while this screen remains open.</p>}
    </Modal>

    <Modal open={modal === 'support'} title="Request support" onClose={closeModal}>
      <p className="project-modal-intro">What would you like help with? In the full service, TaskJuvo would help you decide what to do next. This form simulates a request; nothing is stored or sent.</p><form onSubmit={event => { event.preventDefault(); if (!supportText.trim()) return; setNotice(`Demo request “${supportTopic}” simulated. Nothing has been stored or sent to a support team.`); setSupportText(''); setModal(null); }}><label className="field" htmlFor="project-support-topic">What is your request about?<select className="input" id="project-support-topic" value={supportTopic} onChange={event => setSupportTopic(event.target.value)}><option>Planning or progress</option><option>Scope or deliverables</option><option>Working with your student</option><option>A question about the support concept</option><option>Something else</option></select></label><label className="field" htmlFor="project-support-text">How can we help?<textarea className="textarea" id="project-support-text" rows={4} required value={supportText} maxLength={2000} onChange={event => setSupportText(event.target.value)} placeholder="Briefly describe the issue and the support you would find useful." /></label><div className="project-modal-actions"><button className="button secondary" type="button" onClick={closeModal}>Cancel</button><button className="button primary" type="submit" disabled={!supportText.trim()}>Simulate support request<Icon name="arrow-right" size={17} /></button></div></form>
    </Modal>

    <Modal open={modal === 'agreement'} title="Project agreement" onClose={closeModal}>
      <div className="project-agreement"><Badge variant="orange">Example · no legal agreement</Badge><h3>{task.title}</h3><p>{task.description}</p><h4>Talent</h4><p>{student.name} · {student.study}</p><h4>Agreed deliverables</h4><ScopeList task={task} /><dl className="project-terms-grid"><div><dt>Project budget</dt><dd>{euro(task.budget)}</dd></div><div><dt>Deadline</dt><dd>{formatDate(task.deadline)}</dd></div><div><dt>Estimated workload</dt><dd>{task.hours} hours</dd></div><div><dt>Work arrangement</dt><dd>{task.arrangement}</dd></div></dl><h4>Reviews and feedback</h4><p>Review each milestone against the original project scope. Discuss any proposed changes together.</p><h4>Support</h4><p>The proposed TaskJuvo Project Guarantee concept offers help when issues arise and, where needed, support in finding replacement talent.</p><div className="project-agreement-note">This project brief is for prototype feedback. No legal agreement, signature, platform fee or payment has been processed.</div><div className="project-modal-actions"><button className="button secondary" onClick={closeModal}>Close</button></div></div>
    </Modal>

    <Modal open={modal === 'review'} title={`Review: ${milestones[selectedMilestone].title}`} onClose={closeModal}>
      <p className="project-modal-intro">Check the deliverable against the agreed scope. The summary below is fictional and lets you try the review process.</p><div className="project-review-preview"><p className="section-label">SAMPLE DELIVERY · MILESTONE {selectedMilestone + 1}</p><h3>{milestones[selectedMilestone].title}</h3><p>{milestones[selectedMilestone].description}</p><ul><li>The agreed approach and outcomes are documented.</li><li>Assumptions and sources are explained.</li><li>Open questions are highlighted for your feedback.</li></ul></div><label className="field" htmlFor="project-revision">Requested changes <span className="muted">(only when requesting a revision)</span><textarea className="textarea" id="project-revision" value={revision} onChange={event => setRevision(event.target.value)} rows={3} maxLength={2000} placeholder="What needs to change within the agreed scope?" /></label><div className="project-modal-actions review-actions"><button className="button secondary" disabled={!revision.trim()} onClick={() => { setStatuses(current => current.map((status, index) => index === selectedMilestone ? 'working' : status)); setNotice(`Revision requested in this demo: “${revision.trim()}”. The milestone is back in progress; nothing has been sent.`); setModal(null); }}>Request a revision</button><button className="button primary" onClick={approveMilestone}><Icon name="check" size={17} />Approve milestone</button></div><p className="project-fine-print">This changes only the demo status. Approval does not trigger a payment.</p>
    </Modal>

    <Modal open={modal === 'deliverable'} title={selectedDeliverable} onClose={closeModal}>
      <div className="project-document-preview"><div className="project-document-head"><span className="project-document-brand">TaskJuvo<span> / project deliverable</span></span><Badge variant="neutral">Fictional sample</Badge></div><p className="eyebrow">{complete === 4 ? 'FINAL ' : 'DRAFT '}DELIVERY</p><h3>{selectedDeliverable}</h3><p>Part of: {task.title}</p><div className="project-divider" /><h4>1. Objective and scope</h4><p>This deliverable supports the project objective and agreed scope. In a real project, it would contain the completed work, findings and supporting evidence.</p><h4>2. Completed work</h4><div className="project-document-placeholder"><Icon name="file" size={28} /><p>The student’s completed work would appear here.</p><span>No actual research or project file has been produced for this demo.</span></div><h4>3. Sources and next steps</h4><p>A real deliverable includes relevant sources, assumptions and practical recommendations so that you can assess and use the result.</p></div><div className="project-modal-actions"><button className="button secondary" onClick={closeModal}>Close</button></div>
    </Modal>
  </div>;
}
