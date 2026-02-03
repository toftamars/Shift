import axios from 'axios';
import { AUTH_STORAGE_KEYS } from '../store/authSlice';

// Vercel'de (*.vercel.app) veya canonical host'ta API aynı origin'de; aksi halde localhost
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '/api/v1';
  const host = window.location.hostname;
  if (host === 'shift-mauve.vercel.app' || host.endsWith('.vercel.app')) return '/api/v1';
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
};
const API_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEYS.token);
        localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      } catch {}
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const employeesApi = {
  list: (departmentId?: string) =>
    api.get<Array<{ id: string; name: string; employee_code: string; department_id: string | null; department_name?: string | null }>>(
      '/employees' + (departmentId ? `?department_id=${departmentId}` : '')
    ),
  get: (id: string) => api.get(`/employees/${id}`),
  availableUsers: () =>
    api.get<Array<{ id: string; name: string; email: string }>>('/employees/available-users'),
  create: (body: { user_id: string; department_id?: string | null; employee_code: string; hire_date: string }) =>
    api.post<{ id: string }>('/employees', body),
};

export const departmentsApi = {
  list: () => api.get<Array<{ id: string; name: string; description: string | null }>>('/departments'),
  create: (body: { name: string; description?: string | null }) =>
    api.post<{ id: string; name: string; description: string | null }>('/departments', body),
};

export const shiftTypesApi = {
  list: () => api.get<Array<{ id: string; name: string; start_time: string; end_time: string; color_code: string | null }>>('/shift-types'),
};

export const shiftsApi = {
  listByDateRange: (fromDate: string, toDate: string) =>
    api.get<Array<{
      id: string;
      employee_id: string;
      shift_date: string;
      start_time: string;
      end_time: string;
      employee_name: string;
    }>>('/shifts', { params: { from_date: fromDate, to_date: toDate } }),
  listBySchedule: (scheduleId: string) =>
    api.get('/shifts', { params: { schedule_id: scheduleId } }),
  create: (body: { employee_id: string; shift_type_id: string; shift_date: string; start_time: string; end_time: string }) =>
    api.post<{ id: string; employee_id: string; shift_type_id: string; shift_date: string; start_time: string; end_time: string }>('/shifts', body),
};

export const schedulesApi = {
  list: (departmentId?: string) =>
    api.get('/schedules' + (departmentId ? `?department_id=${departmentId}` : '')),
  get: (id: string) => api.get(`/schedules/${id}`),
};
