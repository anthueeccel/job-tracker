export interface InterviewTip {
  category: string;
  items: string[];
}

export const INTERVIEW_QUESTIONS_TECH: InterviewTip[] = [
  {
    category: 'System Architecture & Technical Depth',
    items: [
      'Describe a complex architectural trade-off you evaluated recently and how you made the final technical decision.',
      'How do you approach database performance optimization, indexing, and bottleneck mitigation in distributed systems?',
      'Walk me through your testing philosophy: unit, integration, contract, and end-to-end test resilience.',
      'Tell me about a high-severity production outage or bug you triaged and what safeguards you introduced afterwards.'
    ]
  },
  {
    category: 'Strategic Questions for YOU to Ask the Technical Interviewers',
    items: [
      'What is the single biggest engineering bottleneck or architectural challenge the team faces this quarter?',
      'What does your CI/CD deployment cadence look like, and how do you prioritize technical debt against product features?',
      'How do code reviews, RFCs, and engineering feedback operate across distributed teams here?',
      'What distinguishes a high-performing senior engineer from someone who just writes solid code on your team?'
    ]
  }
];

export const INTERVIEW_QUESTIONS_MGM: InterviewTip[] = [
  {
    category: 'Engineering Leadership, People Care & Execution',
    items: [
      'How do you balance high-velocity feature delivery with team burnout prevention and engineering sustainability?',
      'Describe a time you had to align conflicting priorities between strong engineering opinions and executive product deadlines.',
      'How do you structure career progression, effective 1:1s, and personalized development plans for senior and lead engineers?',
      'How have you handled an underperforming team member or a high performer who caused interpersonal friction?'
    ]
  },
  {
    category: 'Strategic Questions for YOU to Ask Executive Leadership',
    items: [
      'What are the core business KPIs and OKRs that this engineering management position must achieve in the first 6 months?',
      'How much autonomy does the engineering manager have to influence team topology, tooling, and architectural direction?',
      'How does senior executive leadership support talent retention and work-life harmony during rapid growth phases?',
      'What is the current gap between executive product vision and day-to-day team execution velocity?'
    ]
  }
];
