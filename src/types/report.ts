export type ReportType =
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'treatments'
  | 'prescriptions'
  | 'medicines'
  | 'income';

export type ReportGroupBy = 'day' | 'month' | 'year';

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportData {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  summary: Record<string, string | number>;
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  group_by?: ReportGroupBy;
  doctor_id?: number;
  status?: string;
  low_stock?: boolean;
}
