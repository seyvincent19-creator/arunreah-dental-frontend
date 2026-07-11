import { useEffect, useState } from 'react';
import { FiDownload, FiFileText, FiSearch } from 'react-icons/fi';
import { downloadReportExcel, downloadReportPdf, fetchReport } from '../../api/reports';
import DoctorSelect from '../../components/pickers/DoctorSelect';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/dictionary';
import type { ReportData, ReportGroupBy, ReportType } from '../../types/report';
import { notifyError } from '../../utils/confirm';

const REPORT_TYPE_LABEL_KEYS: Record<ReportType, TranslationKey> = {
  patients: 'patient_report',
  doctors: 'doctor_report',
  appointments: 'appointment_report',
  treatments: 'treatment_report',
  prescriptions: 'prescription_report',
  medicines: 'medicine_report',
  income: 'income_report',
};

const ADMIN_REPORT_TYPES: ReportType[] = [
  'patients',
  'doctors',
  'appointments',
  'treatments',
  'prescriptions',
  'medicines',
  'income',
];

const DOCTOR_REPORT_TYPES: ReportType[] = ['appointments', 'treatments', 'prescriptions'];

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthStartIso = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role.name === 'admin';
  const availableTypes = isAdmin ? ADMIN_REPORT_TYPES : DOCTOR_REPORT_TYPES;

  const [type, setType] = useState<ReportType>(availableTypes[0]);
  const [dateFrom, setDateFrom] = useState(monthStartIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [groupBy, setGroupBy] = useState<ReportGroupBy | ''>('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const supportsDateRange = type !== 'medicines';
  const supportsGroupBy = ['patients', 'appointments', 'treatments', 'prescriptions', 'income'].includes(type);
  const supportsDoctorFilter = isAdmin && ['appointments', 'treatments', 'prescriptions'].includes(type);

  const buildFilters = () => ({
    date_from: supportsDateRange ? dateFrom : undefined,
    date_to: supportsDateRange ? dateTo : undefined,
    group_by: supportsGroupBy && groupBy ? groupBy : undefined,
    doctor_id: supportsDoctorFilter && doctorId ? doctorId : undefined,
    low_stock: type === 'medicines' && lowStockOnly ? true : undefined,
  });

  const runReport = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReport(type, buildFilters());
      setReport(data);
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await downloadReportPdf(type, buildFilters());
      } else {
        await downloadReportExcel(type, buildFilters());
      }
    } catch {
      notifyError(t('something_went_wrong'));
    } finally {
      setIsExporting(false);
    }
  };

  const summaryEntries = report ? Object.entries(report.summary) : [];

  return (
    <div>
      <PageHeader title={t('reports')} subtitle={t('reports_subtitle')} />

      <div className="card shadow-soft mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">{t('report_type')}</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as ReportType)}
              >
                {availableTypes.map((rt) => (
                  <option key={rt} value={rt}>
                    {t(REPORT_TYPE_LABEL_KEYS[rt])}
                  </option>
                ))}
              </select>
            </div>

            {supportsDateRange && (
              <>
                <div className="col-md-2">
                  <label className="form-label">{t('date_from')}</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">{t('date_to')}</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}

            {supportsGroupBy && (
              <div className="col-md-2">
                <label className="form-label">{t('group_by')}</label>
                <select
                  className="form-select"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as ReportGroupBy | '')}
                >
                  <option value="">{t('no_grouping')}</option>
                  <option value="day">{t('daily')}</option>
                  <option value="month">{t('monthly')}</option>
                  <option value="year">{t('yearly')}</option>
                </select>
              </div>
            )}

            {supportsDoctorFilter && (
              <div className="col-md-3">
                <label className="form-label">{t('doctors')}</label>
                <DoctorSelect value={doctorId} onChange={setDoctorId} />
              </div>
            )}

            {type === 'medicines' && (
              <div className="col-md-3 form-check mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="lowStockOnly"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="lowStockOnly">
                  {t('low_stock')}
                </label>
              </div>
            )}

            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary d-flex align-items-center gap-2 w-100" onClick={runReport}>
                <FiSearch /> {t('generate_report')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-soft">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h6 className="fw-semibold mb-0">{report?.title ?? ''}</h6>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              disabled={isExporting}
              onClick={() => handleExport('pdf')}
            >
              <FiDownload /> {t('export_pdf')}
            </button>
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              disabled={isExporting}
              onClick={() => handleExport('excel')}
            >
              <FiDownload /> {t('export_excel')}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                {report?.columns.map((col) => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={report?.columns.length ?? 1} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                report?.rows.map((row, idx) => (
                  <tr key={idx}>
                    {report.columns.map((col) => (
                      <td key={col.key}>{row[col.key]}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && report?.rows.length === 0 && (
            <EmptyState icon={<FiFileText />} title={t('no_report_data')} />
          )}
        </div>

        {report && summaryEntries.length > 0 && (
          <div className="card-body pt-2 d-flex gap-4 border-top">
            {summaryEntries.map(([key, value]) => (
              <div key={key} className="small">
                <span className="text-muted-soft text-capitalize">{key.replace(/_/g, ' ')}: </span>
                <span className="fw-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
