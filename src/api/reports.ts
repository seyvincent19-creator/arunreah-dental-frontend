import api from './axios';
import type { ReportData, ReportFilters, ReportType } from '../types/report';

export const fetchReport = (type: ReportType, filters: ReportFilters) =>
  api.get<ReportData>(`/reports/${type}`, { params: filters }).then((res) => res.data);

function extractFileName(contentDisposition: string | undefined, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

async function downloadReport(type: ReportType, filters: ReportFilters, format: 'pdf' | 'excel', fallbackName: string) {
  const response = await api.get(`/reports/${type}`, {
    params: { ...filters, export: format },
    responseType: 'blob',
  });

  const fileName = extractFileName(response.headers['content-disposition'], fallbackName);
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const downloadReportPdf = (type: ReportType, filters: ReportFilters) =>
  downloadReport(type, filters, 'pdf', `${type}-report.pdf`);

export const downloadReportExcel = (type: ReportType, filters: ReportFilters) =>
  downloadReport(type, filters, 'excel', `${type}-report.xlsx`);
