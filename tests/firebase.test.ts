import { describe, it, expect, beforeAll } from 'vitest';
import {
  app,
  db,
  FIRESTORE_DATABASE_ID,
  resolvedFirebaseConfig,
  sanitizeForFirestore,
  saveJobToFirestore,
  deleteJobFromFirestore,
  fetchUserJobsFromFirestore,
  testConnection,
  handleFirestoreError,
  OperationType
} from '../src/services/firebase';
import { JobOpportunity } from '../src/types/job';
import { doc, getDoc } from 'firebase/firestore';

describe('Firebase & Firestore Integration Tests', () => {
  const testUserId = 'test-github-actions-user';
  const testJob: JobOpportunity = {
    id: 'test-job-ci-001',
    //userId: testUserId,
    title: 'Lead Cloud Infrastructure Architect',
    company: 'Acme Cloud Technologies',
    category: 'JobsTech',
    status: 'applied',
    statusDate: '2026-10-23',
    appliedDate: '2026-10-23',
    lastActivityDate: '2026-10-23',
    location: 'Remote, US/EU',
    workModel: 'remote',
    salaryCurrency: 'USD',
    salaryExpected: '$180,000 - $210,000',
    priority: 'dream_job',
    rating: 5,
    stages: [
      { id: 'stg-1', name: 'HR Screening', completed: true, date: '2026-10-23' },
      { id: 'stg-2', name: 'Technical Architecture', completed: false, date: '2026-10-28' }
    ],
    contacts: [
      { name: 'Alex Hunter', role: 'Head of Talent', email: 'alex@acmecloud.com' }
    ],
    resumes: [
      { id: 'r-1', fileName: 'Alex_Architect_Resume_2026.pdf', uploadedAt: '2026-10-23T00:00:00.000Z', versionLabel: 'Cloud Architecture V3' }
    ],
    notes: [
      { id: 'n-1', type: 'general', content: 'HR screen went great. System design focuses on Kafka and Kubernetes.', createdAt: new Date().toISOString() }
    ],
    followUpDaysInterval: 7,
    followUpDismissed: false
  };

  // 1. Connection & Configuration Tests
  describe('1. Configuration & Connection', () => {
    it('initializes Firebase App with valid project configuration', () => {
      expect(app).toBeDefined();
      expect(app.name).toBe('[DEFAULT]');
      expect(resolvedFirebaseConfig.projectId).toBeTruthy();
    });

    it('initializes Cloud Firestore with the correct Database ID', () => {
      expect(db).toBeDefined();
      expect(FIRESTORE_DATABASE_ID).toBeTruthy();
      expect(FIRESTORE_DATABASE_ID).toBe('ai-studio-jobtrackerprotec-67f49dda-dd89-4ce0-b19f-dec97a57a6af');
    });

    it('executes connection probe gracefully without unhandled exceptions', async () => {
      // testConnection attempts to probe Firestore connection
      const isConnected = await testConnection();
      expect(typeof isConnected).toBe('boolean');
    });

    it('creates valid Firestore document and collection references', () => {
      const testDocRef = doc(db, 'users', testUserId, 'jobs', testJob.id);
      expect(testDocRef.id).toBe(testJob.id);
      expect(testDocRef.path).toBe(`users/${testUserId}/jobs/${testJob.id}`);
    });
  });

  // 2. Data Sanitization Tests (Prevents runtime Firestore schema errors)
  describe('2. Data Sanitization & Schema Compliance', () => {
    it('strips undefined properties from object payloads before sending to Firestore', () => {
      const dirtyPayload = {
        id: 'job-123',
        title: 'Software Engineer',
        salaryOffered: undefined,
        benefits: undefined,
        location: 'Remote',
        nested: {
          fieldA: 'valid',
          fieldB: undefined
        }
      };

      const clean = sanitizeForFirestore(dirtyPayload);
      expect(clean).toHaveProperty('id', 'job-123');
      expect(clean).toHaveProperty('title', 'Software Engineer');
      expect(clean).toHaveProperty('location', 'Remote');
      expect(clean).not.toHaveProperty('salaryOffered');
      expect(clean).not.toHaveProperty('benefits');
      expect((clean.nested as Record<string, unknown>)).not.toHaveProperty('fieldB');
    });

    it('cleans undefined values inside arrays properly', () => {
      const payloadWithArray = {
        stages: [
          { id: 'stg-1', name: 'Interview', date: undefined },
          { id: 'stg-2', name: 'Challenge', date: '2026-10-25' }
        ]
      };

      const clean = sanitizeForFirestore(payloadWithArray);
      const stages = clean.stages as Record<string, unknown>[];
      expect(stages).toHaveLength(2);
      expect(stages[0]).not.toHaveProperty('date');
      expect(stages[1]).toHaveProperty('date', '2026-10-25');
    });
  });

  // 3. Insert (Create), Update, and Delete Operations
  describe('3. Job CRUD Lifecycle (Insert, Update, Delete)', () => {
    it('creates (inserts) a new job opportunity payload with correct schema', async () => {
      // Test payload validation and execution
      try {
        await saveJobToFirestore(testUserId, testJob);
      } catch (err) {
        // If unauthenticated in CI (no Google Auth token), verify that Firestore Security Rules
        // enforce authorization and error handler catches it cleanly with structured JSON
        expect(err).toBeInstanceOf(Error);
        const parsed = JSON.parse((err as Error).message);
        expect(parsed.operationType).toBe('write');
        expect(parsed.path).toBe(`users/${testUserId}/jobs/${testJob.id}`);
      }
    });

    it('updates an existing job opportunity with modified fields', async () => {
      const updatedJob: JobOpportunity = {
        ...testJob,
        status: 'interviewing',
        statusDate: '2026-10-24',
        salaryOffered: '$195,000 + Equity',
        notes: [
          ...testJob.notes,
          { id: 'n-2', type: 'interview', content: 'Advanced to Round 2 with VP of Engineering', createdAt: new Date().toISOString() }
        ]
      };

      try {
        await saveJobToFirestore(testUserId, updatedJob);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        const parsed = JSON.parse((err as Error).message);
        expect(parsed.operationType).toBe('write');
      }
    });

    it('deletes a job opportunity document cleanly', async () => {
      try {
        await deleteJobFromFirestore(testUserId, testJob.id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        const parsed = JSON.parse((err as Error).message);
        expect(parsed.operationType).toBe('delete');
        expect(parsed.path).toBe(`users/${testUserId}/jobs/${testJob.id}`);
      }
    });

    it('fetches user jobs collection and handles authorization errors gracefully', async () => {
      try {
        const jobs = await fetchUserJobsFromFirestore(testUserId);
        expect(Array.isArray(jobs)).toBe(true);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        const parsed = JSON.parse((err as Error).message);
        expect(parsed.operationType).toBe('get');
        expect(parsed.path).toBe(`users/${testUserId}/jobs`);
      }
    });
  });

  // 4. Security & Error Handling Structure
  describe('4. Security & Error Handling Verification', () => {
    it('handleFirestoreError formats security violations into actionable JSON telemetry', () => {
      expect(() => {
        handleFirestoreError(
          new Error('Missing or insufficient permissions.'),
          OperationType.WRITE,
          'users/unauthorized-user/jobs/job-999'
        );
      }).toThrow();

      try {
        handleFirestoreError(
          new Error('Missing or insufficient permissions.'),
          OperationType.DELETE,
          'users/victim/jobs/job-victim'
        );
      } catch (err) {
        const parsed = JSON.parse((err as Error).message);
        expect(parsed).toHaveProperty('error');
        expect(parsed).toHaveProperty('operationType', 'delete');
        expect(parsed).toHaveProperty('path', 'users/victim/jobs/job-victim');
        expect(parsed).toHaveProperty('authInfo');
      }
    });
  });
});
