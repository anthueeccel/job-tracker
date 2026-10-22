import { JobOpportunity } from '../types/job';

const STORAGE_KEY = 'vagas_tracker_pro_data_v4_en';

export const INITIAL_JOBS: JobOpportunity[] = [
  // JobsTech
  {
    id: 'tech-1',
    title: 'Senior Fullstack Engineer (React / Node.js / Cloud)',
    company: 'Cabify Tech',
    category: 'JobsTech',
    status: 'interviewing',
    stages: [
      {
        id: 'stage-1-1',
        name: 'Initial Recruiter Screen & Fit',
        completed: true,
        date: '2026-10-10',
        time: '11:00',
        notes: 'Carla from recruiting was very engaging. Discussed micro-frontends and distributed systems background.'
      },
      {
        id: 'stage-1-2',
        name: 'Live Coding & System Architecture',
        completed: true,
        date: '2026-10-16',
        time: '15:30',
        notes: 'Practical coding challenge on concurrency and state management. Strong positive feedback from senior staff.'
      },
      {
        id: 'stage-1-3',
        name: 'VP of Engineering Final Round',
        completed: false,
        date: '2026-10-24',
        time: '10:00',
        notes: 'Culture fit, mentorship philosophy, and cross-team collaboration across global time zones.'
      }
    ],
    location: 'Madrid, Spain / Remote Europe',
    workModel: 'remote',
    jobUrl: 'https://linkedin.com/jobs/view/cabify-senior-fullstack',
    salaryCurrency: '€',
    salaryExpected: '€70,000 - €78,000 / yr',
    salaryOffered: '€74,000 / yr + Sanitas Health Insurance + Equity',
    benefits: 'Remote stipend, €11/day meal vouchers, annual learning budget of €1,500',
    appliedDate: '2026-10-05',
    lastActivityDate: '2026-10-16',
    nextFollowUpDate: '2026-10-22',
    followUpDaysInterval: 5,
    contacts: [
      {
        name: 'Carla Mendez',
        role: 'Senior Tech Recruiter',
        email: 'carla.mendez@example-cabify.com',
        phone: '+34 612 345 678',
        linkedin: 'https://linkedin.com/in/carla-mendez-tech-recruiter',
        notes: 'Very responsive on WhatsApp during European business hours.'
      }
    ],
    resumes: [
      {
        id: 'cv-1',
        fileName: 'CV_Senior_Fullstack_Engineer_EN.pdf',
        fileSize: '185 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-05',
        versionLabel: 'Cloud & Distributed Systems Edition',
        tailoredFocus: 'Highlighted high-throughput microservices, React 19 architecture, and European payment gateway integrations.'
      }
    ],
    notes: [
      {
        id: 'note-1-1',
        createdAt: '2026-10-10T14:30:00Z',
        type: 'interview',
        content: 'Engineering department is expanding 30% this quarter, migrating core services to Go and Node.'
      },
      {
        id: 'note-1-2',
        createdAt: '2026-10-16T17:00:00Z',
        type: 'feedback',
        content: 'System design was praised, especially Redis multi-tier caching and circuit breaker patterns.'
      }
    ],
    priority: 'dream_job',
    rating: 5
  },
  {
    id: 'tech-2',
    title: 'Frontend Architect & Tech Lead',
    company: 'Glovo / Delivery Hero',
    category: 'JobsTech',
    status: 'tech_challenge',
    stages: [
      {
        id: 'stage-2-1',
        name: 'Screening with Talent Partner',
        completed: true,
        date: '2026-10-12',
        time: '14:00',
        notes: 'Quick 30-min alignment on salary expectations, relocation, and remote setup.'
      },
      {
        id: 'stage-2-2',
        name: 'Take-Home Practical Challenge (48h)',
        completed: false,
        date: '2026-10-22',
        time: '18:00',
        notes: 'Build a real-time order tracking dashboard with WebSockets, optimistic UI, and test coverage.'
      },
      {
        id: 'stage-2-3',
        name: 'Technical Code Defense with Staff Engineers',
        completed: false,
        notes: 'Discussion of trade-offs, state management, and accessibility.'
      },
      {
        id: 'stage-2-4',
        name: 'Executive Leadership & Offer Discussion',
        completed: false
      }
    ],
    location: 'Barcelona, Spain',
    workModel: 'hybrid',
    jobUrl: 'https://jobs.glovoapp.com',
    salaryCurrency: '€',
    salaryExpected: '€75,000 - €85,000 / yr',
    benefits: 'Gympass, 50% discount on Glovo Prime, 10% annual performance bonus',
    appliedDate: '2026-10-08',
    lastActivityDate: '2026-10-14',
    nextFollowUpDate: '2026-10-21',
    followUpDaysInterval: 7,
    contacts: [
      {
        name: 'Jordi Torrent',
        role: 'Lead Engineering Recruiter',
        email: 'jordi.torrent@example-glovo.com',
        phone: '+34 689 987 654',
        linkedin: 'https://linkedin.com/in/jordi-torrent-recruiting'
      }
    ],
    resumes: [
      {
        id: 'cv-2',
        fileName: 'CV_Frontend_Architect_International.pdf',
        fileSize: '210 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-08',
        versionLabel: 'International English Version',
        tailoredFocus: 'Core Web Vitals, enterprise Design Systems, and advanced TypeScript patterns.'
      }
    ],
    notes: [
      {
        id: 'note-2-1',
        createdAt: '2026-10-14T11:00:00Z',
        type: 'general',
        content: 'Take-home repository shared via GitHub Classroom. Deadline is October 22nd.'
      }
    ],
    priority: 'high',
    rating: 4
  },
  {
    id: 'tech-3',
    title: 'Senior Cloud & Backend Developer',
    company: 'Amadeus IT Group',
    category: 'JobsTech',
    status: 'applied',
    stages: [
      {
        id: 'stage-3-1',
        name: 'ATS Resume Review',
        completed: false,
        date: '2026-10-23',
        time: '11:00',
        notes: 'Awaiting profile screening by the Global Talent Acquisition team.'
      },
      {
        id: 'stage-3-2',
        name: 'Technical Competency Interview',
        completed: false
      },
      {
        id: 'stage-3-3',
        name: 'Panel with Engineering Director',
        completed: false
      }
    ],
    location: 'Madrid / Nice / Remote',
    workModel: 'hybrid',
    salaryCurrency: '€',
    salaryExpected: '€68,000 / yr',
    appliedDate: '2026-10-15',
    lastActivityDate: '2026-10-15',
    nextFollowUpDate: '2026-10-23',
    followUpDaysInterval: 8,
    contacts: [],
    resumes: [
      {
        id: 'cv-3',
        fileName: 'CV_Backend_Cloud_AWS.pdf',
        fileSize: '190 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-15',
        versionLabel: 'Distributed Systems & AWS Focus'
      }
    ],
    notes: [
      {
        id: 'note-3-1',
        createdAt: '2026-10-15T09:00:00Z',
        type: 'research',
        content: 'Major tech leader in aviation and travel. Deep usage of Kafka, Kubernetes, and Golang/Java.'
      }
    ],
    priority: 'medium',
    rating: 3
  },

  // JobsMgm
  {
    id: 'mgm-1',
    title: 'Engineering Manager - Core Platform',
    company: 'Typeform',
    category: 'JobsMgm',
    status: 'interviewing',
    stages: [
      {
        id: 'stage-m1-1',
        name: 'People Partner Introductory Screen',
        completed: true,
        date: '2026-10-09',
        time: '16:00',
        notes: 'Outstanding cultural fit. Discussed psychological safety, servant leadership, and remote team rituals.'
      },
      {
        id: 'stage-m1-2',
        name: 'Leadership & People Management Case Defense',
        completed: true,
        date: '2026-10-17',
        time: '17:30',
        notes: 'Action plan presentation to turn around team disengagement and resolve senior engineer friction.'
      },
      {
        id: 'stage-m1-3',
        name: 'Executive Interview with VP of Engineering & CTO',
        completed: false,
        date: '2026-10-25',
        time: '11:00',
        notes: 'Strategic discussion on 2027 headcount planning, engineering velocity, and OKR delivery.'
      }
    ],
    location: 'Barcelona / Remote Spain',
    workModel: 'remote',
    jobUrl: 'https://typeform.com/careers',
    salaryCurrency: '€',
    salaryExpected: '€88,000 - €98,000 / yr',
    salaryOffered: '€92,000 + 12% Annual Bonus',
    benefits: '100% remote flexibility, €1,000 home office setup, 28 paid vacation days',
    appliedDate: '2026-10-03',
    lastActivityDate: '2026-10-17',
    nextFollowUpDate: '2026-10-23',
    followUpDaysInterval: 6,
    contacts: [
      {
        name: 'Sophie Laurent',
        role: 'Director of People Operations',
        email: 'sophie.laurent@example-typeform.com',
        phone: '+34 633 444 555',
        linkedin: 'https://linkedin.com/in/sophie-laurent-people'
      }
    ],
    resumes: [
      {
        id: 'cv-m1',
        fileName: 'CV_Engineering_Manager_Global_EN.pdf',
        fileSize: '240 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-03',
        versionLabel: 'Agile Engineering Management & People Care',
        tailoredFocus: 'Highlighted scaling teams from 6 to 18 engineers, improving DORA deployment frequency, and 95% retention.'
      }
    ],
    notes: [
      {
        id: 'note-m1-1',
        createdAt: '2026-10-09T16:00:00Z',
        type: 'interview',
        content: 'They emphasize radical candor, quarterly career mapping, and autonomous technical ownership.'
      },
      {
        id: 'note-m1-2',
        createdAt: '2026-10-17T18:00:00Z',
        type: 'feedback',
        content: 'VP of People praised the clear RACI matrix and structured career ladder proposed in the leadership case.'
      }
    ],
    priority: 'dream_job',
    rating: 5
  },
  {
    id: 'mgm-2',
    title: 'Senior Technical Product Manager',
    company: 'ManoMano Tech',
    category: 'JobsMgm',
    status: 'screening',
    stages: [
      {
        id: 'stage-m2-1',
        name: 'Senior Recruiter Screening',
        completed: true,
        date: '2026-10-14',
        time: '15:00',
        notes: 'Validated past experience with B2B marketplace scaling, search algorithms, and high-volume data platforms.'
      },
      {
        id: 'stage-m2-2',
        name: 'Product Sense & Discovery Deep-Dive',
        completed: false,
        date: '2026-10-27',
        time: '14:30',
        notes: 'Conversion rate optimization, RICE framework, and technical roadmap discovery.'
      },
      {
        id: 'stage-m2-3',
        name: 'Cultural Alignment with Heads of Design & Business',
        completed: false
      }
    ],
    location: 'Barcelona, Spain',
    workModel: 'hybrid',
    salaryCurrency: '€',
    salaryExpected: '€78,000 / yr',
    appliedDate: '2026-10-10',
    lastActivityDate: '2026-10-14',
    nextFollowUpDate: '2026-10-21',
    followUpDaysInterval: 7,
    contacts: [
      {
        name: 'Matteo Rossi',
        role: 'Talent Acquisition Partner',
        email: 'matteo.rossi@example-manomano.com',
        linkedin: 'https://linkedin.com/in/matteo-rossi-product-recruiter'
      }
    ],
    resumes: [
      {
        id: 'cv-m2',
        fileName: 'CV_Technical_Product_Manager_EN.pdf',
        fileSize: '198 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-10',
        versionLabel: 'Product Management & Business Analytics Focus'
      }
    ],
    notes: [
      {
        id: 'note-m2-1',
        createdAt: '2026-10-14T15:00:00Z',
        type: 'question',
        content: 'Ask in the next round about autonomy regarding French corporate OKRs versus local product squads.'
      }
    ],
    priority: 'high',
    rating: 4
  },
  {
    id: 'mgm-3',
    title: 'Scrum Master & Agile Delivery Lead',
    company: 'Santander Digital / Tech',
    category: 'JobsMgm',
    status: 'applied',
    stages: [
      {
        id: 'stage-m3-1',
        name: 'Profile Screening & Certification Verification',
        completed: false,
        date: '2026-10-26',
        time: '09:30',
        notes: 'Verification of Agile leadership credentials and team scaling experience.'
      },
      {
        id: 'stage-m3-2',
        name: 'Interview with Agile Chapter Lead',
        completed: false
      },
      {
        id: 'stage-m3-3',
        name: 'Cross-Squad Delivery Impediment Panel',
        completed: false
      }
    ],
    location: 'Madrid, Spain',
    workModel: 'hybrid',
    salaryCurrency: '€',
    salaryExpected: '€62,000 - €70,000 / yr',
    appliedDate: '2026-10-18',
    lastActivityDate: '2026-10-18',
    nextFollowUpDate: '2026-10-25',
    followUpDaysInterval: 7,
    contacts: [],
    resumes: [
      {
        id: 'cv-m3',
        fileName: 'CV_Agile_Coach_Delivery_Lead.pdf',
        fileSize: '220 KB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-18',
        versionLabel: 'Flow Metrics, Kanban, and Scrum Master Focus'
      }
    ],
    notes: [],
    priority: 'medium',
    rating: 3
  }
];

