// Join Request Types - aligned with swagger.json

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface JoinRequest {
  id: number;
  course_id: number;
  course_name?: string;
  course_image_url?: string;
  training_center_name?: string;
  status: JoinRequestStatus;
  requested_at: string;
  updated_at?: string;
}

export interface JoinRequestResponse {
  status: 'success' | 'error';
  data: JoinRequest[];
}

export interface JoinRequestStatusResponse {
  status: 'success' | 'error';
  data: {
    has_request: boolean;
    request_id?: number;
    status?: JoinRequestStatus;
  };
}

export interface CreateJoinRequestResponse {
  status: 'success' | 'error';
  data: {
    id: number;
    course_id: number;
    status: JoinRequestStatus;
  };
  message?: string;
}

export interface CourseJoinStatus {
  has_request: boolean;
  request_id?: number;
  status?: JoinRequestStatus;
}