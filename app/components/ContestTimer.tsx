'use client';

import { useState, useEffect } from 'react';
import type { ContestStatus } from '@/lib/types';
import styles from './ContestTimer.module.css';

interface ContestTimerProps {
  startTime: string;
  endTime: string;
  status: ContestStatus;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const total = new Date(targetDate).getTime() - Date.now();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function calculateElapsed(startTime: string): TimeRemaining {
  const total = Date.now() - new Date(startTime).getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function ContestTimer({ startTime, endTime, status, compact = false }: ContestTimerProps) {
  const [time, setTime] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  const isCountdown = status === 'SCHEDULED' || status === 'DRAFT';
  const isLive = status === 'ACTIVE';
  const isEnded = status === 'ENDED';

  useEffect(() => {
    function update() {
      if (isCountdown) {
        setTime(calculateTimeRemaining(startTime));
      } else if (isLive) {
        setTime(calculateTimeRemaining(endTime));
      } else if (isEnded) {
        setTime(calculateElapsed(startTime));
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, status, isCountdown, isLive, isEnded]);

  if (compact) {
    return (
      <span className={`${styles.compact} ${isLive ? styles.live : ''}`}>
        {isCountdown && `Starts in ${time.days > 0 ? `${time.days}d ` : ''}${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`}
        {isLive && `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)} left`}
        {isEnded && 'Contest ended'}
      </span>
    );
  }

  if (isEnded) {
    return (
      <div className={styles.ended}>
        <span className={styles.endedText}>Contest has ended</span>
      </div>
    );
  }

  return (
    <div className={`${styles.timer} ${isLive ? styles.timerLive : ''}`}>
      <span className={styles.label}>
        {isCountdown ? 'Starts in' : 'Ends in'}
      </span>
      <div className={styles.blocks}>
        {time.days > 0 && (
          <div className={styles.block}>
            <span className={styles.value}>{pad(time.days)}</span>
            <span className={styles.unit}>days</span>
          </div>
        )}
        <div className={styles.block}>
          <span className={styles.value}>{pad(time.hours)}</span>
          <span className={styles.unit}>hrs</span>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.block}>
          <span className={styles.value}>{pad(time.minutes)}</span>
          <span className={styles.unit}>min</span>
        </div>
        <div className={styles.separator}>:</div>
        <div className={styles.block}>
          <span className={`${styles.value} ${styles.seconds}`}>{pad(time.seconds)}</span>
          <span className={styles.unit}>sec</span>
        </div>
      </div>
    </div>
  );
}
