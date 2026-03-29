'use client';

import Link from 'next/link';
import type { ContestResponse } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import ContestTimer from './ContestTimer';
import { Users, BookOpen } from 'lucide-react';
import styles from './ContestCard.module.css';

interface ContestCardProps {
  contest: ContestResponse;
  index?: number;
}

export default function ContestCard({ contest, index = 0 }: ContestCardProps) {

  return (
    <Link
      href={`/contests/${contest.id}`}
      className={`${styles.card} animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
      id={`contest-card-${contest.id}`}
    >
      {/* Top gradient line */}
      <div className={styles.topLine} />

      <div className={styles.header}>
        <StatusBadge status={contest.status} />
      </div>

      <h3 className={styles.title}>{contest.title}</h3>

      {contest.description && (
        <p className={styles.description}>
          {contest.description.length > 120
            ? contest.description.slice(0, 120) + '...'
            : contest.description}
        </p>
      )}

      <div className={styles.timer}>
        <ContestTimer
          startTime={contest.startTime}
          endTime={contest.endTime}
          status={contest.status}
          compact
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <BookOpen size={14} />
          <span>{contest.problems.length} problems</span>
        </div>
      </div>
    </Link>
  );
}