export const KNOWN_STORAGE_KEYS = [
  'vagas_tracker_pro_data_v4_en',
  'vagas_tracker_pro_data_v4',
  'vagas_tracker_pro_data_v3_en',
  'vagas_tracker_pro_data_v3',
  'vagas_tracker_pro_data_v2',
  'vagas_tracker_pro_data_v1',
  'vagas_tracker_pro_data',
  'vagas_tracker_data',
  'vagas_tracker',
  'jobtracker_pro_data',
  'jobtracker_data',
  'job_tracker_data',
  'jobtracker_jobs',
  'jobs'
];

export interface StorageRecoveryResult {
  recoveredJobs: JobOpportunity[];
  sourceKeys: string[];
  totalFound: number;
  jobsMgmCount: number;
  jobsTechCount: number;
}

/**
 * Scans all browser localStorage keys for any previous JobTracker or VagasTracker records,
 * normalizing category labels (e.g. 'JobsMgm', 'management') and restoring lost applications.
 */
export function findAndRecoverAllLocalJobs(): StorageRecoveryResult {
  const jobMap = new Map<string, JobOpportunity>();
  const sourceKeys: string[] = [];

  const keysToInspect = new Set<string>(KNOWN_STORAGE_KEYS);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) keysToInspect.add(key);
      }
    }
  } catch (e) {
    // Ignore localStorage access restrictions
  }

  keysToInspect.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || (!raw.startsWith('[') && !raw.startsWith('{'))) return;
      const parsed = JSON.parse(raw);
      const candidates: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.jobs)
        ? parsed.jobs
        : Array.isArray(parsed?.data)
        ? parsed.data
        : [];

      if (Array.isArray(candidates) && candidates.length > 0) {
        let validJobCount = 0;
        candidates.forEach((item, index) => {
          if (item && typeof item === 'object' && (item.company || item.title)) {
            validJobCount++;
            const id = item.id || `recovered-${key}-${index}-${Date.now()}`;
            
            // Normalize Category
            const rawCat = String(item.category || '');
            let normalizedCat: 'JobsTech' | 'JobsMgm' | 'Other' = 'JobsTech';
            const catLower = rawCat.toLowerCase();
            if (
              catLower.includes('mgm') ||
              catLower.includes('manag') ||
              catLower.includes('lead') ||
              catLower.includes('product') ||
              catLower.includes('scrum') ||
              catLower.includes('agile') ||
              rawCat === 'JobsMgm'
            ) {
              normalizedCat = 'JobsMgm';
            } else if (
              catLower.includes('tech') ||
              catLower.includes('eng') ||
              catLower.includes('dev') ||
              catLower.includes('soft') ||
              catLower.includes('cloud') ||
              rawCat === 'JobsTech'
            ) {
              normalizedCat = 'JobsTech';
            }

            const cleanJob: JobOpportunity = {
              id,
              company: item.company || 'Unknown Company',
              title: item.title || 'Position',
              category: normalizedCat,
              status: item.status || 'applied',
              statusDate:
                item.statusDate ||
                item.lastActivityDate ||
                item.appliedDate ||
                new Date().toISOString().split('T')[0],
              stages: Array.isArray(item.stages) ? item.stages : [],
              location: item.location || 'Remote',
              workModel: item.workModel || 'remote',
              jobUrl: item.jobUrl || '',
              salaryCurrency: item.salaryCurrency || '€',
              salaryExpected: item.salaryExpected || '',
              salaryOffered: item.salaryOffered || '',
              benefits: item.benefits || '',
              appliedDate: item.appliedDate || new Date().toISOString().split('T')[0],
              lastActivityDate: item.lastActivityDate || item.appliedDate || new Date().toISOString().split('T')[0],
              nextFollowUpDate: item.nextFollowUpDate,
              followUpDaysInterval: item.followUpDaysInterval || 7,
              followUpDismissed: item.followUpDismissed,
              contacts: Array.isArray(item.contacts) ? item.contacts : [],
              resumes: Array.isArray(item.resumes) ? item.resumes : [],
              portfolioUrl: item.portfolioUrl || '',
              coverLetter: item.coverLetter || '',
              notes: Array.isArray(item.notes) ? item.notes : [],
              priority: item.priority || 'medium',
              rating: item.rating,
              calendarEventId: item.calendarEventId,
              calendarEventLink: item.calendarEventLink,
              calendarSyncedAt: item.calendarSyncedAt
            };

            const uniqueKey = `${cleanJob.company.toLowerCase().trim()}:::${cleanJob.title.toLowerCase().trim()}`;
            if (!jobMap.has(cleanJob.id) && !jobMap.has(uniqueKey)) {
              jobMap.set(cleanJob.id, cleanJob);
              jobMap.set(uniqueKey, cleanJob);
            }
          }
        });

        if (validJobCount > 0) {
          sourceKeys.push(`${key} (${validJobCount} items)`);
        }
      }
    } catch (e) {
      // not valid JSON
    }
  });

  const uniqueJobs = Array.from(new Set(jobMap.values()));
  const jobsMgmCount = uniqueJobs.filter((j) => j.category === 'JobsMgm').length;
  const jobsTechCount = uniqueJobs.filter((j) => j.category === 'JobsTech').length;

  return {
    recoveredJobs: uniqueJobs,
    sourceKeys,
    totalFound: uniqueJobs.length,
    jobsMgmCount,
    jobsTechCount
  };
}

