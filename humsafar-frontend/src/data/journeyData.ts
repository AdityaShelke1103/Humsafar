export type VerificationStatus = 'verified' | 'needs_confirmation' | 'not_available';

export interface SourceLink {
  id: string;
  name: string;
  url: string;
  domain: string;
  lastVerified: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  requiredForStep: number;
  source: SourceLink;
  optional?: boolean;
}

export interface StepDetail {
  whatToDo: string;
  whyThisStep: string;
  department: string;
  location: string;
  mode: 'online' | 'office' | 'both';
  estimatedTime: string;
  fee?: { amount: string; status: VerificationStatus };
  facts: { label: string; value: string; status: VerificationStatus }[];
  source: SourceLink;
  commonQuestions: { q: string; a: string; source?: SourceLink }[];
}

export interface JourneyStep {
  id: number;
  /** The backend's real step id (e.g. "step_2") — needed for /api/doubt calls. */
  backendStepId: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  detail: StepDetail;
  dependsOn?: number[];
}

export interface Journey {
  title: string;
  state: string;
  department: string;
  description: string;
  documents: Document[];
  steps: JourneyStep[];
  sources: SourceLink[];
  intelligenceSteps: { label: string; icon: string }[];
  /** Real backend service key (e.g. "domicile_certificate") — needed for /api/doubt calls. */
  service: string;
  estimatedTimeline?: string;
  officialFee?: string;
  status?: 'verified' | 'stale' | 'demo' | 'partial';
}

