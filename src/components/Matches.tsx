'use client';

import { useState } from 'react';
import { euro, formatDate, getMatches, type Student, type TaskDraft } from '../lib/data';
import { Avatar, Badge, Icon, Modal } from './ui';
import './matches.css';

interface MatchesProps {
  task: TaskDraft;
  onProfile: (id: string) => void;
  onSelect: (id: string) => void;
  onEdit: () => void;
}

interface StudentProfileProps {
  student: Student;
  task: TaskDraft;
  onBack: () => void;
  onSelect: () => void;
}

// These links between skills and evidence are illustrative, like the profiles themselves.
const PROOF_SKILLS: Record<string, string[][]> = {
  emma: [['Market research', 'Excel', 'PowerPoint'], ['Market research']],
  lucas: [['Excel', 'Power BI'], ['Excel', 'Financial modelling']],
  sophie: [['Market research', 'Copywriting'], ['PowerPoint']],
  noah: [['React']],
  aya: [['Figma', 'PowerPoint']],
};

function provedSkills(student: Student) {
  return [...new Set((PROOF_SKILLS[student.id] || []).flat())];
}

function hasSkill(skills: string[], skill: string) {
  return skills.some((candidate) => candidate.toLowerCase() === skill.toLowerCase());
}

function skillList(skills: string[]) {
  return new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' }).format(skills);
}

function matchingSkills(student: Student, task: TaskDraft) {
  return task.skills.filter((skill) => hasSkill(provedSkills(student), skill));
}

function attentionPoint(student: Student, task: TaskDraft) {
  const unproved = task.skills.filter((skill) => !hasSkill(provedSkills(student), skill));
  if (unproved.length) return `Discuss ${skillList(unproved)}: no supporting example is included in this profile.`;
  if (student.id === 'sophie') return 'With 8 hours available per week, a short deadline needs a carefully agreed schedule.';
  return 'Sector experience has not been established. Discuss it during your introduction.';
}

function fitExplanation(student: Student, task: TaskDraft) {
  const relevant = matchingSkills(student, task);
  const context: Record<string, string> = {
    emma: 'A market-entry project and a German consumer study are relevant to research-led tasks.',
    lucas: 'Pricing analysis and financial modelling are useful for data-led decisions.',
    sophie: 'Customer interviews and a strategy presentation show research and clear communication.',
    noah: 'A responsive web app shows experience building and handing over a prototype.',
    aya: 'An impact-business pitch deck shows visual structure and presentation skills.',
  };
  const explanation = context[student.id] || student.reason;
  if (!task.skills.length) return explanation;
  if (!relevant.length) return 'This profile offers complementary expertise. The requested skills have no supporting examples yet; discuss the fit before selecting.';
  return `Portfolio evidence supports ${relevant.length} of ${task.skills.length} required skills. ${explanation}`;
}

function EvidenceThumbnail({ student, evidenceIndex }: { student: Student; evidenceIndex: number }) {
  const type = student.id === 'lucas' ? (evidenceIndex === 0 ? 'dashboard' : 'spreadsheet') : student.id === 'noah' ? 'app' : student.id === 'aya' ? 'presentation' : 'research';
  return (
    <figure className={`evidence-thumbnail evidence-thumbnail-${type}`}>
      <div className="evidence-thumbnail-art" aria-hidden="true">
        <div className="evidence-thumbnail-sheet">
          <div className="evidence-thumbnail-header"><i /><i /><i /></div>
          <span className="evidence-thumbnail-title" />
          <div className="evidence-thumbnail-chart"><span /><span /><span /><span /></div>
          <div className="evidence-thumbnail-lines"><span /><span /><span /></div>
        </div>
      </div>
      <figcaption>Illustrative deliverable</figcaption>
    </figure>
  );
}

function VerificationDetails() {
  return (
    <div className="verification-details">
      <p>TaskJuvo Verified shows how we plan to make skills transparent: with evidence you can review.</p>
      <ol>
        <li><strong>Study and identity</strong><span>Proposed checks for university enrolment and identity.</span></li>
        <li><strong>Portfolio and skills</strong><span>Relevant work, a clear individual contribution and an assessment.</span></li>
        <li><strong>Project history</strong><span>Client feedback and on-time delivery, with the number of projects shown.</span></li>
      </ol>
      <p className="matches-demo-note"><Icon name="info" size={18} /><span>All profiles, reviews and verification statuses are fictional. This badge illustrates the proposed process; no people or documents have been verified in this demo.</span></p>
    </div>
  );
}

