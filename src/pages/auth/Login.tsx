import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { LoginPayload } from '../../types/auth';

export default function Login() {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  const onSubmit = async (data: LoginPayload) => {
    setIsSubmitting(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      Swal.fire({
        icon: 'error',
        title: t('invalid_credentials'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: 380 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-end mb-2">
            <select
              className="form-select form-select-sm w-auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'km')}
            >
              <option value="en">EN</option>
              <option value="km">KH</option>
            </select>
          </div>

          <h4 className="text-center mb-4">{t('clinic_name')}</h4>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label">{t('email')}</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', { required: true })}
              />
              {errors.email && <div className="invalid-feedback">{t('email')} is required.</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">{t('password')}</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                {...register('password', { required: true })}
              />
              {errors.password && (
                <div className="invalid-feedback">{t('password')} is required.</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? t('signing_in') : t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
