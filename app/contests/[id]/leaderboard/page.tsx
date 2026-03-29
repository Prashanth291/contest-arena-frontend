'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import { leaderboardApi, contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { connectWebSocket } from '@/lib/websocket';
import type { LeaderboardEntry, LeaderboardUpdate } from '@/lib/types';
import { toast } from '@/app/components/Toast';
import {
  ArrowLeft,
  BarChart3,
  Trophy,
  Wifi,
  WifiOff,
  RefreshCw,
  Medal,
  TrendingUp,
  Clock,
} from 'lucide-react';
import styles from './leaderboard.module.css';

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contestId } = use(params);
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [flashMap, setFlashMap] = useState<Record<string, 'ac' | 'wa'>>({});
  const disconnectRef = useRef<(() => void) | null>(null);
  const [allowed, setAllowed] = useState(false);

  // Access guard: admin, creator, or registered participant
  useEffect(() => {
    const guard = async () => {
      try {
        const contest = await contestApi.getContest(contestId);
        const isCreator = user?.userId && contest.createdBy === user.userId;
        const isAdmin = user?.role === 'ADMIN';
        const isParticipant = contest.registered === true;
        if (isCreator || isAdmin || isParticipant) {
          setAllowed(true);
        } else {
          setAllowed(false);
          toast.error('Leaderboard visible only to creator, participants, or admins');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify access';
        toast.error(message);
      }
    };
    guard();
  }, [contestId, user]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await leaderboardApi.getLeaderboard(contestId);
      setEntries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load leaderboard';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  // Initial load
  useEffect(() => {
    if (allowed) {
      fetchLeaderboard();
    }
  }, [allowed, fetchLeaderboard]);

  // WebSocket connection
  useEffect(() => {
    if (!allowed) return;
    const disconnect = connectWebSocket(
      contestId,
      (update: LeaderboardUpdate) => {
        // Flash the row
        setFlashMap((prev) => ({
          ...prev,
          [update.userId]: update.verdict === 'AC' ? 'ac' : 'wa',
        }));
        // Clear flash after animation
        setTimeout(() => {
          setFlashMap((prev) => {
            const next = { ...prev };
            delete next[update.userId];
            return next;
          });
        }, 1500);

        // Update or insert entry
        setEntries((prev) => {
          const existing = prev.find((e) => e.userId === update.userId);
          if (existing) {
            const updated = prev.map((e) =>
              e.userId === update.userId
                ? {
                    ...e,
                    solvedCount: update.solvedCount,
                    totalScore: update.totalScore,
                    totalPenalty: update.totalPenalty,
                    rank: update.newRank,
                    lastAcAt: update.verdict === 'AC' ? new Date().toISOString() : e.lastAcAt,
                  }
                : e,
            );
            return updated.sort((a, b) => a.rank - b.rank);
          } else {
            return [
              ...prev,
              {
                userId: update.userId,
                username: update.username,
                solvedCount: update.solvedCount,
                totalScore: update.totalScore,
                totalPenalty: update.totalPenalty,
                rank: update.newRank,
                lastAcAt: update.verdict === 'AC' ? new Date().toISOString() : null,
              },
            ].sort((a, b) => a.rank - b.rank);
          }
        });
      },
      () => setWsConnected(true),
      () => setWsConnected(false),
    );

    disconnectRef.current = disconnect;
    return () => disconnect();
  }, [contestId, allowed]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal size={18} style={{ color: '#FFD700' }} />;
    if (rank === 2) return <Medal size={18} style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <Medal size={18} style={{ color: '#CD7F32' }} />;
    return <span className={styles.rankNumber}>{rank}</span>;
  };

  if (!allowed) {
    return (
      <div className={`container ${styles.page}`}>
        <Link href={`/contests/${contestId}`} className={styles.back} id="leaderboard-back">
          <ArrowLeft size={16} />
          Back to Contest
        </Link>
        <div className={styles.loading}>
          <p>Access restricted to creator, participants, or admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link href={`/contests/${contestId}`} className={styles.back} id="leaderboard-back">
        <ArrowLeft size={16} />
        Back to Contest
      </Link>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <BarChart3 size={32} className={styles.titleIcon} />
            Leaderboard
          </h1>
          <div className={styles.wsStatus}>
            {wsConnected ? (
              <>
                <Wifi size={14} className={styles.wsOnline} />
                <span className={styles.wsText}>Live</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className={styles.wsOffline} />
                <span className={styles.wsText}>Offline</span>
              </>
            )}
          </div>
        </div>

        <button onClick={fetchLeaderboard} className="btn btn-secondary" id="leaderboard-refresh">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading leaderboard...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <Trophy size={48} className={styles.emptyIcon} />
          <h3>No entries yet</h3>
          <p>The leaderboard will populate once participants submit solutions.</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.colRank}>Rank</div>
            <div className={styles.colUser}>User</div>
            <div className={styles.colSolved}>Solved</div>
            <div className={styles.colScore}>Score</div>
            <div className={styles.colPenalty}>Penalty</div>
            <div className={styles.colLastAc}>Last AC</div>
          </div>

          <div className={styles.tableBody}>
            {entries.map((entry, index) => {
              const flash = flashMap[entry.userId];
              return (
                <div
                  key={entry.userId}
                  className={`${styles.row} ${
                    flash === 'ac' ? styles.flashAc : ''
                  } ${flash === 'wa' ? styles.flashWa : ''} ${
                    index < 3 ? styles.topThree : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className={styles.colRank}>{getRankIcon(entry.rank)}</div>
                  <div className={styles.colUser}>
                    <div className={styles.userAvatar}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.username}>{entry.username}</span>
                  </div>
                  <div className={`${styles.colSolved} mono`}>{entry.solvedCount}</div>
                  <div className={`${styles.colScore} mono`}>
                    <TrendingUp size={14} />
                    {entry.totalScore}
                  </div>
                  <div className={`${styles.colPenalty} mono`}>
                    <Clock size={14} />
                    {entry.totalPenalty}
                  </div>
                  <div className={`${styles.colLastAc} mono`}>
                    {entry.lastAcAt
                      ? new Date(entry.lastAcAt).toLocaleTimeString()
                      : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