function Comparison({ students, task }: { students: Student[]; task: TaskDraft }) {
  const rows = [
    { label: 'Evidence for your required skills', get: (student: Student) => matchingSkills(student, task).join(', ') || 'No supporting example yet' },
    { label: 'Weekly availability', get: (student: Student) => `${student.available} hours` },
    { label: 'Completed projects', get: (student: Student) => `${student.projects} example projects` },
    { label: 'On-time delivery', get: (student: Student) => `${student.onTime}% of ${student.projects} example projects` },
    { label: 'Average rating', get: (student: Student) => `${student.rating} / 5` },
    { label: 'Worth discussing', get: (student: Student) => attentionPoint(student, task) },
  ];

  return (
    <section className="panel match-comparison" aria-labelledby="comparison-heading">
      <div className="match-section-heading"><div><p className="eyebrow">CHOOSE WITH CONFIDENCE</p><h2 id="comparison-heading">Compare your shortlist</h2></div><Badge variant="neutral">Example data</Badge></div>
      <p className="muted">Review the evidence, available time and questions to resolve before you choose.</p>
      <div className="comparison-desktop">
        <table>
          <caption className="match-visually-hidden">Comparison of {students.map((student) => student.name).join(', ')} for your task. All data is fictional.</caption>
          <thead><tr><th scope="col">What matters for your task</th>{students.map((student) => <th scope="col" key={student.id}>{student.name}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{students.map((student) => <td key={student.id}>{row.get(student)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="comparison-mobile">
        {students.map((student) => <article key={student.id}><h3>{student.name}</h3><dl>{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.get(student)}</dd></div>)}</dl></article>)}
      </div>
    </section>
  );
}

export function Matches({ task, onProfile, onSelect, onEdit }: MatchesProps) {
  const students = getMatches(task).slice(0, 3);
  const [compared, setCompared] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const selected = students.filter((student) => compared.includes(student.id));

  function toggleComparison(id: string) {
    setCompared((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="matches-page">
      <header className="page-heading matches-heading">
        <div><p className="eyebrow">YOUR TASK. THE RIGHT TALENT.</p><h1>Three matches. One clear task.</h1><p className="muted">Explore the evidence, compare the fit and choose who to work with.</p></div>
        <button type="button" className="button secondary" onClick={onEdit}><Icon name="edit" size={17} /> Edit task</button>
      </header>

      <section className="panel match-task-summary" aria-label="Your task summary">
        <div className="match-summary-icon"><Icon name="briefcase" size={24} /></div>
        <div className="match-summary-title"><span className="section-label">YOUR TASK</span><h2>{task.title || 'Your new task'}</h2><p>{[task.category, ...task.skills].filter((item, index, items) => items.findIndex(value => value.toLowerCase() === item.toLowerCase()) === index).join(' · ')}</p></div>
        <div className="match-summary-fact"><span>Project budget</span><strong>{euro(task.budget)}</strong></div>
        <div className="match-summary-fact"><span>Delivery date</span><strong>{formatDate(task.deadline)}</strong></div>
      </section>

      <div className="match-results-toolbar">
        <div><h2>Your curated shortlist <span className="match-count">3</span></h2><p>Skills, relevant experience and availability, at a glance.</p></div>
        <button type="button" className="match-verification-link" onClick={() => setShowVerification(true)}><Icon name="shield" size={17} /> What does Verified mean?</button>
      </div>
      <p className="match-score-explanation"><Icon name="info" size={17} /><span><strong>Demo matches:</strong> these profiles and scores are curated examples. Scores are illustrative and are not calculated from your task.</span></p>

      <div className="match-cards">
        {students.map((student, index) => {
          const relevant = matchingSkills(student, task);
          const skillsToShow = task.skills.length ? relevant : provedSkills(student);
          return (
            <article className={`panel match-card ${index === 0 ? 'match-card-featured' : ''}`} key={student.id}>
              <div className="match-card-topline">{index === 0 ? <span className="match-best-label"><Icon name="sparkles" size={14} /> Recommended</span> : <span className="match-alternative-label">Alternative {index}</span>}<span className="match-score"><strong>{student.score}%</strong><span>demo match score</span></span></div>
              <div className="match-person"><Avatar student={student} size="md" /><div><h3>{student.name}</h3><p>{student.role}</p></div></div>
              <p className="match-study">{student.study}<br /><span>{student.university}</span></p>
              <Badge variant="green"><Icon name="shield" size={14} /> TaskJuvo Verified · demo</Badge>

              <div className="match-skills"><h4>Relevant skills with evidence</h4><div className="match-chip-list">{skillsToShow.length ? skillsToShow.map((skill) => <span className="match-skill-chip" key={skill}><Icon name="check" size={13} />{skill}</span>) : <span className="match-no-proof">No evidence for your required skills yet.</span>}</div></div>
              <div className="match-fit"><h4>Why this match?</h4><p>{fitExplanation(student, task)}</p></div>
              <details className="match-evidence-preview"><summary><Icon name="briefcase" size={16} /><span>View example work</span><Icon name="chevron-right" size={15} /></summary><div><strong>{student.evidence[0]?.title || 'Portfolio to be discussed'}</strong><p>{student.evidence[0]?.description}</p><span className="match-evidence-label">{student.evidence[0]?.tag} · fictional evidence</span></div></details>
              <div className="match-card-facts"><span><Icon name="clock" size={16} /><strong>{student.available} hours</strong> / week</span><span><Icon name="check-circle" size={16} /><strong>{student.projects}</strong> projects</span></div>
              <p className="match-attention"><strong>Discuss together</strong>{attentionPoint(student, task)}</p>

              <div className="match-card-actions"><button type="button" className={`button ${index === 0 ? 'primary' : 'secondary'}`} onClick={() => onProfile(student.id)}>View profile <Icon name="arrow-right" size={16} /></button><button type="button" className="button ghost small match-select-button" onClick={() => onSelect(student.id)}>Select {student.name.split(' ')[0]}</button></div>
              <label className="match-compare-checkbox"><input type="checkbox" checked={compared.includes(student.id)} onChange={() => toggleComparison(student.id)} /><span>Compare<span className="match-visually-hidden"> {student.name}</span></span></label>
            </article>
          );
        })}
      </div>

      <div className="match-compare-bar"><div><strong>A clearer choice, side by side.</strong><p aria-live="polite">{selected.length ? `${selected.length} ${selected.length === 1 ? 'talent selected' : 'talents selected'} for comparison.` : 'Select two or three talents to compare their strengths.'}</p></div><button type="button" className="button secondary" disabled={selected.length < 2} onClick={() => setShowComparison((value) => !value)} aria-expanded={showComparison && selected.length >= 2} aria-controls="match-comparison-section">{showComparison && selected.length >= 2 ? 'Close comparison' : `Compare${selected.length ? ` ${selected.length} talents` : ' talents'}`}<Icon name="columns" size={17} /></button></div>
      <div id="match-comparison-section">{showComparison && selected.length >= 2 && <Comparison students={selected} task={task} />}</div>
      <p className="match-footer-note"><Icon name="shield" size={18} /><span>Introduce yourselves and agree on the scope first. You will confirm your selection in the next step.</span></p>
      <Modal open={showVerification} title="What does TaskJuvo Verified mean?" onClose={() => setShowVerification(false)}><VerificationDetails /></Modal>
    </div>
  );
}

export function StudentProfile({ student, task, onBack, onSelect }: StudentProfileProps) {
  const [showVerification, setShowVerification] = useState(false);
  const verified = provedSkills(student);
  const additional = student.skills.filter((skill) => !hasSkill(verified, skill));
  const businessEvidence = student.evidence.filter((evidence) => evidence.tag === 'Business project');
  const academicEvidence = student.evidence.filter((evidence) => evidence.tag !== 'Business project');

  function evidenceCard(evidence: Student['evidence'][number]) {
    const originalIndex = student.evidence.indexOf(evidence);
    return (
      <article className="profile-evidence-card" key={evidence.title}>
        <EvidenceThumbnail student={student} evidenceIndex={originalIndex} />
        <div><span className="match-evidence-label">{evidence.tag}</span><h3>{evidence.title}</h3><p>{evidence.description}</p><div className="match-chip-list">{(PROOF_SKILLS[student.id]?.[originalIndex] || []).map((skill) => <span className="match-skill-chip" key={skill}><Icon name="check" size={13} />{skill}</span>)}</div>
          <details className="profile-proof-details"><summary>What does this evidence show?</summary><div><p>This example connects project work to specific skills and outcomes.</p><dl><div><dt>Evidence type</dt><dd>{evidence.tag === 'Business project' ? 'Project outcome and client feedback' : 'Academic work and assessment'}</dd></div><div><dt>What to discuss</dt><dd>Individual contribution, sources used and relevance to your sector.</dd></div><div><dt>Status in this demo</dt><dd>Fictional portfolio; no original work file is available.</dd></div></dl></div></details>
        </div>
      </article>
    );
  }

  return (
    <div className="student-profile-page">
      <button type="button" className="button ghost profile-back" onClick={onBack}><Icon name="arrow-left" size={17} /> Back to matches</button>
      <header className="panel profile-hero"><div className="profile-hero-person"><Avatar student={student} size="lg" /><div><p className="eyebrow">THE PROOF BEHIND THE PROFILE</p><h1>{student.name}</h1><p className="profile-hero-role">{student.role}</p><p className="muted">{student.study} · {student.university}</p><button type="button" className="profile-verified-button" aria-label="What does TaskJuvo Verified mean?" onClick={() => setShowVerification(true)}><Badge variant="green"><Icon name="shield" size={15} /> TaskJuvo Verified · demo</Badge><span>How verification works</span></button></div></div><div className="profile-hero-score"><strong>{student.score}<span>%</span></strong><span>Illustrative match score</span><small>Predefined for this demo</small></div></header>

      <div className="profile-layout"><div className="profile-main">
        <section className="panel profile-section" aria-labelledby="profile-fit-heading"><p className="eyebrow">HOW THIS PROFILE FITS YOUR TASK</p><h2 id="profile-fit-heading">Why {student.name.split(' ')[0]} fits your task</h2><p>{fitExplanation(student, task)}</p><div className="profile-task-link"><Icon name="briefcase" size={19} /><span>{task.title || 'Your new task'}</span></div><p className="profile-attention"><Icon name="info" size={18} /><span><strong>Discuss during your introduction</strong>{attentionPoint(student, task)}</span></p></section>

        <section className="panel profile-section" aria-labelledby="profile-skills-heading"><div className="match-section-heading"><h2 id="profile-skills-heading">Verified skills</h2><Icon name="shield" size={21} /></div><p className="muted">Every skill below is linked to a project in this example portfolio.</p><div className="profile-skill-grid">{verified.map((skill) => <div className="profile-verified-skill" key={skill}><Icon name="check-circle" size={19} /><div><strong>{skill}</strong><span>{hasSkill(task.skills, skill) ? 'Required for your task' : 'Additional expertise'}</span></div></div>)}</div>{additional.length > 0 && <div className="profile-additional-skills"><h3>Other profile skills</h3><p>{additional.join(' · ')}</p><span>No supporting example yet. Discuss these skills before you proceed.</span></div>}</section>

        <section className="panel profile-section" aria-labelledby="profile-projects-heading"><p className="eyebrow">REAL-WORLD APPLICATION</p><h2 id="profile-projects-heading">Business projects</h2><div className="profile-evidence-list">{businessEvidence.length ? businessEvidence.map(evidenceCard) : <p className="muted">No business project in this example portfolio yet.</p>}</div></section>

        {academicEvidence.length > 0 && <section className="panel profile-section" aria-labelledby="profile-academic-heading"><p className="eyebrow">KNOWLEDGE IN PRACTICE</p><h2 id="profile-academic-heading">Academic projects</h2><div className="profile-evidence-list">{academicEvidence.map(evidenceCard)}</div></section>}

        <section className="panel profile-section" aria-labelledby="profile-review-heading"><div className="match-section-heading"><h2 id="profile-review-heading">Client feedback</h2><span className="profile-rating"><Icon name="star" size={16} /> {student.rating} / 5</span></div><blockquote className="profile-review">“{student.review}”</blockquote><p className="profile-review-author">Example review from a fictional client</p><p className="muted profile-review-note">The average rating is example data based on {student.projects} projects.</p></section>
      </div>

      <aside className="profile-side" aria-label="Availability and selection"><section className="panel profile-selection-card"><div className="profile-availability"><span className="profile-availability-dot" />Available for a new task</div><h2>Work with {student.name.split(' ')[0]}?</h2><p>Start with a clear scope and schedule. Review all the details in the next step.</p><dl className="profile-availability-facts"><div><dt><Icon name="clock" size={17} />Availability</dt><dd>{student.available} hours per week</dd></div><div><dt><Icon name="calendar" size={17} />Your deadline</dt><dd>{formatDate(task.deadline)}</dd></div><div><dt><Icon name="briefcase" size={17} />Estimated workload</dt><dd>{task.hours || 'To be agreed'}{task.hours ? ' hours' : ''}</dd></div><div><dt>Your project budget</dt><dd>{euro(task.budget)}</dd></div></dl><p className="profile-planning-note">Agree the start date and final availability together.</p><button type="button" className="button primary" onClick={onSelect}>Select {student.name.split(' ')[0]}<Icon name="arrow-right" size={17} /></button><p className="profile-selection-note">Confirm the project in the next step. No payment is taken.</p></section>

        <section className="panel profile-reliability-card" aria-labelledby="profile-reliability-heading"><h2 id="profile-reliability-heading"><Icon name="shield" size={19} />Reliability</h2><dl><div><dt>Projects completed</dt><dd>{student.projects}</dd></div><div><dt>On-time delivery</dt><dd>{student.onTime}%</dd></div><div><dt>Average rating</dt><dd>{student.rating}<span> / 5</span></dd></div></dl><p>Example figures from {student.projects} fictional projects. A small project history does not guarantee future results.</p></section>
        <p className="profile-demo-note">All names, studies, evidence and reviews in this profile are fictional.</p>
      </aside></div>
      <Modal open={showVerification} title="What does TaskJuvo Verified mean?" onClose={() => setShowVerification(false)}><VerificationDetails /></Modal>
    </div>
  );
}
