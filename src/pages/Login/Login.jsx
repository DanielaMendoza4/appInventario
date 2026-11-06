import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { IconEye, IconEyeSlash } from '../../components/Icons/Icons';
import FloatingField from '../../components/ui/FloatingField';
import logoCompletoTransparente from '../../assets/logo-completo-transparente.svg';

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
      <div className="login-bg" aria-hidden="true">
        <span className="login-ring login-ring--1" />
        <span className="login-ring login-ring--2" />
        <span className="login-ring login-ring--3" />
        <span className="login-orbit">
          <span className="login-orbit__dot" />
        </span>
      </div>

      <main className="login-layout">
        <section className="login-brand">
          <div className="login-brand__mark">
            <img
              className="login-brand__logo"
              src={logoCompletoTransparente}
              alt="Logotipo del sistema de inventario"
            />
          </div>

          <h1 className="login-brand__title">
            Tu stock, siempre bajo control.
          </h1>

          <p className="login-brand__subtitle">
            Controla productos, proveedores y movimientos en un solo lugar.
          </p>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card__header">
            <h2 id="login-title" className="login-card__title">
              Iniciar sesión
            </h2>
            <p className="login-card__subtitle">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <FloatingField
              id="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />

            <FloatingField
              id="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              trailing={
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Ver contraseña'
                  }
                >
                  {showPassword ? <IconEyeSlash size={18} /> : <IconEye size={18} />}
                </button>
              }
            />

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar al sistema'}
            </button>
          </form>

          <p className="login-card__footer">
            Sistema de inventario © 2026
          </p>
        </section>
      </main>
    </div>
  );
}
