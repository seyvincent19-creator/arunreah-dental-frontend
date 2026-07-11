import api from './axios';
import type { DashboardAnalytics } from '../types/analytics';

export const fetchDashboardAnalytics = () =>
  api.get<DashboardAnalytics>('/dashboard/analytics').then((res) => res.data);
