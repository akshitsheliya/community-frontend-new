import axios from "axios";
import { LOCAL_STORAGE_KEYS } from "./constants";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4002",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized (e.g., clear token, redirect)
      console.error("Authentication error");
    }
    return Promise.reject(error);
  }
);

import type { 
  LoginRequest, 
  RegisterRequest, 
  OtpVerifyRequest, 
  ApiResponse, 
  AuthResponse,
  Community,
  Member,
  User,
  PaginatedResponse
} from "../types/api";

export const authApi = {
  sendLoginOtp: async (data: LoginRequest) => {
    return api.post<ApiResponse<any>>("/api/login/mobile", data);
  },
  verifyLoginOtp: async (data: OtpVerifyRequest) => {
    return api.post<ApiResponse<AuthResponse>>("/api/login/verify-otp", data);
  },
  sendRegisterOtp: async (data: RegisterRequest) => {
    return api.post<ApiResponse<any>>("/api/register/mobile", data);
  },
  verifyRegisterOtp: async (data: OtpVerifyRequest) => {
    return api.post<ApiResponse<AuthResponse>>("/api/register/verify-otp", data);
  },
  getCurrentUser: async () => {
    return api.get<ApiResponse<User>>("/api/user");
  },
  logout: () => {
    // Client side logout logic only for now
    return Promise.resolve({ success: true });
  }
};

export const communityApi = {
  getAll: async () => {
    return api.get<ApiResponse<Community[]>>("/api/community");
  },
  getByNumber: async (number: number) => {
    return api.get<ApiResponse<Community[]>>(`/api/community?community_number=${number}`);
  },
  getByUuid: async (uuid: string) => {
    return api.get<ApiResponse<Community>>(`/api/community/${uuid}`);
  }
};

export const memberApi = {
  getList: async (params?: Record<string, any>) => {
    return api.get<ApiResponse<PaginatedResponse<Member>>>("/api/members", { params });
  },
  getById: async (id: string) => {
    return api.get<ApiResponse<Member>>(`/api/members/${id}`);
  }
};

export const countsApi = {
  getCounts: async (year: number = new Date().getFullYear()) => {
    // Return any since the exact counts response type is complex and dynamic
    return api.get<ApiResponse<any>>(`/api/counts?year=${year}`);
  }
};

