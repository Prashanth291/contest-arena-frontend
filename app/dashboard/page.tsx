'use client';

import { useAuth } from '@/lib/auth';
import AuthGuard from '@/app/components/AuthGuard';
import Link from 'next/link';
import { Trophy, Plus, Code2, User, Shield, Mail } from 'lucide-react';
import styles from './dashboard.module.css';

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`container ${styles.page}`}>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <h1>{user.username}</h1>
          <div className={styles.profileMeta}>
            <span className={styles.metaItem}>
              <Mail size={14} />
              {user.email}
            </span>
            <span className={`badge ${user.role === 'ADMIN' ? 'badge-violet' : 'badge-cyan'}`}>
              <Shield size={10} />
              {user.role}
            </span>
          </div>
          <span className={styles.userId}>
            ID: <code className="mono">{user.userId}</code>
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/contests" className={styles.actionCard} id="dash-contests">
            <Trophy size={28} className={styles.actionIcon} style={{ color: 'var(--accent-cyan)' }} />
            <h3>Browse Contests</h3>
            <p>View and join active contests</p>
          </Link>
          <Link href="/contests/create" className={styles.actionCard} id="dash-create-contest">
            <Plus size={28} className={styles.actionIcon} style={{ color: 'var(--accent-violet)' }} />
            <h3>Create Contest</h3>
            <p>Set up a new programming contest</p>
          </Link>
          <Link href="/problems/create" className={styles.actionCard} id="dash-create-problem">
            <Code2 size={28} className={styles.actionIcon} style={{ color: 'var(--accent-green)' }} />
            <h3>Create Problem</h3>
            <p>Add new problems to the bank</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
