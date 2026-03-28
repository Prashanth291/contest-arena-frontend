'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ContestResponse } from '@/lib/types';
import { StatusBadge, DifficultyBadge } from '@/app/components/StatusBadge';
import ContestTimer from '@/app/components/ContestTimer';
import { toast } from '@/app/components/Toast';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Check,
  Play,
  LogIn,
  BarChart3,
  Hash,
  Award,
  Clock,
} from 'lucide-react';
import styles from './detail.module.css';

export default function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const data = await contestApi.getContest(id);
        setContest(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load contest';
        toast.error(message);
        router.push('/contests');
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id, router]);

  const copyJoinCode = async () => {
    if (!contest) return;
    try {
      await navigator.clipboard.writeText(contest.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // pass
    }
  };

  const handleJoin = async () => {
    if (!contest) return;
    setJoining(true);
    try {
      await contestApi.joinContest(contest.joinCode, { password: joinPassword || undefined });
      toast.success('Successfully joined contest!');
      setShowJoinForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join contest';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async () => {
    if (!contest) return;
    setStarting(true);
    try {
      await contestApi.startContest(contest.id);
      toast.success('Contest started!');
      const updated = await contestApi.getContest(id);
      setContest(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start contest';
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  if (loading || !contest) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Loading contest...</p>
        </div>
      </div>
    );
  }

  const isCreator = user?.userId === contest.createdBy;
  const canStart = isCreator && (contest.status === 'DRAFT' || contest.status === 'SCHEDULED');

  return (
    <div className={`container ${styles.page}`}>
      {/* Back link */}
      <Link href="/contests" className={styles.back} id="contest-back">
        <ArrowLeft size={16} />
        Back to Contests
      </Link>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <StatusBadge status={contest.status} />
          <button className={styles.joinCodeBtn} onClick={copyJoinCode} id="contest-copy-code">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="mono">{contest.joinCode}</span>
          </button>
        </div>

        <h1 className={styles.title}>{contest.title}</h1>

        {contest.description && (
          <p className={styles.description}>{contest.description}</p>
        )}

        {/* Timer */}
        <div className={styles.timerWrapper}>
          <ContestTimer
            startTime={contest.startTime}
            endTime={contest.endTime}
            status={contest.status}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              {(contest.status === 'ACTIVE' || contest.status === 'SCHEDULED') && !showJoinForm && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowJoinForm(true)}
                  id="contest-join-btn"
                >
                  <LogIn size={18} />
                  Join Contest
                </button>
              )}
              {canStart && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleStart}
                  disabled={starting}
                  id="contest-start-btn"
                >
                  <Play size={18} />
                  {starting ? 'Starting...' : 'Start Contest'}
                </button>
              )}
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-primary btn-lg">
              <LogIn size={18} />
              Sign in to Join
            </Link>
          )}

          <Link
            href={`/contests/${id}/leaderboard`}
            className="btn btn-secondary btn-lg"
            id="contest-leaderboard-btn"
          >
            <BarChart3 size={18} />
            Leaderboard
          </Link>
        </div>

        {/* Join form */}
        {showJoinForm && (
          <div className={styles.joinForm}>
            <input
              type="password"
              className="input"
              placeholder="Contest password (if required)"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              id="contest-join-password"
            />
            <div className={styles.joinFormBtns}>
              <button
                className="btn btn-primary"
                onClick={handleJoin}
                disabled={joining}
                id="contest-join-submit"
              >
                {joining ? 'Joining...' : 'Confirm Join'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowJoinForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Problems list */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <BookOpen size={22} />
          Problems
          <span className={styles.count}>{contest.problems.length}</span>
        </h2>

        {contest.problems.length === 0 ? (
          <div className={styles.emptyProblems}>
            <p>No problems assigned to this contest yet.</p>
          </div>
        ) : (
          <div className={styles.problemList}>
            {contest.problems
              .sort((a, b) => a.problemOrder - b.problemOrder)
              .map((problem) => (
                <Link
                  key={problem.problemId}
                  href={`/contests/${id}/problems/${problem.problemId}`}
                  className={styles.problemRow}
                  id={`problem-${problem.label}`}
                >
                  <div className={styles.problemLabel}>
                    <span className={styles.label}>{problem.label}</span>
                  </div>
                  <div className={styles.problemInfo}>
                    <span className={styles.problemTitle}>{problem.title}</span>
                  </div>
                  <div className={styles.problemScore}>
                    <Award size={14} />
                    <span className="mono">{problem.score}</span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Clock size={22} />
          Schedule
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Start Time</span>
            <span className={`${styles.infoValue} mono`}>
              {new Date(contest.startTime).toLocaleString()}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>End Time</span>
            <span className={`${styles.infoValue} mono`}>
              {new Date(contest.endTime).toLocaleString()}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Duration</span>
            <span className={`${styles.infoValue} mono`}>
              {Math.round(
                (new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) /
                  1000 / 60,
              )} minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
