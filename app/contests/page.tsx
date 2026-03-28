'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import type { ContestResponse, ContestStatus } from '@/lib/types';
import ContestCard from '@/app/components/ContestCard';
import { toast } from '@/app/components/Toast';
import { Search, Filter, Trophy, RefreshCw, Plus } from 'lucide-react';
import styles from './contests.module.css';

const statusFilters: Array<{ value: ContestStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Live' },
  { value: 'SCHEDULED', label: 'Upcoming' },
  { value: 'ENDED', label: 'Ended' },
  { value: 'DRAFT', label: 'Drafts' },
];

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContestStatus | 'ALL'>('ALL');

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await contestApi.getContests();
      setContests(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load contests';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const filtered = contests
    .filter((c) => statusFilter === 'ALL' || c.status === statusFilter)
    .filter((c) =>
      search === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.joinCode.toLowerCase().includes(search.toLowerCase())
    );

  // Sort: ACTIVE first, then SCHEDULED, then DRAFT, then ENDED
  const statusOrder: Record<ContestStatus, number> = {
    ACTIVE: 0,
    SCHEDULED: 1,
    DRAFT: 2,
    ENDED: 3,
  };

  const sorted = [...filtered].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );

  return (
    <div className={`container ${styles.page}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>
            <Trophy size={36} className={styles.titleIcon} />
            Contests
          </h1>
          <p className={styles.subtitle}>
            Browse, join, and compete in programming contests
          </p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={fetchContests} className="btn btn-secondary" id="contests-refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link href="/contests/create" className="btn btn-primary" id="contests-create-btn">
            <Plus size={16} />
            Create Contest
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="Search by title or join code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="contests-search"
          />
        </div>

        <div className={styles.tabs}>
          {statusFilters.map((f) => (
            <button
              key={f.value}
              className={`${styles.tab} ${statusFilter === f.value ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(f.value)}
              id={`filter-${f.value.toLowerCase()}`}
            >
              {f.label}
              {f.value !== 'ALL' && (
                <span className={styles.tabCount}>
                  {contests.filter((c) => c.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.skeletonCard} skeleton`}>
              <div className={styles.skeletonBadge} />
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText2} />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className={styles.empty}>
          <Trophy size={48} className={styles.emptyIcon} />
          <h3>No contests found</h3>
          <p>{search ? 'Try a different search term' : 'No contests available yet'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {sorted.map((contest, i) => (
            <ContestCard key={contest.id} contest={contest} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