export function getStoredJobs(): JobOpportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let currentJobs: JobOpportunity[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentJobs = parsed.map((j: JobOpportunity) => {
          let cat = j.category;
          const catLower = String(cat || '').toLowerCase();
          if (catLower.includes('mgm') || catLower.includes('manag') || catLower.includes('lead')) {
            cat = 'JobsMgm';
          }
          return {
            ...j,
            category: cat,
            statusDate: j.statusDate || j.lastActivityDate || j.appliedDate || new Date().toISOString().split('T')[0]
          };
        });
      }
    }

    // Check if recovery finds more records across other keys or legacy storage!
    const recovery = findAndRecoverAllLocalJobs();
    if (recovery.totalFound > currentJobs.length) {
      saveStoredJobs(recovery.recoveredJobs);
      return recovery.recoveredJobs;
    }

    if (currentJobs.length > 0) {
      return currentJobs;
    }

    // Default fallback to initial jobs
    const withStatusDate = INITIAL_JOBS.map((j) => ({
      ...j,
      statusDate: j.statusDate || j.lastActivityDate || j.appliedDate
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withStatusDate));
    return withStatusDate;
  } catch (err) {
    console.error('Error loading jobs from storage:', err);
    return INITIAL_JOBS;
  }
}

export function saveStoredJobs(jobs: JobOpportunity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Error saving jobs to storage:', err);
  }
}

