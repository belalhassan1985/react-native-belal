export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  data: {
    token: string;
    role: string;
  };
}

export interface ProfileState {
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  coordinates: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  first_name: string;
  second_name: string;
  third_name: string;
  fourth_name: string;
  nickname: string;
  gender: 'male' | 'female';
  birth_date: string;
  training_center: string | null;
  state: ProfileState;
  agency: string | null;
  general_department: string | null;
  department: string | null;
  section: string | null;
  image_url: string;
  is_first_login: boolean;
}

export interface ProfileResponse {
  status: 'success' | 'error';
  data: UserProfile;
}

export interface ApiError {
  message: string;
  code?: string;
}

export * from './course';
export * from './lessonProgress';