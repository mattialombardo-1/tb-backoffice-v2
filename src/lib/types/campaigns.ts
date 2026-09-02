export type CampaignQuestionStatus = 'draft' | 'in_review' | 'approved' | 'rejected';
export type CampaignQuestionType = 'MULTIPLE_CHOICE' | 'COMPLETION';

export interface CampaignQuestionSlot {
  id: string;
  status: CampaignQuestionStatus;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty?: number;
  questionType?: CampaignQuestionType;
  assigneeId: string;
  revisorId: string;
  dueDate?: string;
  collection?: string;
  pool?: string;
  questionId?: string;
}

/** Slot enriched with campaign context — returned by GET /campaigns/my-slots */
export interface CampaignSlotWithContext extends CampaignQuestionSlot {
  campaignId: string;
  campaignName: string;
}

export interface Campaign {
  id: string;
  name: string;
  totalQuestions: number;
  remainingQuestions: number;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDetail extends Campaign {
  questions: CampaignQuestionSlot[];
}

export type NewCampaignQuestionSlot = Omit<CampaignQuestionSlot, 'id'>;

export interface CreateCampaignPayload {
  name: string;
  questions: NewCampaignQuestionSlot[];
}

export interface UpdateCampaignPayload {
  name?: string;
  questions?: NewCampaignQuestionSlot[];
}
