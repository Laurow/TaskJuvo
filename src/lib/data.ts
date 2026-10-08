export type View = 'home' | 'overzicht' | 'taak' | 'matches' | 'profiel' | 'bevestiging' | 'project' | 'talent' | 'feedback' | 'screens';

export interface TaskDraft {
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  skills: string[];
  budget: string;
  deadline: string;
  hours: string;
  arrangement: string;
  location: string;
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  study: string;
  university: string;
  skills: string[];
  score: number;
  available: number;
  projects: number;
  onTime: number;
  rating: string;
  reason: string;
  evidence: { title: string; description: string; tag: string }[];
  review: string;
}

export function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export const DEFAULT_TASK: TaskDraft = {
  title: '', category: 'Market research', description: '', deliverables: [], skills: [],
  budget: '300', deadline: daysFromNow(10), hours: '12', arrangement: 'Remote', location: 'Utrecht',
};

export const DEMO_TASK: TaskDraft = {
  ...DEFAULT_TASK,
  title: 'Competitor analysis for expansion into Germany',
  description: 'We are taking our sustainable products into the German market. We need a clear analysis of the main competitors, their pricing and positioning, so we can make an informed decision about our next move.',
  deliverables: ['Overview of 5 relevant competitors', 'Pricing comparison in Excel', 'Market positioning recommendations', 'Final presentation in PowerPoint'],
  skills: ['Market research', 'Excel', 'PowerPoint'],
};

export const DATA_TASK: TaskDraft = {
  ...DEFAULT_TASK,
  title: 'Customer insights in one dashboard', category: 'Data & analytics', budget: '600', deadline: daysFromNow(21), hours: '24',
  description: 'Bring our customer and revenue data together in a clear Power BI dashboard, so our team can spot trends and make better decisions.',
  deliverables: ['Cleaned and documented dataset', 'Interactive Power BI dashboard', 'Practical guide and handover'],
  skills: ['Power BI', 'Excel'],
};

export const CATEGORIES = ['Marketing', 'Data & analytics', 'Finance', 'Market research', 'Design', 'Development', 'Business development', 'Other'];
export const SKILLS = ['Market research', 'Excel', 'PowerPoint', 'Python', 'Canva', 'Figma', 'Power BI', 'Financial modelling', 'Google Analytics', 'React', 'SQL', 'Copywriting'];

export const STUDENTS: Student[] = [
  {
    id: 'emma', name: 'Emma de Vries', initials: 'EV', color: 'peach', role: 'Marketing & research', study: 'MSc Marketing Management', university: 'Erasmus University Rotterdam',
    skills: ['Market research', 'Excel', 'PowerPoint', 'Google Analytics'], score: 94, available: 10, projects: 4, onTime: 100, rating: '4.8',
    reason: 'European market research experience, clear presentations and 10 hours of availability per week.',
    evidence: [
      { title: 'Market entry for a sustainable brand', description: 'Analysis of 8 competitors, a pricing benchmark and actionable positioning recommendations for the Belgian market.', tag: 'Business project' },
      { title: 'Consumer behaviour in Germany', description: 'Research with 120 respondents, translated into evidence-based marketing recommendations. Graded 8.5 out of 10.', tag: 'Academic project' },
    ],
    review: 'Emma asked the right questions and delivered clear recommendations we could put to work straight away.',
  },
  {
    id: 'lucas', name: 'Lucas van Dijk', initials: 'LD', color: 'blue', role: 'Data & finance', study: 'MSc Business Analytics', university: 'University of Amsterdam',
    skills: ['Excel', 'Python', 'Power BI', 'Financial modelling'], score: 89, available: 12, projects: 6, onTime: 100, rating: '4.9',
    reason: 'Strong pricing analysis and data visualisation skills. A good fit when the focus is on the numbers.',
    evidence: [
      { title: 'Pricing dashboard for an online store', description: 'An interactive dashboard tracking prices across 12 competitors, with a clear handover guide.', tag: 'Business project' },
      { title: 'Financial scenario analysis', description: 'An Excel model comparing three growth scenarios, with transparent assumptions and sources.', tag: 'Academic project' },
    ],
    review: 'Very organised. The dashboard made sense to everyone on our team.',
  },
  {
    id: 'sophie', name: 'Sophie Bakker', initials: 'SB', color: 'mint', role: 'Strategy & research', study: 'BSc International Business', university: 'Utrecht University',
    skills: ['Market research', 'PowerPoint', 'Excel', 'Copywriting'], score: 86, available: 8, projects: 3, onTime: 100, rating: '4.7',
    reason: 'Relevant customer research experience and a talent for turning findings into clear reports.',
    evidence: [
      { title: 'Customer research for a local start-up', description: '15 customer interviews and a report with practical market entry recommendations.', tag: 'Business project' },
      { title: 'International growth strategy', description: 'An evidence-based strategy presentation for a European consumer market.', tag: 'Academic project' },
    ],
    review: 'Sophie kept us informed and made a complex research project easy to follow.',
  },
  {
    id: 'noah', name: 'Noah Jansen', initials: 'NJ', color: 'purple', role: 'Development', study: 'MSc Computer Science', university: 'TU Delft',
    skills: ['React', 'Python', 'SQL'], score: 92, available: 10, projects: 5, onTime: 100, rating: '4.9',
    reason: 'Builds accessible prototypes and documents practical solutions for small teams.',
    evidence: [{ title: 'Booking platform prototype', description: 'A responsive web application with clear handover documentation.', tag: 'Business project' }],
    review: 'Noah made it easy for our team to test and understand the prototype.',
  },
  {
    id: 'aya', name: 'Aya El Amrani', initials: 'AE', color: 'yellow', role: 'Design', study: 'MSc Industrial Design', university: 'TU Eindhoven',
    skills: ['Figma', 'Canva', 'PowerPoint'], score: 91, available: 12, projects: 4, onTime: 100, rating: '4.8',
    reason: 'Turns complex stories into clear designs and compelling presentations.',
    evidence: [{ title: 'Pitch deck for an impact business', description: 'A clear visual story across 12 slides, with a reusable presentation template.', tag: 'Business project' }],
    review: 'Our story now makes sense from the first slide to the last.',
  },
];

export const TASK_TEMPLATES = [
  { title: 'Competitor analysis', category: 'Market research', icon: 'search', budget: '300', duration: '10 days', description: 'Make an informed next move in a new market.' },
  { title: 'Investor pitch deck', category: 'Finance', icon: 'presentation', budget: '450', duration: '14 days', description: 'Tell your story with a clear, compelling pitch.' },
  { title: 'Power BI dashboard', category: 'Data & analytics', icon: 'chart', budget: '600', duration: '21 days', description: 'Turn scattered data into useful insights.' },
  { title: 'Social media audit', category: 'Marketing', icon: 'megaphone', budget: '250', duration: '7 days', description: 'Find the opportunities your channels are missing.' },
  { title: 'Customer research report', category: 'Market research', icon: 'users', budget: '400', duration: '14 days', description: 'Understand what really matters to your customers.' },
];

export function euro(value: string | number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function formatDate(value: string) {
  if (!value) return 'To be confirmed';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(new Date(value + 'T12:00:00'));
}

export function getMatches(task: TaskDraft): Student[] {
  if (task.category === 'Development') return [STUDENTS[3], STUDENTS[1], STUDENTS[4]];
  if (task.category === 'Design') return [STUDENTS[4], STUDENTS[0], STUDENTS[3]];
  if (task.category === 'Data & analytics' || task.category === 'Finance') return [STUDENTS[1], STUDENTS[2], STUDENTS[0]];
  return STUDENTS.slice(0, 3);
}
