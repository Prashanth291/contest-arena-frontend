'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { toast } from '@/app/components/Toast';
import { UserPlus, Mail, Lock, User, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      login(response.token, response.username);
      toast.success('Account created successfully!');
      router.push('/contests');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left — Decorative */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.leftGlow} aria-hidden="true" />
          <div className={styles.brandMark}>
            <Zap size={48} />
          </div>
          <h2 className={styles.leftTitle}>
            Join the
            <br />
            <span className="text-gradient">Arena</span>
          </h2>
          <p className={styles.leftText}>
            Create your account to start competing, creating contests,
            and tracking your progress on the leaderboard.
          </p>

          <div className={styles.codeBlock}>
            <div className={styles.codeLine}>
              <span className={styles.codeKeyword}>const</span>
              <span> </span>
              <span className={styles.codeVar}>coder</span>
              <span> = </span>
              <span className={styles.codeParen}>{'{'}</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeIndent}>  </span>
              <span className={styles.codeString}>skill</span>
              <span>: </span>
              <span className={styles.codeString}>&quot;growing&quot;</span>
              <span>,</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeIndent}>  </span>
              <span className={styles.codeString}>rank</span>
              <span>: </span>
              <span className={styles.codeVar}>climbing</span>
              <span>,</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeIndent}>  </span>
              <span className={styles.codeString}>passion</span>
              <span>: </span>
              <span className={styles.codeKeyword}>Infinity</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.codeParen}>{'}'}</span>
              <span>;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create Account</h1>
            <p className={styles.formSubtitle}>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles.formLink}>
                Sign in
              </Link>
            </p>
          </div>

          {/* OAuth buttons */}
          <div className={styles.oauthBtns}>
            <a
              href={authApi.getOAuthUrl('google')}
              className={styles.oauthBtn}
              id="register-google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            <a
              href={authApi.getOAuthUrl('github')}
              className={styles.oauthBtn}
              id="register-github"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
</svg>
Continue with GitHub
            </a>
          </div>

          <div className={styles.divider}>
            <span>or register with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} id="register-form">
            <div className="input-group">
              <label className="input-label" htmlFor="register-username">
                Username
              </label>
              <div className={styles.inputWithIcon}>
                <User size={16} className={styles.inputIcon} />
                <input
                  id="register-username"
                  type="text"
                  className={`input ${errors.username ? 'input-error' : ''}`}
                  placeholder="coderx"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  autoComplete="username"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.username && (
                <span className="input-error-text">{errors.username}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="register-email">
                Email
              </label>
              <div className={styles.inputWithIcon}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="register-email"
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && (
                <span className="input-error-text">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="register-password">
                Password
              </label>
              <div className={styles.inputWithIcon}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="input-error-text">{errors.password}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className={styles.inputWithIcon}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.confirmPassword && (
                <span className="input-error-text">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
