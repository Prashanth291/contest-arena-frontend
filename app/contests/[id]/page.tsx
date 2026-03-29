'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import type { ContestResponse, ProblemResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { toast } from '@/app/components/Toast';
import { ArrowLeft, Plus, CheckSquare, X, Save, LogIn, Copy, Check, Link2, BarChart3 } from 'lucide-react';
import styles from './detail.module.css';

export default function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: contestId } = use(params);
  const { user } = useAuth();
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  
  // Bulk Assign Modal State
  const [showModal, setShowModal] = useState(false);
  const [allProblems, setAllProblems] = useState<ProblemResponse[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadContest = async () => {
    try {
      const data = await contestApi.getContest(contestId);
      setContest(data);
    } catch {
      toast.error('Failed to load contest');
    }
  };

  const openBulkModal = async () => {
    try {
      const data = await contestApi.listProblems();
      // Filter out problems already in the contest
      const existingIds = contest?.problems.map(p => p.problemId) || [];
      setAllProblems(data.filter(p => !existingIds.includes(p.id)));
      setShowModal(true);
    } catch {
      toast.error('Failed to load global problem bank');
    }
  };

  const handleBulkAssign = async () => {
    if (selectedProblems.size === 0) return toast.warning('Select at least one problem');
    setIsAssigning(true);
    
    try {
      const problemsToAssign = allProblems.filter(p => selectedProblems.has(p.id));
      const startOrder = contest?.problems.reduce((max, p) => Math.max(max, p.problemOrder ?? -1), -1) + 1;
      const startLabelChar = contest?.problems.reduce((max, p) => Math.max(max, (p.label?.charCodeAt(0) ?? 64)), 64) + 1;
      await contestApi.bulkAssignProblems(contestId, problemsToAssign, { startOrder, startLabelChar });
      
      toast.success(`Successfully assigned ${selectedProblems.size} problems!`);
      setShowModal(false);
      setSelectedProblems(new Set());
      loadContest(); // Refresh contest data to show new problems
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign problems');
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleSelection = (problemId: string) => {
    const newSet = new Set(selectedProblems);
    if (newSet.has(problemId)) newSet.delete(problemId);
    else newSet.add(problemId);
    setSelectedProblems(newSet);
  };

  useEffect(() => { loadContest(); }, [contestId]);

  // Live clock for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const isCreator = user?.userId === contest?.createdBy;
  const isAdmin = user?.role === 'ADMIN';
  const canManage = isAdmin || isCreator;
  const canAssignProblems = canManage && contest?.status !== 'ACTIVE' && contest?.status !== 'ENDED';
  const isParticipant = contest?.registered === true;
  const canViewProblems = canManage || isParticipant;
  const canJoin = !!user && !isCreator && !isParticipant && contest && (contest.status === 'ACTIVE' || contest.status === 'SCHEDULED');

  const countdown = useMemo(() => {
    if (!contest) return { label: '', value: '' };
    const start = new Date(contest.startTime).getTime();
    const end = new Date(contest.endTime).getTime();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const format = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const dayPart = days > 0 ? `${days}d ` : '';
      return `${dayPart}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    if (contest.status === 'ACTIVE') {
      return { label: 'Ends in', value: format(end - now) };
    }
    if (contest.status === 'ENDED') {
      return { label: 'Contest ended', value: '' };
    }
    return { label: 'Starts in', value: format(start - now) };
  }, [contest, now]);

  const copyJoinCode = async () => {
    if (!contest) return;
    try {
      await navigator.clipboard.writeText(contest.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const handleJoin = async () => {
    if (!contest) return;
    setJoining(true);
    try {
      await contestApi.joinContest(contest.joinCode, { password: contest.requiresPassword ? joinPassword || undefined : undefined });
      toast.success('Successfully joined contest!');
      setShowJoinForm(false);
      setJoinPassword('');
      await loadContest();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join contest';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  if (!contest) return <div>Loading...</div>;

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/contests" className={styles.back}><ArrowLeft size={16} /> Back to Contests</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <h1>{contest.title}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#cbd5e1' }}>
            <span className={`badge badge-outline`}>{contest.status}</span>
            {countdown.label && countdown.value && (
              <span style={{ fontWeight: 600 }}>{countdown.label}: <span className="mono">{countdown.value}</span></span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {canManage && contest.status !== 'ACTIVE' && contest.status !== 'ENDED' && (
            <button className="btn btn-secondary" onClick={async () => {
              try {
                await contestApi.startContest(contestId);
                toast.success('Contest started');
                loadContest();
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to start contest';
                toast.error(message);
              }
            }}>
              Start Contest
            </button>
          )}
          {(canManage || isParticipant) && (
            <Link href={`/contests/${contestId}/leaderboard`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <BarChart3 size={16} /> Leaderboard
            </Link>
          )}
          {canAssignProblems && (
            <button className="btn btn-primary" onClick={openBulkModal}>
              <Plus size={16} /> Add Problems
            </button>
          )}
          {canJoin && !showJoinForm && (
            <button className="btn btn-primary" onClick={() => setShowJoinForm(true)}>
              <LogIn size={16} /> Join Contest
            </button>
          )}
        </div>
      </div>

      {/* Join Form */}
      {showJoinForm && canJoin && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#111827', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {canManage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={copyJoinCode} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Copy Join Code
              </button>
              <span className="mono" style={{ color: '#cbd5e1' }}>{contest.joinCode}</span>
            </div>
          )}
          {contest.requiresPassword && (
            <div style={{ flex: '1 1 240px' }}>
              <label className="input-label" htmlFor="join-password">Contest Password</label>
              <input
                id="join-password"
                type="password"
                className="input"
                placeholder="Enter contest password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => { setShowJoinForm(false); setJoinPassword(''); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleJoin} disabled={joining || (contest.requiresPassword && !joinPassword)}>
              {joining ? 'Joining...' : 'Join Now'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Current Problems ({contest.problems.length})</h3>
        {canViewProblems ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {contest.problems.map((p) => (
              <li key={p.problemId} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={`/contests/${contestId}/problems/${p.problemId}`}
                  style={{ padding: '1rem', background: '#1e1e2e', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
                >
                  <strong>{p.label}</strong> - {p.title} <span style={{ color: '#a1a1aa' }}>({p.score} pts)</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid var(--border-subtle)', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Problems are hidden until you join.</div>
              <div style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Join the contest to unlock the problem list and submissions.</div>
            </div>
            {canJoin && (
              <button className="btn btn-primary" onClick={() => setShowJoinForm(true)}>
                <LogIn size={16} /> Join Contest
              </button>
            )}
            {!user && (
              <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Sign in to join and view problems.</div>
            )}
          </div>
        )}
      </div>

      {/* BULK ASSIGN MODAL */}
      {showModal && canManage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#181825', padding: '2rem', borderRadius: '12px', width: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Select Problems to Assign</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '1rem' }}><CheckSquare size={16} /></th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Base Score</th>
                </tr>
              </thead>
              <tbody>
                {allProblems.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProblems.has(p.id)} 
                        onChange={() => toggleSelection(p.id)} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td>{p.title}</td>
                    <td><span className={`${styles.badge} ${styles[`diff-${p.difficulty.toLowerCase()}`]}`}>{p.difficulty}</span></td>
                    <td>{p.baseScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkAssign} disabled={isAssigning || selectedProblems.size === 0}>
                {isAssigning ? 'Assigning...' : <><Save size={16} /> Assign {selectedProblems.size} Problems</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}