export interface FollowUpItem {
  job: JobOpportunity;
  isOverdue: boolean;
  isToday: boolean;
  daysRemaining: number;
  reason: 'scheduled' | 'inactivity';
}

export function calculateFollowUps(jobs: JobOpportunity[]): FollowUpItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items: FollowUpItem[] = [];

  for (const job of jobs) {
    if (job.status === 'rejected' || job.status === 'withdrawn' || job.status === 'offer') {
      continue;
    }

    if (job.followUpDismissed) {
      continue;
    }

    let targetDate: Date | null = null;
    let reason: 'scheduled' | 'inactivity' = 'scheduled';

    const todayStr = today.toISOString().split('T')[0];
    const hasUpcomingStage = job.stages?.some((s) => !s.completed && s.date && s.date >= todayStr);

    // Compute the latest activity date considering notes, stages, and lastActivityDate
    let latestActivityStr = job.lastActivityDate || job.appliedDate || '';
    if (job.notes && job.notes.length > 0) {
      for (const n of job.notes) {
        if (n.createdAt) {
          const d = n.createdAt.slice(0, 10);
          if (!latestActivityStr || d > latestActivityStr) {
            latestActivityStr = d;
          }
        }
      }
    }
    if (job.stages && job.stages.length > 0) {
      for (const st of job.stages) {
        if (st.date && (!latestActivityStr || st.date > latestActivityStr)) {
          latestActivityStr = st.date;
        }
      }
    }

    if (job.nextFollowUpDate) {
      targetDate = new Date(job.nextFollowUpDate + 'T00:00:00');
      reason = 'scheduled';
    } else if (latestActivityStr && !hasUpcomingStage) {
      const lastAct = new Date(latestActivityStr + 'T00:00:00');
      const interval = job.followUpDaysInterval || 7;
      targetDate = new Date(lastAct.getTime() + interval * 24 * 60 * 60 * 1000);
      reason = 'inactivity';
    }

    if (targetDate && !isNaN(targetDate.getTime())) {
      const diffMs = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        items.push({
          job,
          isOverdue: diffDays < 0,
          isToday: diffDays === 0,
          daysRemaining: diffDays,
          reason
        });
      }
    }
  }

  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function exportJobsToCSV(jobs: JobOpportunity[]): string {
  const headers = [
    'Company',
    'Stages (X/Y)',
    'Position Title',
    'Category / Track',
    'Status',
    'Work Model',
    'Location',
    'Target Salary',
    'Offered Salary',
    'Application Date',
    'Next Follow-up',
    'Main Contact',
    'Contact Email',
    'Contact Phone',
    'Tailored Resume File',
    'Notes Count'
  ];

  const escapeCSV = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = jobs.map((j) => {
    const completedStages = j.stages.filter((s) => s.completed).length;
    const totalStages = j.stages.length;
    const stageStr = `${completedStages}/${totalStages}`;
    const mainContact = j.contacts[0];
    const mainResume = j.resumes[0];

    return [
      escapeCSV(j.company),
      escapeCSV(stageStr),
      escapeCSV(j.title),
      escapeCSV(j.category),
      escapeCSV(j.status),
      escapeCSV(j.workModel),
      escapeCSV(j.location),
      escapeCSV(j.salaryExpected),
      escapeCSV(j.salaryOffered),
      escapeCSV(j.appliedDate),
      escapeCSV(j.nextFollowUpDate),
      escapeCSV(mainContact?.name),
      escapeCSV(mainContact?.email),
      escapeCSV(mainContact?.phone),
      escapeCSV(mainResume?.fileName),
      escapeCSV(j.notes.length.toString())
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