export const domicileJourney: Journey = {
  service: 'domicile_certificate',
  title: 'Maharashtra Domicile Certificate',
  state: 'Maharashtra',
  department: 'Revenue Department',
  description:
    'A domicile certificate proves your permanent residence in Maharashtra. It is issued by the Revenue Department through the Tahsildar office and is required for education quotas, government jobs, and various state schemes.',
  documents: [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      description: 'Primary identity proof linking your residential address.',
      requiredForStep: 3,
      source: {
        id: 'src-maha',
        name: 'Maharashtra Government Portal',
        url: 'https://maharashtra.gov.in',
        domain: 'maharashtra.gov.in',
        lastVerified: '27 Sep 2026',
      },
    },
    {
      id: 'address',
      name: 'Address Proof',
      description: 'Electricity bill, water bill, or rent agreement (not older than 1 year).',
      requiredForStep: 3,
      source: {
        id: 'src-aaple',
        name: 'Aaple Sarkar Portal',
        url: 'https://aaplesarkar.mahaonline.gov.in',
        domain: 'aaplesarkar.mahaonline.gov.in',
        lastVerified: '27 Sep 2026',
      },
    },
    {
      id: 'photo',
      name: 'Passport Size Photo',
      description: 'Recent passport-size photograph with light background.',
      requiredForStep: 3,
      source: {
        id: 'src-aaple',
        name: 'Aaple Sarkar Portal',
        url: 'https://aaplesarkar.mahaonline.gov.in',
        domain: 'aaplesarkar.mahaonline.gov.in',
        lastVerified: '27 Sep 2026',
      },
    },
    {
      id: 'birth',
      name: 'Birth Certificate or School Leaving Certificate',
      description: 'Proof of birth or education in Maharashtra to establish domicile.',
      requiredForStep: 3,
      source: {
        id: 'src-rev',
        name: 'Revenue Department Maharashtra',
        url: 'https://maharashtra.gov.in/revenue',
        domain: 'maharashtra.gov.in',
        lastVerified: '27 Sep 2026',
      },
    },
    {
      id: 'affidavit',
      name: 'Domicile Affidavit',
      description: 'Sworn affidavit declaring permanent residence in Maharashtra.',
      requiredForStep: 3,
      optional: true,
      source: {
        id: 'src-rev',
        name: 'Revenue Department Maharashtra',
        url: 'https://maharashtra.gov.in/revenue',
        domain: 'maharashtra.gov.in',
        lastVerified: '27 Sep 2026',
      },
    },
  ],
  steps: [
    {
      id: 1,
      backendStepId: 'step_1',
      title: 'Gather Your Documents',
      shortTitle: 'Documents',
      icon: 'folder',
      description: 'Collect all required documents before starting your application.',
      detail: {
        whatToDo:
          'Collect your Aadhaar card, address proof, birth certificate or school leaving certificate, passport photo, and domicile affidavit. Keep digital copies (PDF/JPEG) ready for upload.',
        whyThisStep:
          'Having all documents ready upfront prevents delays during the application. Missing documents are the #1 reason applications get rejected.',
        department: 'Revenue Department',
        location: 'Self-preparation',
        mode: 'online',
        estimatedTime: '1-2 days',
        facts: [
          { label: 'Documents Required', value: '4 mandatory + 1 optional', status: 'verified' },
          { label: 'File Format', value: 'PDF or JPEG, max 100KB', status: 'verified' },
        ],
        source: {
          id: 'src-aaple',
          name: 'Aaple Sarkar Portal',
          url: 'https://aaplesarkar.mahaonline.gov.in',
          domain: 'aaplesarkar.mahaonline.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'Can I use an electricity bill as address proof?',
            a: 'Yes, the official Aaple Sarkar portal lists electricity bills as valid address proof, provided it is not older than 1 year and matches your current address.',
            source: {
              id: 'src-aaple',
              name: 'Aaple Sarkar Portal',
              url: 'https://aaplesarkar.mahaonline.gov.in',
              domain: 'aaplesarkar.mahaonline.gov.in',
              lastVerified: '27 Sep 2026',
            },
          },
          {
            q: 'Is the affidavit mandatory?',
            a: 'The affidavit is optional in most cases but may be required if your birth certificate does not clearly establish Maharashtra domicile. We recommend getting one prepared to avoid delays.',
          },
        ],
      },
    },
    {
      id: 2,
      backendStepId: 'step_2',
      title: 'Register on Aaple Sarkar Portal',
      shortTitle: 'Register',
      icon: 'globe',
      description: 'Create an account on the Maharashtra e-governance portal.',
      detail: {
        whatToDo:
          'Visit aaplesarkar.mahaonline.gov.in and create a new citizen account using your Aadhaar number and mobile number. Complete OTP verification.',
        whyThisStep:
          'The Aaple Sarkar portal is the official online gateway for all Maharashtra government services. You need a registered account to submit the domicile application online.',
        department: 'Revenue Department',
        location: 'Online — aaplesarkar.mahaonline.gov.in',
        mode: 'online',
        estimatedTime: '15-20 minutes',
        facts: [
          { label: 'Registration Cost', value: 'Free', status: 'verified' },
          { label: 'Aadhaar Required', value: 'Yes, for identity verification', status: 'verified' },
          { label: 'Mobile OTP', value: 'Required for activation', status: 'verified' },
        ],
        source: {
          id: 'src-aaple',
          name: 'Aaple Sarkar Portal',
          url: 'https://aaplesarkar.mahaonline.gov.in',
          domain: 'aaplesarkar.mahaonline.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'Do I need a mobile number linked to Aadhaar?',
            a: 'Yes, OTP verification uses your Aadhaar-linked mobile number. If your mobile is not linked, visit an Aadhaar enrollment center first.',
          },
          {
            q: 'Can someone else register on my behalf?',
            a: 'Technically yes, but the account is tied to your Aadhaar. For security, we recommend doing this yourself.',
          },
        ],
      },
    },
    {
      id: 3,
      backendStepId: 'step_3',
      title: 'Submit Online Application',
      shortTitle: 'Application',
      icon: 'file-text',
      description: 'Fill out the domicile certificate application form online.',
      detail: {
        whatToDo:
          'Log into Aaple Sarkar, navigate to Revenue Department services, select "Domicile Certificate", fill the application form with personal details, upload documents, and pay the fee.',
        whyThisStep:
          'The online application officially initiates your domicile certificate request with the Revenue Department. This creates your application reference number for tracking.',
        department: 'Revenue Department',
        location: 'Online — Aaple Sarkar Portal',
        mode: 'online',
        estimatedTime: '30-45 minutes',
        fee: { amount: '₹50', status: 'verified' },
        facts: [
          { label: 'Application Fee', value: '₹50', status: 'verified' },
          { label: 'Payment Mode', value: 'Online (UPI, Card, Net Banking)', status: 'verified' },
          { label: 'Processing Time', value: '15-30 days', status: 'needs_confirmation' },
          { label: 'Reference Number', value: 'Generated on submission', status: 'verified' },
        ],
        source: {
          id: 'src-aaple',
          name: 'Aaple Sarkar Portal',
          url: 'https://aaplesarkar.mahaonline.gov.in',
          domain: 'aaplesarkar.mahaonline.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'What if I make a mistake in the form?',
            a: 'You can edit the application before final submission and payment. After submission, visit the Tahsildar office with your reference number to request corrections.',
            source: {
              id: 'src-aaple',
              name: 'Aaple Sarkar Portal',
              url: 'https://aaplesarkar.mahaonline.gov.in',
              domain: 'aaplesarkar.mahaonline.gov.in',
              lastVerified: '27 Sep 2026',
            },
          },
          {
            q: 'Can I apply offline instead?',
            a: 'Yes, you can submit the form at your local Tahsildar office. However, the online process is faster and gives you a tracking number immediately.',
          },
        ],
      },
      dependsOn: [1, 2],
    },
    {
      id: 4,
      backendStepId: 'step_4',
      title: 'Document Verification at Tahsildar Office',
      shortTitle: 'Verification',
      icon: 'building',
      description: 'Visit the Tahsildar office with original documents for verification.',
      detail: {
        whatToDo:
          'After online submission, you will receive a notification to visit your jurisdictional Tahsildar office. Carry all original documents and the application printout with reference number.',
        whyThisStep:
          'The Tahsildar verifies your original documents against the uploaded copies and confirms your residential status before approving the certificate.',
        department: 'Revenue Department',
        location: 'Tahsildar Office (your jurisdiction)',
        mode: 'office',
        estimatedTime: '1 visit, 2-3 hours',
        facts: [
          { label: 'Who Handles This', value: 'Tahsildar', status: 'verified' },
          { label: 'Bring Originals', value: 'All documents + application printout', status: 'verified' },
          { label: 'Office Hours', value: 'Mon-Fri, 10 AM - 5 PM', status: 'needs_confirmation' },
        ],
        source: {
          id: 'src-rev',
          name: 'Revenue Department Maharashtra',
          url: 'https://maharashtra.gov.in/revenue',
          domain: 'maharashtra.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'Which Tahsildar office should I visit?',
            a: 'The one corresponding to your permanent residential address. The Aaple Sarkar portal assigns this automatically based on your address pincode after application submission.',
            source: {
              id: 'src-aaple',
              name: 'Aaple Sarkar Portal',
              url: 'https://aaplesarkar.mahaonline.gov.in',
              domain: 'aaplesarkar.mahaonline.gov.in',
              lastVerified: '27 Sep 2026',
            },
          },
          {
            q: 'What if I miss my verification appointment?',
            a: 'Contact the Tahsildar office with your reference number to reschedule. Missing does not cancel your application, but delays it.',
          },
        ],
      },
      dependsOn: [3],
    },
    {
      id: 5,
      backendStepId: 'step_5',
      title: 'Approval and Certificate Generation',
      shortTitle: 'Approval',
      icon: 'check-circle',
      description: 'The Tahsildar approves your application and generates the certificate.',
      detail: {
        whatToDo:
          'After successful verification, the Tahsildar processes your application. You will receive an SMS/email notification when the certificate is approved and ready for download.',
        whyThisStep:
          'This is the official approval step where the Revenue Department confirms your domicile status and authorizes certificate issuance.',
        department: 'Revenue Department',
        location: 'Tahsildar Office (backend processing)',
        mode: 'online',
        estimatedTime: '7-15 days after verification',
        facts: [
          { label: 'Notification', value: 'SMS + Email on approval', status: 'verified' },
          { label: 'Approval Authority', value: 'Tahsildar', status: 'verified' },
          { label: 'Rejection Appeal', value: 'File with Sub-Divisional Officer', status: 'needs_confirmation' },
        ],
        source: {
          id: 'src-rev',
          name: 'Revenue Department Maharashtra',
          url: 'https://maharashtra.gov.in/revenue',
          domain: 'maharashtra.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'What if my application is rejected?',
            a: 'You can file an appeal with the Sub-Divisional Officer (SDO) within 30 days of rejection. Common reasons include insufficient proof or address mismatch.',
          },
        ],
      },
      dependsOn: [4],
    },
    {
      id: 6,
      backendStepId: 'step_6',
      title: 'Download Your Certificate',
      shortTitle: 'Certificate',
      icon: 'award',
      description: 'Download your digitally signed domicile certificate from the portal.',
      detail: {
        whatToDo:
          'Log back into Aaple Sarkar, go to "My Applications", find your approved domicile certificate, and download the digitally signed PDF.',
        whyThisStep:
          'The downloaded certificate is legally valid and digitally signed by the issuing authority. It can be used for education, employment, and all government schemes.',
        department: 'Revenue Department',
        location: 'Online — Aaple Sarkar Portal',
        mode: 'online',
        estimatedTime: '5 minutes',
        facts: [
          { label: 'Format', value: 'Digitally signed PDF', status: 'verified' },
          { label: 'Validity', value: 'Lifetime (unless address changes)', status: 'verified' },
          { label: 'Verify Online', value: 'Available on Aaple Sarkar', status: 'verified' },
        ],
        source: {
          id: 'src-aaple',
          name: 'Aaple Sarkar Portal',
          url: 'https://aaplesarkar.mahaonline.gov.in',
          domain: 'aaplesarkar.mahaonline.gov.in',
          lastVerified: '27 Sep 2026',
        },
        commonQuestions: [
          {
            q: 'Is the digital certificate valid everywhere?',
            a: 'Yes, the digitally signed PDF is legally valid across India. No physical copy is required, though you can print one for convenience.',
            source: {
              id: 'src-aaple',
              name: 'Aaple Sarkar Portal',
              url: 'https://aaplesarkar.mahaonline.gov.in',
              domain: 'aaplesarkar.mahaonline.gov.in',
              lastVerified: '27 Sep 2026',
            },
          },
        ],
      },
      dependsOn: [5],
    },
  ],
  sources: [
    {
      id: 'src-maha',
      name: 'Maharashtra Government Portal',
      url: 'https://maharashtra.gov.in',
      domain: 'maharashtra.gov.in',
      lastVerified: '27 Sep 2026',
    },
    {
      id: 'src-aaple',
      name: 'Aaple Sarkar Portal',
      url: 'https://aaplesarkar.mahaonline.gov.in',
      domain: 'aaplesarkar.mahaonline.gov.in',
      lastVerified: '27 Sep 2026',
    },
    {
      id: 'src-rev',
      name: 'Revenue Department Maharashtra',
      url: 'https://maharashtra.gov.in/revenue',
      domain: 'maharashtra.gov.in',
      lastVerified: '27 Sep 2026',
    },
  ],
  intelligenceSteps: [
    { label: 'Your request received', icon: 'message' },
    { label: 'Request understood — "Domicile certificate, Maharashtra"', icon: 'brain' },
    { label: 'Official government sources searched', icon: 'search' },
    { label: 'Sources verified — 3 official portals confirmed', icon: 'shield-check' },
    { label: 'Procedure structured into steps', icon: 'list' },
    { label: 'Journey map created', icon: 'map' },
  ],
};

export const searchSuggestions = [
  'Domicile certificate in Maharashtra',
  'Income certificate in Maharashtra',
  'Caste certificate in Maharashtra',
  'Passport application',
  'Aadhaar address update',
  'Ration card application',
];

export const categoryChips = [
  { label: 'Documents', icon: 'file-text' },
  { label: 'Address', icon: 'home' },
  { label: 'Education', icon: 'graduation-cap' },
  { label: 'Family', icon: 'users' },
  { label: 'Certificates', icon: 'award' },
  { label: 'Identity', icon: 'id-card' },
] as const;