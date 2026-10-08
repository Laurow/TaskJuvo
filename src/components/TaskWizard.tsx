'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CATEGORIES, DEMO_TASK, SKILLS, daysFromNow, euro, formatDate } from '../lib/data';
import type { TaskDraft } from '../lib/data';
import { Badge, Icon } from './ui';
import './wizard.css';

interface TaskWizardProps {
  draft: TaskDraft;
  onChange: (draft: TaskDraft) => void;
  onComplete: () => void;
  onCancel: () => void;
}

type FieldErrors = Partial<Record<keyof TaskDraft, string>>;

const STEPS = [
  { name: 'Task', detail: 'What do you need?', title: 'What do you need done?', description: 'Start with your business challenge. A clear brief helps us find the right talent for your task.' },
  { name: 'Outcome', detail: 'Define the deliverables', title: 'What should be delivered?', description: 'Define the finished result so the student knows exactly what a successful task looks like.' },
  { name: 'Skills', detail: 'The right expertise', title: 'Which skills does your task need?', description: 'Choose the skills essential to doing the task well. A few focused choices are enough.' },
  { name: 'Details', detail: 'Time and budget', title: 'Set clear expectations.', description: 'A clear budget and realistic timeline help you find a student who can deliver.' },
  { name: 'Review', detail: 'Ready to match', title: 'Ready to find your match?', description: 'Check your task before continuing. This is the brief your selected student will work from.' },
];

const SUGGESTIONS: Record<string, string[]> = {
  'Market research': DEMO_TASK.deliverables,
  Marketing: ['Review of current channels', 'Content plan for 4 weeks', 'Recommendations and next steps', 'Final presentation in PowerPoint'],
  'Data & analytics': ['Cleaned dataset', 'Interactive dashboard', 'Analysis of key insights', 'User guide and handover'],
  Finance: ['Financial model in Excel', 'Analysis of 3 scenarios', 'Investor pitch deck', 'Documentation of assumptions and sources'],
  Design: ['Design proposal in Figma', 'Clickable prototype', 'Summary of design decisions', 'Handover of design files'],
  Development: ['Working prototype', 'Summary of test results', 'Technical documentation', 'Handover of source code'],
  'Business development': ['Overview of potential customers', 'Analysis of growth opportunities', 'Action plan with next steps', 'Final presentation in PowerPoint'],
  Other: ['Concise report with findings', 'Recommendations and next steps', 'Presentation of the final result', 'User guide and handover'],
};

const FIELD_STEPS: Record<keyof TaskDraft, number> = {
  title: 0, category: 0, description: 0, deliverables: 1, skills: 2,
  budget: 3, deadline: 3, hours: 3, arrangement: 3, location: 3,
};

