import type { Procedure, OfficialSource } from './api';
import type { Journey, JourneyStep, Document, SourceLink } from '@/data/journeyData';

function humanizeServiceKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'recently';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'recently';
  }
}

function toSourceLink(src: OfficialSource): SourceLink {
  return {
    id: src.id,
    name: src.title,
    url: src.url,
    domain: src.domain,
    lastVerified: formatDate(src.verified_at),
  };
}

const FALLBACK_SOURCE: SourceLink = {
  id: 'unknown',
  name: 'Official source',
  url: '#',
  domain: 'gov.in',
  lastVerified: 'recently',
};

/**
 * Converts a Procedure returned by /api/roadmap into the Journey shape
 * the existing screens (JourneyBriefScreen, ChecklistScreen,
 * JourneyMapScreen, CompleteScreen) already know how to render.
 */
export function adaptProcedureToJourney(procedure: Procedure): Journey {
  const sourceById = new Map(procedure.sources.map((s) => [s.id, s]));
  const sortedSteps = [...procedure.steps].sort((a, b) => a.order - b.order);

  // order -> step's own numeric id, and backend string id -> numeric id,
  // needed to translate depends_on (string ids) into the numeric ids the
  // existing UI uses for ordering/blocking logic.
  const numericIdByBackendId = new Map(sortedSteps.map((s) => [s.id, s.order]));

  const documents: Document[] = procedure.documents.map((doc) => {
    const owningStep = sortedSteps.find((s) => s.documents.includes(doc.id));
    const firstSourceId = doc.source_ids[0];
    const source = firstSourceId ? sourceById.get(firstSourceId) : undefined;

    return {
      id: doc.id,
      name: doc.name,
      description: doc.description ?? '',
      requiredForStep: owningStep?.order ?? 1,
      source: source ? toSourceLink(source) : FALLBACK_SOURCE,
    };
  });

  const steps: JourneyStep[] = sortedSteps.map((step) => {
    const stepSourceIds = step.source_ids;
    const primarySource = stepSourceIds.length
      ? sourceById.get(stepSourceIds[0])
      : undefined;

    const relevantSources: SourceLink[] = stepSourceIds
      .map((id) => sourceById.get(id))
      .filter((s): s is OfficialSource => Boolean(s))
      .map(toSourceLink);

    const facts: StepFactsAcc = [];
    if (step.department) facts.push({ label: 'Department', value: step.department, status: 'verified' });
    if (step.office) facts.push({ label: 'Office', value: step.office, status: 'verified' });
    if (step.fee) facts.push({ label: 'Fee', value: step.fee, status: 'verified' });

    const mode: 'online' | 'office' | 'both' = step.application_url
      ? 'online'
      : step.office
        ? 'office'
        : 'both';

    return {
      id: step.order,
      backendStepId: step.id,
      title: step.title,
      shortTitle: step.title.length > 24 ? `${step.title.slice(0, 22)}…` : step.title,
      icon: 'folder',
      description: step.description,
      dependsOn: step.depends_on
        .map((depId) => numericIdByBackendId.get(depId))
        .filter((n): n is number => typeof n === 'number'),
      detail: {
        whatToDo: step.description,
        whyThisStep: '',
        department: step.department ?? 'Government Department',
        location: step.office ?? (step.application_url ? 'Online' : 'As per official process'),
        mode,
        estimatedTime: '',
        fee: step.fee ? { amount: step.fee, status: 'verified' } : undefined,
        facts,
        source: primarySource ? toSourceLink(primarySource) : FALLBACK_SOURCE,
        commonQuestions: [], // populated live via /api/doubt in the UI, not precomputed
        // extra fields the adapter needs downstream, not part of the
        // original mock shape but harmless additions:
        applicationUrl: step.application_url ?? undefined,
      } as StepDetailWithExtras,
    };
  });

  const firstFee = sortedSteps.find((s) => s.fee)?.fee ?? undefined;
  const firstDepartment = sortedSteps.find((s) => s.department)?.department ?? 'Government Department';

  return {
    service: procedure.service,
    title: `${humanizeServiceKey(procedure.service)} — ${procedure.jurisdiction}`,
    state: procedure.jurisdiction,
    department: firstDepartment,
    description:
      procedure.eligibility ??
      `Official procedure for ${humanizeServiceKey(procedure.service).toLowerCase()} in ${procedure.jurisdiction}, structured from verified government sources.`,
    documents,
    steps,
    sources: procedure.sources.map(toSourceLink),
    status: procedure.status,
    estimatedTimeline: `${sortedSteps.length} sequential step${sortedSteps.length === 1 ? '' : 's'}`,
    officialFee: firstFee ?? 'Not specified by official sources',
    intelligenceSteps: [
      { label: 'Your request received', icon: 'message' },
      {
        label: `Request understood — "${humanizeServiceKey(procedure.service)}, ${procedure.jurisdiction}"`,
        icon: 'brain',
      },
      { label: 'Official government sources searched', icon: 'search' },
      {
        label: `Sources verified — ${procedure.sources.length} official portal(s) confirmed`,
        icon: 'shield-check',
      },
      { label: 'Procedure structured into steps', icon: 'list' },
      { label: 'Journey map created', icon: 'map' },
    ],
  };
}

// Small type helpers kept local to this file to avoid widening the
// original journeyData.ts types more than necessary.
type StepFactsAcc = { label: string; value: string; status: 'verified' }[];
type StepDetailWithExtras = Journey['steps'][number]['detail'] & {
  applicationUrl?: string;
};