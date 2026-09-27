// API client for the Humsafar backend.
// Types here mirror schemas/models.py exactly — if the backend schema
// changes, update this file to match.

export type SourceType =
  | 'government_portal'
  | 'state_portal'
  | 'municipal_portal'
  | 'department_site'
  | 'other';

export type ProcedureStatus = 'verified' | 'stale' | 'demo' | 'partial';
export type LLMProviderName = 'groq' | 'gemini_flash' | 'none';

export interface OfficialSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  source_type: SourceType;
  content?: string | null;
  verified_at?: string | null;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description?: string | null;
  source_ids: string[];
}

export interface BackendStep {
  id: string;
  order: number;
  title: string;
  description: string;
  department?: string | null;
  office?: string | null;
  documents: string[];
  depends_on: string[];
  fee?: string | null;
  application_url?: string | null;
  source_ids: string[];
}

export interface Procedure {
  service: string;
  jurisdiction: string;
  eligibility?: string | null;
  prerequisites: string[];
  documents: DocumentRequirement[];
  steps: BackendStep[];
  sources: OfficialSource[];
  verified_at?: string | null;
  status: ProcedureStatus;
  llm_provider_used: LLMProviderName;
}

export interface ClarificationNeeded {
  reason: string;
  missing_field: string;
  prompt_to_user: string;
}

export interface RoadmapResponse {
  success: boolean;
  procedure?: Procedure | null;
  clarification?: ClarificationNeeded | null;
  error?: string | null;
}

export interface DoubtResponse {
  success: boolean;
  answer: string;
  confirmed: boolean;
  source_ids: string[];
  error?: string | null;
}

// In dev, Vite proxies "/api" to the backend (see vite.config.ts), so this
// can stay empty. Set VITE_API_BASE_URL in .env only if you need to point
// at a different backend (e.g. a deployed URL) instead of the proxy.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errBody = await res.json();
      detail = errBody?.detail ? JSON.stringify(errBody.detail) : '';
    } catch {
      // ignore — response wasn't JSON
    }
    throw new Error(`Request to ${path} failed (${res.status}). ${detail}`);
  }

  return res.json() as Promise<T>;
}

export function fetchRoadmap(
  query: string,
  jurisdictionHint?: string,
  serviceHint?: string
): Promise<RoadmapResponse> {
  return postJSON<RoadmapResponse>('/api/roadmap', {
    query,
    jurisdiction_hint: jurisdictionHint ?? null,
    service_hint: serviceHint ?? null,
  });
}

export function askDoubt(params: {
  service: string;
  jurisdiction: string;
  stepId: string;
  question: string;
}): Promise<DoubtResponse> {
  return postJSON<DoubtResponse>('/api/doubt', {
    service: params.service,
    jurisdiction: params.jurisdiction,
    step_id: params.stepId,
    question: params.question,
  });
}