function validateStep(draft: TaskDraft, step: number): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 0) {
    if (!draft.title.trim()) errors.title = 'Give your task a clear title.';
    if (!CATEGORIES.includes(draft.category)) errors.category = 'Choose a category for your task.';
    if (!draft.description.trim()) errors.description = 'Describe the context and what you need.';
  }
  if (step === 1 && !draft.deliverables.some((item) => item.trim())) {
    errors.deliverables = 'Select or add at least one deliverable.';
  }
  if (step === 2 && !draft.skills.some((item) => item.trim())) {
    errors.skills = 'Select at least one required skill.';
  }
  if (step === 3) {
    if (!draft.budget.trim() || !Number.isFinite(Number(draft.budget)) || Number(draft.budget) <= 0) {
      errors.budget = 'Enter a project budget greater than €0.';
    }
    if (!draft.hours.trim() || !Number.isFinite(Number(draft.hours)) || Number(draft.hours) <= 0) {
      errors.hours = 'Enter an estimated effort greater than 0 hours.';
    }
    const parsedDate = new Date(`${draft.deadline}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== draft.deadline || draft.deadline <= daysFromNow(0)) {
      errors.deadline = 'Choose a valid deadline from tomorrow onwards.';
    }
    if (!['Remote', 'Hybrid', 'On-site'].includes(draft.arrangement)) {
      errors.arrangement = 'Choose where the student will work.';
    }
    if (draft.arrangement !== 'Remote' && !draft.location.trim()) {
      errors.location = 'Enter the city where the student will work.';
    }
  }
  return errors;
}

function displayDate(value: string) {
  try {
    return value ? formatDate(value) : 'To be confirmed';
  } catch {
    return 'To be confirmed';
  }
}

export default function TaskWizard({ draft, onChange, onComplete, onCancel }: TaskWizardProps) {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [customDeliverable, setCustomDeliverable] = useState('');
  const [customError, setCustomError] = useState('');
  const [addedDeliverables, setAddedDeliverables] = useState<string[]>([]);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastStep = useRef(0);
  const pendingFieldFocus = useRef<keyof TaskDraft | null>(null);
  const content = STEPS[step];
  const suggestions = SUGGESTIONS[draft.category] || SUGGESTIONS.Other;
  const deliverableOptions = Array.from(new Set([...suggestions, ...draft.deliverables, ...addedDeliverables]));
  const skillOptions = Array.from(new Set([...SKILLS, ...draft.skills]));
  const completedFields = [0, 1, 2, 3].filter((index) => Object.keys(validateStep(draft, index)).length === 0).length;

  useEffect(() => {
    if (pendingFieldFocus.current) {
      document.getElementById(`wizard-${pendingFieldFocus.current}`)?.focus();
      pendingFieldFocus.current = null;
    } else if (lastStep.current !== step) {
      headingRef.current?.focus();
    }
    lastStep.current = step;
  }, [step, errors]);

  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    onChange({ ...draft, [key]: value });
    if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function goToStep(next: number) {
    setErrors({});
    setCustomError('');
    setStep(next);
  }

  function failValidation(nextErrors: FieldErrors) {
    const firstKey = Object.keys(nextErrors)[0] as keyof TaskDraft;
    pendingFieldFocus.current = firstKey;
    setErrors(nextErrors);
    setStep(FIELD_STEPS[firstKey]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = step === 4
      ? Object.assign({}, ...[0, 1, 2, 3].map((index) => validateStep(draft, index))) as FieldErrors
      : validateStep(draft, step);
    if (Object.values(nextErrors).some(Boolean)) {
      failValidation(nextErrors);
      return;
    }
    setErrors({});
    if (step === 4) {
      onComplete();
      return;
    }
    setFurthestStep((previous) => Math.max(previous, step + 1));
    setStep(step + 1);
  }

  function toggleItem(key: 'deliverables' | 'skills', value: string) {
    const selected = draft[key];
    update(key, selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  function addDeliverable() {
    const value = customDeliverable.trim();
    if (!value) {
      setCustomError('Describe the deliverable you want to add first.');
      document.getElementById('wizard-custom-deliverable')?.focus();
      return;
    }
    const existing = deliverableOptions.find((item) => item.toLocaleLowerCase('en-GB') === value.toLocaleLowerCase('en-GB'));
    if (existing) {
      if (!draft.deliverables.includes(existing)) update('deliverables', [...draft.deliverables, existing]);
    } else {
      setAddedDeliverables((previous) => [...previous, value]);
      update('deliverables', [...draft.deliverables, value]);
    }
    setCustomDeliverable('');
    setCustomError('');
    document.getElementById('wizard-custom-deliverable')?.focus();
  }

  function loadDemo() {
    onChange({ ...DEMO_TASK, deliverables: [...DEMO_TASK.deliverables], skills: [...DEMO_TASK.skills], deadline: daysFromNow(10) });
    setErrors({});
    setCustomError('');
    setDemoLoaded(true);
  }

  function errorText(key: keyof TaskDraft) {
    return errors[key] ? <p className="wizard-error" id={`wizard-${key}-error`}><Icon name="alert" size={15} />{errors[key]}</p> : null;
  }

  function inputDescription(key: keyof TaskDraft, hint?: string) {
    return [hint, errors[key] ? `wizard-${key}-error` : undefined].filter(Boolean).join(' ') || undefined;
  }

  return (
    <div className="task-wizard">
      <div className="wizard-page-top">
        <div>
          <p className="eyebrow">FROM BRIEF TO RESULT</p>
          <h1 className="page-heading">Post a task</h1>
          <p className="muted wizard-intro">A clear task. The right talent. A step forward.</p>
        </div>
        <button className="button secondary wizard-demo-button" type="button" onClick={loadDemo}><Icon name="sparkles" size={17} />Fill in example</button>
      </div>
      <div className="wizard-demo-status" role="status">{demoLoaded && <><Icon name="check" size={15} />Example filled in. You can edit every detail.</>}</div>

      <div className="wizard-layout">
        <nav className="wizard-navigation" aria-label="Steps to post a task">
          <p className="wizard-navigation-label">YOUR TASK IN 5 STEPS</p>
          <ol className="wizard-steps">
            {STEPS.map((item, index) => {
              const isCompleted = index < furthestStep && index !== step && Object.keys(validateStep(draft, index)).length === 0;
              return (
                <li key={item.name} className={`${index === step ? 'current' : ''} ${isCompleted ? 'complete' : ''}`}>
                  <button type="button" onClick={() => goToStep(index)} disabled={index > furthestStep} aria-current={step === index ? 'step' : undefined} aria-label={`Step ${index + 1}: ${item.name}${isCompleted ? ', completed' : ''}`}>
                    <span className="wizard-step-number" aria-hidden="true">{isCompleted ? <Icon name="check" size={16} /> : index + 1}</span>
                    <span className="wizard-step-copy"><span>{item.name}</span><small>{item.detail}</small></span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="wizard-sidebar-note"><Icon name="shield-check" size={20} /><p>Clear expectations make a good working relationship.</p></div>
        </nav>

        <form className="panel wizard-form" onSubmit={handleSubmit} noValidate>
          <div className="wizard-form-body">
            <div className="wizard-step-heading">
              <p className="eyebrow">STEP {step + 1} OF 5</p>
              <h2 ref={headingRef} tabIndex={-1} className="wizard-step-title">{content.title}</h2>
              <p>{content.description}</p>
            </div>
            {Object.values(errors).some(Boolean) && <div className="wizard-error-summary" role="alert"><Icon name="alert" size={18} /><span>Check the highlighted fields to continue.</span></div>}

            {step === 0 && <div className="wizard-fields">
              <div className="field">
                <label htmlFor="wizard-title">Task title <span className="wizard-required">(required)</span></label>
                <input className="input" id="wizard-title" value={draft.title} onChange={(event) => update('title', event.target.value)} maxLength={120} placeholder="e.g. competitor analysis for the German market" required aria-invalid={Boolean(errors.title)} aria-describedby={inputDescription('title', 'wizard-title-hint')} />
                <p className="wizard-field-hint" id="wizard-title-hint">Briefly describe the task and its purpose.</p>
                {errorText('title')}
              </div>
              <div className="field">
                <label htmlFor="wizard-category">Category <span className="wizard-required">(required)</span></label>
                <select className="input" id="wizard-category" value={draft.category} onChange={(event) => update('category', event.target.value)} required aria-invalid={Boolean(errors.category)} aria-describedby={inputDescription('category')}>
                  {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                {errorText('category')}
              </div>
              <div className="field">
                <label htmlFor="wizard-description">Context and challenge <span className="wizard-required">(required)</span></label>
                <textarea className="textarea" id="wizard-description" value={draft.description} onChange={(event) => update('description', event.target.value)} rows={5} maxLength={3000} placeholder="What prompted this task? What is your team struggling with? What do you want to achieve?" required aria-invalid={Boolean(errors.description)} aria-describedby={inputDescription('description', 'wizard-description-hint')} />
                <div className="wizard-field-footer"><p className="wizard-field-hint" id="wizard-description-hint">Share the context the student needs to get started.</p><span>{draft.description.length}/3000</span></div>
                {errorText('description')}
              </div>
              <div className="wizard-tip"><span className="wizard-tip-icon"><Icon name="info" size={20} /></span><div><strong>Keep the task focused and specific.</strong><p>For example: “Compare prices for 5 competitors” gives a clearer direction than “Help with marketing”.</p></div></div>
            </div>}

            {step === 1 && <div className="wizard-fields">
              <fieldset id="wizard-deliverables" tabIndex={-1} className="wizard-choice-fieldset" aria-describedby={inputDescription('deliverables', 'wizard-deliverables-hint')} aria-invalid={Boolean(errors.deliverables)}>
                <legend>Deliverables <span className="wizard-required">(at least one)</span></legend>
                <p className="wizard-field-hint" id="wizard-deliverables-hint">Select relevant deliverables or add your own.</p>
                <div className="wizard-deliverable-options">
                  {deliverableOptions.map((item) => <label className={`wizard-deliverable-option ${draft.deliverables.includes(item) ? 'selected' : ''}`} key={item}>
                    <input type="checkbox" checked={draft.deliverables.includes(item)} onChange={() => toggleItem('deliverables', item)} />
                    <span>{item}</span>
                  </label>)}
                </div>
                {errorText('deliverables')}
              </fieldset>
              <div className="field">
                <label htmlFor="wizard-custom-deliverable">Add your own deliverable</label>
                <div className="wizard-add-row"><input className="input" id="wizard-custom-deliverable" value={customDeliverable} onChange={(event) => { setCustomDeliverable(event.target.value); setCustomError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addDeliverable(); } }} maxLength={140} placeholder="e.g. a report with 3 recommendations" aria-invalid={Boolean(customError)} aria-describedby={customError ? 'wizard-custom-error' : undefined} /><button type="button" className="button secondary" onClick={addDeliverable}><Icon name="plus" size={17} /><span>Add</span></button></div>
                {customError && <p className="wizard-error" id="wizard-custom-error" role="alert">{customError}</p>}
              </div>
              <div className="wizard-tip"><span className="wizard-tip-icon"><Icon name="checklist" size={20} /></span><div><strong>Make the finish line clear.</strong><p>A file, analysis or design is easier to review than an open-ended activity.</p></div></div>
            </div>}

            {step === 2 && <div className="wizard-fields">
              <fieldset id="wizard-skills" tabIndex={-1} className="wizard-choice-fieldset" aria-describedby={inputDescription('skills', 'wizard-skills-hint')} aria-invalid={Boolean(errors.skills)}>
                <legend>Required skills <span className="wizard-required">(at least one)</span></legend>
                <p className="wizard-field-hint" id="wizard-skills-hint">Select all the skills your task needs.</p>
                <div className="wizard-skill-options">
                  {skillOptions.map((skill) => <label key={skill} className={`wizard-skill-chip ${draft.skills.includes(skill) ? 'selected' : ''}`}><input type="checkbox" checked={draft.skills.includes(skill)} onChange={() => toggleItem('skills', skill)} /><span><Icon name={draft.skills.includes(skill) ? 'check' : 'plus'} size={15} />{skill}</span></label>)}
                </div>
                {errorText('skills')}
                <p className="wizard-selected-count" role="status">{draft.skills.length} {draft.skills.length === 1 ? 'skill selected' : 'skills selected'}</p>
              </fieldset>
              <div className="wizard-verification-note"><span className="wizard-verification-icon"><Icon name="shield-check" size={24} /></span><div><Badge variant="green">TaskJuvo Verified</Badge><h3>Skills backed by evidence.</h3><p>Explore relevant projects and experience alongside each match’s skills to assess their fit for your task.</p></div></div>
            </div>}

            {step === 3 && <div className="wizard-fields">
              <div className="wizard-two-columns">
                <div className="field"><label htmlFor="wizard-deadline">Deadline <span className="wizard-required">(required)</span></label><input className="input" id="wizard-deadline" type="date" min={daysFromNow(1)} value={draft.deadline} onChange={(event) => update('deadline', event.target.value)} required aria-invalid={Boolean(errors.deadline)} aria-describedby={inputDescription('deadline', 'wizard-deadline-hint')} /><p className="wizard-field-hint" id="wizard-deadline-hint">When should the result be ready?</p>{errorText('deadline')}</div>
                <div className="field"><label htmlFor="wizard-hours">Estimated effort <span className="wizard-required">(required)</span></label><div className="wizard-unit-input"><input className="input" id="wizard-hours" type="number" inputMode="decimal" min="0.5" step="0.5" value={draft.hours} onChange={(event) => update('hours', event.target.value)} required aria-invalid={Boolean(errors.hours)} aria-describedby={inputDescription('hours', 'wizard-hours-hint')} /><span aria-hidden="true">hours</span></div><p className="wizard-field-hint" id="wizard-hours-hint">Total estimated hours for the whole task.</p>{errorText('hours')}</div>
              </div>
              <div className="field"><label htmlFor="wizard-budget">Total project budget <span className="wizard-required">(required)</span></label><div className="wizard-unit-input currency"><span aria-hidden="true">€</span><input className="input" id="wizard-budget" type="number" inputMode="decimal" min="0.01" step="0.01" value={draft.budget} onChange={(event) => update('budget', event.target.value)} required aria-invalid={Boolean(errors.budget)} aria-describedby={inputDescription('budget', 'wizard-budget-hint')} /></div><p className="wizard-field-hint" id="wizard-budget-hint">A fixed amount for the agreed deliverables.</p>{errorText('budget')}</div>
              <fieldset className="wizard-choice-fieldset" id="wizard-arrangement" tabIndex={-1} aria-invalid={Boolean(errors.arrangement)} aria-describedby={inputDescription('arrangement')}><legend>Where will the work happen?</legend><div className="wizard-arrangements">{[{ value: 'Remote', icon: 'monitor', detail: 'Fully remote' }, { value: 'Hybrid', icon: 'briefcase', detail: 'Remote and on-site' }, { value: 'On-site', icon: 'map-pin', detail: 'At your business' }].map((item) => <label key={item.value} className={`wizard-arrangement ${draft.arrangement === item.value ? 'selected' : ''}`}><input type="radio" name="wizard-arrangement" value={item.value} checked={draft.arrangement === item.value} onChange={() => update('arrangement', item.value)} /><Icon name={item.icon} size={21} /><strong>{item.value}</strong><span>{item.detail}</span></label>)}</div>{errorText('arrangement')}</fieldset>
              {draft.arrangement !== 'Remote' && <div className="field"><label htmlFor="wizard-location">City <span className="wizard-required">(required)</span></label><input className="input" id="wizard-location" value={draft.location} onChange={(event) => update('location', event.target.value)} placeholder="e.g. Utrecht" maxLength={100} required aria-invalid={Boolean(errors.location)} aria-describedby={inputDescription('location')} />{errorText('location')}</div>}
            </div>}

            {step === 4 && <div className="wizard-review">
              <section className="wizard-review-section"><div className="wizard-review-section-top"><p className="section-label">THE TASK</p><button className="button ghost small" type="button" onClick={() => goToStep(0)} aria-label="Edit the task title, category and context"><Icon name="edit" size={14} />Edit</button></div><Badge>{draft.category}</Badge><h3>{draft.title}</h3><p className="wizard-review-description">{draft.description}</p></section>
              <section className="wizard-review-section"><div className="wizard-review-section-top"><p className="section-label">AGREED DELIVERABLES</p><button className="button ghost small" type="button" onClick={() => goToStep(1)} aria-label="Edit deliverables"><Icon name="edit" size={14} />Edit</button></div><ul className="wizard-review-deliverables">{draft.deliverables.map((item) => <li key={item}><span><Icon name="check" size={14} /></span>{item}</li>)}</ul></section>
              <section className="wizard-review-section"><div className="wizard-review-section-top"><p className="section-label">REQUIRED SKILLS</p><button className="button ghost small" type="button" onClick={() => goToStep(2)} aria-label="Edit required skills"><Icon name="edit" size={14} />Edit</button></div><div className="wizard-review-skills">{draft.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></section>
              <section className="wizard-review-section"><div className="wizard-review-section-top"><p className="section-label">PRACTICAL DETAILS</p><button className="button ghost small" type="button" onClick={() => goToStep(3)} aria-label="Edit the timeline, budget and work arrangement"><Icon name="edit" size={14} />Edit</button></div><dl className="wizard-review-practical"><div><dt>Project budget</dt><dd>{euro(draft.budget)}</dd></div><div><dt>Deadline</dt><dd>{displayDate(draft.deadline)}</dd></div><div><dt>Estimated effort</dt><dd>{draft.hours} hours in total</dd></div><div><dt>Work arrangement</dt><dd>{draft.arrangement}{draft.arrangement !== 'Remote' && ` · ${draft.location}`}</dd></div></dl></section>
              <div className="wizard-review-next"><Icon name="users" size={23} /><div><strong>Next: 3 students who fit your task.</strong><p>Compare their experience and evidence of skills. You choose who to work with.</p></div></div>
            </div>}
          </div>

          <div className="wizard-form-footer">
            <button className="button secondary" type="button" onClick={step === 0 ? onCancel : () => goToStep(step - 1)}><Icon name="arrow-left" size={16} />{step === 0 ? 'Back' : 'Previous step'}</button>
            <button className="button primary" type="submit">{step === 4 ? 'Find matching talent' : 'Next step'}<Icon name="arrow-right" size={17} /></button>
          </div>
        </form>

        <aside className="wizard-summary" aria-label="Live summary of your task">
          <div className="panel wizard-summary-card">
            <div className="wizard-summary-heading"><p className="section-label">YOUR TASK</p><span className="wizard-summary-dot" aria-hidden="true" /></div>
            <h2>{draft.title.trim() || 'A clear result starts here.'}</h2>
            {draft.title.trim() && <Badge>{draft.category}</Badge>}
            <p className="wizard-summary-description">{draft.title.trim() ? 'Your brief, in one place.' : 'Your task takes shape as you complete each step.'}</p>
            <dl className="wizard-summary-details"><div><dt><Icon name="wallet" size={16} />Project budget</dt><dd>{Number(draft.budget) > 0 && Number.isFinite(Number(draft.budget)) ? euro(draft.budget) : 'To be confirmed'}</dd></div><div><dt><Icon name="calendar" size={16} />Deadline</dt><dd>{displayDate(draft.deadline)}</dd></div><div><dt><Icon name="clock" size={16} />Estimated effort</dt><dd>{Number(draft.hours) > 0 ? `${draft.hours} hours` : 'To be confirmed'}</dd></div><div><dt><Icon name="map-pin" size={16} />Work arrangement</dt><dd>{draft.arrangement}{draft.arrangement !== 'Remote' && draft.location ? ` · ${draft.location}` : ''}</dd></div></dl>
            <div className="wizard-summary-outcomes"><p className="section-label">DELIVERABLES <span>{draft.deliverables.length}</span></p>{draft.deliverables.length ? <ul>{draft.deliverables.map((item) => <li key={item}><Icon name="check" size={13} /><span>{item}</span></li>)}</ul> : <p className="wizard-summary-empty">Add your deliverables in step 2.</p>}</div>
            <div className="wizard-summary-skills"><p className="section-label">SKILLS</p>{draft.skills.length ? <div>{draft.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div> : <p className="wizard-summary-empty">Choose your skills in step 3.</p>}</div>
            <div className="wizard-summary-progress"><p className="wizard-completeness-label">Brief completeness</p><div role="progressbar" aria-label="Brief completeness" aria-valuemin={0} aria-valuemax={4} aria-valuenow={completedFields} aria-valuetext={`${completedFields} of 4 sections ready`}><span style={{ width: `${completedFields * 25}%` }} /></div><p>{completedFields} of 4 sections ready</p></div>
          </div>
          <p className="wizard-summary-reassurance"><Icon name="shield-check" size={16} />You stay in control. Choose a student after reviewing your matches.</p>
        </aside>
      </div>
    </div>
  );
}
