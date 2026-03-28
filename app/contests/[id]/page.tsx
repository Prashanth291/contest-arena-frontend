'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ContestResponse } from '@/lib/types';
import { StatusBadge } from '@/app/components/StatusBadge';
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
  Award,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
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
  const [assigning, setAssigning] = useState(false);
  const [removingProblemId, setRemovingProblemId] = useState<string | null>(null);
  const [deletingContest, setDeletingContest] = useState(false);
  const [assignForm, setAssignForm] = useState({
    problemId: '',
    label: '',
    problemOrder: 1,
    score: 500,
  });

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

  const refreshContest = async () => {
    try {
      const data = await contestApi.getContest(id);
      setContest(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to refresh contest';
      toast.error(message);
    }
  };

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
      await refreshContest();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start contest';
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  const handleAssign = async () => {
    if (!contest) return;
    if (!assignForm.problemId.trim() || !assignForm.label.trim()) {
      toast.error('Problem ID and label are required');
      return;
    }
    setAssigning(true);
    try {
      await contestApi.assignProblem(contest.id, {
        problemId: assignForm.problemId.trim(),
        label: assignForm.label.trim(),
        problemOrder: Number(assignForm.problemOrder),
        score: Number(assignForm.score),
      });
      toast.success('Problem assigned');
      setAssignForm({ problemId: '', label: '', problemOrder: 1, score: 500 });
      await refreshContest();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign problem';
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveProblem = async (problemId: string) => {
    if (!contest) return;
    setRemovingProblemId(problemId);
    try {
      await contestApi.removeProblemFromContest(contest.id, problemId);
      toast.success('Problem removed');
      await refreshContest();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove problem';
      toast.error(message);
    } finally {
      setRemovingProblemId(null);
    }
  };

  const handleDeleteContest = async () => {
    if (!contest) return;
    const confirmDelete = window.confirm('Delete this contest? This cannot be undone.');
    if (!confirmDelete) return;
    setDeletingContest(true);
    try {
      await contestApi.deleteContest(contest.id);
      toast.success('Contest deleted');
      router.push('/contests');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete contest';
      toast.error(message);
    } finally {
      setDeletingContest(false);
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
              {isCreator && (
                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleDeleteContest}
                  disabled={deletingContest}
                  id="contest-delete-btn"
                >
                  <AlertTriangle size={18} />
                  {deletingContest ? 'Deleting...' : 'Delete Contest'}
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

        {isCreator && (
          <div className={styles.manageCard}>
            <div className={styles.manageHeader}>
              <div className={styles.manageTitle}>
                <Plus size={16} />
                Assign Problem
              </div>
              <Link href="/problems/create" className={styles.manageHint}>
                Need to create a problem first? Add one here.
              </Link>
            </div>
            <div className={styles.manageGrid}>
              <div className="input-group">
                <label className="input-label" htmlFor="assign-problem-id">Problem ID</label>
                <input
                  id="assign-problem-id"
                  className="input"
                  placeholder="Existing problem UUID"
                  value={assignForm.problemId}
                  onChange={(e) => setAssignForm({ ...assignForm, problemId: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="assign-label">Label (A, B, C...)</label>
                <input
                  id="assign-label"
                  className="input"
                  placeholder="A"
                  value={assignForm.label}
                  onChange={(e) => setAssignForm({ ...assignForm, label: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.manageGrid}>
              <div className="input-group">
                <label className="input-label" htmlFor="assign-order">Problem Order</label>
                <input
                  id="assign-order"
                  type="number"
                  className="input"
                  value={assignForm.problemOrder}
                  min={0}
                  onChange={(e) => setAssignForm({ ...assignForm, problemOrder: Number(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="assign-score">Score</label>
                <input
                  id="assign-score"
                  type="number"
                  className="input"
                  value={assignForm.score}
                  min={0}
                  onChange={(e) => setAssignForm({ ...assignForm, score: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className={styles.manageActions}>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={assigning}
                id="assign-problem-btn"
              >
                {assigning ? 'Assigning...' : 'Assign Problem'}
              </button>
            </div>
          </div>
        )}

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
                  {isCreator && (
                    <button
                      className={styles.removeProblemBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveProblem(problem.problemId);
                      }}
                      disabled={removingProblemId === problem.problemId}
                      id={`remove-problem-${problem.problemId}`}
                    >
                      <Trash2 size={14} />
                      {removingProblemId === problem.problemId ? 'Removing...' : 'Remove'}
                    </button>
                  )}
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
