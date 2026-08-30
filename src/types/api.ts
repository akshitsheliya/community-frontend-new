export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}

export interface Community {
  community_id: number;
  community_uuid: string;
  community_name: string;
  community_description: string;
  community_number: number;
  added_on: string;
  updated_on: string;
}

export interface Member {
  member_id: number;
  member_uuid: string;
  first_name: string;
  father_name?: string;
  surname: string;
  phone_number: string;
  email_id?: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  profile_photo?: string;
  family_sr_id?: number;
  family_uuid?: string;
  is_family_representative?: boolean;
  is_committee_member?: boolean;
  is_community_admin?: boolean;
  designation?: string;
  address?: string;
  current_resident?: string;
}

export interface Family {
  family_sr_id: number;
  family_uuid: string;
  family_main_member_id: number;
  number_of_family_members: number;
  members?: Member[];
  family_number?: number;
  main_member_name?: string;
}

export interface User {
  user_id: number;
  user_uuid: string;
  member_id?: number;
  phone_number: string;
  first_name?: string;
  surname?: string;
  profile_photo?: string;
}

export interface LoginRequest {
  phone_number: string;
  community_uuid?: string;
}

export interface RegisterRequest {
  phone_number: string;
  community_uuid?: string;
  first_name?: string;
  surname?: string;
}

export interface OtpVerifyRequest {
  phone_number: string;
  otp: string;
  community_uuid?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
