import { apiClient } from '../utils/apiClient';
import { TrainingCenter, TrainingCenterNote } from '../types';

export interface TrainingCenterResponse {
  status: 'success' | 'error';
  data: TrainingCenter;
}

export interface TrainingCenterNotesResponse {
  status: 'success' | 'error';
  data: TrainingCenterNote[];
}

export interface TrainingCenterNoteResponse {
  status: 'success' | 'error';
  data: TrainingCenterNote;
}

export const trainingCenterService = {
  /**
   * Get training center details by ID
   * GET /training-center/get-training-center?id=
   */
  async getTrainingCenter(id: number): Promise<TrainingCenterResponse> {
    return apiClient.get<TrainingCenterResponse>(
      `/training-center/get-training-center?id=${id}`
    );
  },

  /**
   * Get all notes for a training center
   * GET /training-center/get-all-notes-bt-training-center?training_center_id=
   */
  async getAllNotes(trainingCenterId: number): Promise<TrainingCenterNotesResponse> {
    return apiClient.get<TrainingCenterNotesResponse>(
      `/training-center/get-all-notes-bt-training-center?training_center_id=${trainingCenterId}`
    );
  },

  /**
   * Get a single note by ID
   * GET /training-center/get-note?id=
   */
  async getNote(noteId: number): Promise<TrainingCenterNoteResponse> {
    return apiClient.get<TrainingCenterNoteResponse>(
      `/training-center/get-note?id=${noteId}`
    );
  },
};