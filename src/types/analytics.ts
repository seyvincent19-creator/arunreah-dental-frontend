export interface SeriesPoint {
  label: string;
  value: number;
}

export interface DashboardAnalytics {
  appointments_by_month: SeriesPoint[];
  patient_registrations_by_month: SeriesPoint[];
  revenue_by_month: SeriesPoint[];
  medicine_stock: SeriesPoint[];
}
