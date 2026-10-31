import { describe, it, expect } from 'vitest';
import { getLastRecordChangeInfo, compareLastRecordChange } from '../src/services/timing';
import { JobOpportunity } from '../src/types/job';

describe('Last Record Change & Date Order Tests', () => {
  const baseJob: JobOpportunity = {
    id: 'test-job-1',
    title: 'Senior Software Engineer',
    company: 'Alpha Corp',
    category: 'JobsTech',
    status: 'applied',
    stages: [],
    location: 'Remote',
    workModel: 'remote',
    appliedDate: '2026-10-01',
    lastActivityDate: '2026-10-01',
    contacts: [],
    resumes: [],
    notes: [],
    priority: 'medium'
  };

  it('determines latest change from appliedDate when no other updates exist', () => {
    const info = getLastRecordChangeInfo(baseJob);
    expect(info.source).toBe('applied');
    expect(info.sourceLabel).toBe('Date Applied');
    expect(info.dateStr).toBe('2026-10-01');
  });

  it('prioritizes status change when statusDate is newer than appliedDate', () => {
    const jobWithStatus: JobOpportunity = {
      ...baseJob,
      status: 'interviewing',
      statusDate: '2026-10-15'
    };
    const info = getLastRecordChangeInfo(jobWithStatus);
    expect(info.source).toBe('status');
    expect(info.sourceLabel).toBe('Status');
    expect(info.dateStr).toBe('2026-10-15');
  });

  it('prioritizes note when note createdAt is newer than statusDate and appliedDate', () => {
    const jobWithNote: JobOpportunity = {
      ...baseJob,
      status: 'screening',
      statusDate: '2026-10-10',
      notes: [
        {
          id: 'n1',
          createdAt: '2026-10-25T14:30:00.000Z',
          type: 'interview',
          content: 'Screening passed.'
        }
      ]
    };
    const info = getLastRecordChangeInfo(jobWithNote);
    expect(info.source).toBe('note');
    expect(info.sourceLabel).toBe('Note');
    expect(info.dateStr).toBe('2026-10-25');
  });

  it('correctly sorts jobs in descending Date Order (newest change first)', () => {
    const jobOld: JobOpportunity = {
      ...baseJob,
      id: 'old',
      company: 'Old Corp',
      appliedDate: '2026-09-01'
    };

    const jobMid: JobOpportunity = {
      ...baseJob,
      id: 'mid',
      company: 'Mid Corp',
      appliedDate: '2026-10-05',
      statusDate: '2026-10-12'
    };

    const jobNewest: JobOpportunity = {
      ...baseJob,
      id: 'new',
      company: 'New Corp',
      appliedDate: '2026-10-01',
      notes: [
        {
          id: 'n2',
          createdAt: '2026-10-30T10:00:00.000Z',
          type: 'general',
          content: 'Recent update'
        }
      ]
    };

    const list = [jobOld, jobNewest, jobMid];
    list.sort((a, b) => compareLastRecordChange(a, b, 'desc'));

    expect(list[0].id).toBe('new');
    expect(list[1].id).toBe('mid');
    expect(list[2].id).toBe('old');

    // Ascending check (oldest first)
    list.sort((a, b) => compareLastRecordChange(a, b, 'asc'));
    expect(list[0].id).toBe('old');
    expect(list[1].id).toBe('mid');
    expect(list[2].id).toBe('new');
  });
});
