import type { ContestStatus, Difficulty } from '@/lib/types';
import { Circle } from 'lucide-react';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ContestStatus;
}

const statusConfig: Record<ContestStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'badge-amber' },
  SCHEDULED: { label: 'Upcoming', className: 'badge-violet' },
  ACTIVE: { label: 'Live', className: 'badge-green' },
  ENDED: { label: 'Ended', className: 'badge-red' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`badge ${config.className}`} id={`status-badge-${status.toLowerCase()}`}>
      {status === 'ACTIVE' && (
        <Circle size={6} fill="currentColor" className={styles.pulse} />
      )}
      {config.label}
    </span>
  );
}

// ── Difficulty Badge ──────────────────────────────────

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const difficultyConfig: Record<Difficulty, { className: string }> = {
  EASY: { className: 'badge-green' },
  MEDIUM: { className: 'badge-amber' },
  HARD: { className: 'badge-red' },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <span className={`badge ${config.className}`}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
}
