'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import AuthGuard from '@/app/components/AuthGuard';
import { toast } from '@/app/components/Toast';
import { ArrowLeft, Plus, Calendar, Clock, FileText, Lock, Send } from 'lucide-react';
import Link from 'next/link';
import styles from './create.module.css';

function CreateContestForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const contest = await contestApi.createContest({
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        createdBy: user.userId,
        password: formData.password || undefined,
      });
      toast.success('Contest created!');
      router.push(`/contests/${contest.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create contest';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/contests" className={styles.back}>
        <ArrowLeft size={16} />
        Back to Contests
      </Link>

      <div className={styles.header}>
        <h1>
          <Plus size={32} className={styles.titleIcon} />
          Create Contest
        </h1>
        <p className={styles.subtitle}>Set up a new programming contest</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} id="create-contest-form">
        {/* Title */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FileText size={18} />
            Basic Info
          </h3>

          <div className="input-group">
            <label className="input-label" htmlFor="contest-title">Title</label>
            <input
              id="contest-title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Weekly Round 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className="input-error-text">{errors.title}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="contest-description">
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="contest-description"
              className={`input ${styles.textarea}`}
              placeholder="Contest description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Calendar size={18} />
            Schedule
          </h3>

          <div className={styles.row}>
            <div className="input-group">
              <label className="input-label" htmlFor="contest-start">Start Time</label>
              <input
                id="contest-start"
                type="datetime-local"
                className={`input ${errors.startTime ? 'input-error' : ''}`}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              {errors.startTime && <span className="input-error-text">{errors.startTime}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="contest-end">End Time</label>
              <input
                id="contest-end"
                type="datetime-local"
                className={`input ${errors.endTime ? 'input-error' : ''}`}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
              {errors.endTime && <span className="input-error-text">{errors.endTime}</span>}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Lock size={18} />
            Security <span className={styles.optional}>(optional)</span>
          </h3>

          <div className="input-group">
            <label className="input-label" htmlFor="contest-password">
              Contest Password
            </label>
            <input
              id="contest-password"
              type="password"
              className="input"
              placeholder="Leave empty for no password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <span className="input-hint">
              Participants will need this password to join the contest.
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          disabled={loading}
          id="create-contest-submit"
        >
          {loading ? 'Creating...' : (
            <>
              <Send size={18} />
              Create Contest
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function CreateContestPage() {
  return (
    <AuthGuard>
      <CreateContestForm />
    </AuthGuard>
  );
}
