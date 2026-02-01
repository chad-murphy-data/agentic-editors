// Pipeline stages
export type PipelineStage =
  | 'draft'
  | 'editors'
  | 'review'
  | 'revision'
  | 'buyers'
  | 'synthesis';

// Editor feedback structure
export interface EditorFeedback {
  id: string;
  editor: 'skeptic' | 'besci' | 'clarity';
  location: string;
  issue: string;
  suggestion?: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
  userEdit?: string;
}

// Buyer reaction structure
export interface BuyerReaction {
  buyer: 'ceo' | 'cpo' | 'cro' | 'head-cx';
  stoppedAt?: string;
  quotable?: string;
  questions: string[];
  reaction: string;
  reactionEmoji: string;
}

// Round state - captures everything for one iteration
export interface RoundState {
  roundNumber: number;
  inputDocument: string;
  editorFeedback: EditorFeedback[];
  acceptedFeedback: EditorFeedback[];
  revisedDocument?: string;
  voicePassedDocument?: string;
  buyerReactions: BuyerReaction[];
  timestamp: Date;
}

// Overall pipeline state
export interface PipelineState {
  currentStage: PipelineStage;
  currentRound: number;
  documentGoal?: string;
  rounds: RoundState[];
  isProcessing: boolean;
  error?: string;
  letItCookMode: boolean;
  letItCookRounds?: number;
}

// Agent response types
export interface EditorResponse {
  feedback: Omit<EditorFeedback, 'id' | 'status'>[];
}

export interface RevisionResponse {
  revisedDocument: string;
  changesSummary: string[];
}

export interface VoicePassResponse {
  document: string;
  changesApplied: string[];
}

export interface BuyerResponse {
  stoppedAt?: string;
  quotable?: string;
  questions: string[];
  reaction: string;
  reactionEmoji: string;
}

// API request/response types
export interface AgentRequest {
  document: string;
  goal?: string;
  acceptedFeedback?: EditorFeedback[];
}

export interface PipelineConfig {
  apiKey: string;
  model?: string;
}
