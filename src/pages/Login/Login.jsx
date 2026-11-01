import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { IconEye, IconEyeSlash } from '../../components/Icons/Icons';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya tiene sesión activa, redirigir al Dashboard
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__badge">S</div>
          <h1 className="login-card__title">SENATI — Inventario</h1>
          <p className="login-card__subtitle">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              placeholder="admin@gmail.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Contraseña</label>
            <div className="login-input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <IconEyeSlash size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="login-footer-info">
          Laboratorio #9 — SENATI © 2026
        </div>
      </div>
    </div>
  );
}
