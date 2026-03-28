'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import type { Difficulty, ProblemResponse } from '@/lib/types';
import { toast } from '@/app/components/Toast';
import { Plus, Copy, Check, Search, Filter, BookOpen, ShieldCheck, RefreshCw } from 'lucide-react';
import styles from './problems.module.css';

const difficultyOptions: Array<{ value: Difficulty | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await contestApi.listProblems();
      setProblems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load problems';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return problems
      .filter((p) => difficulty === 'ALL' || p.difficulty === difficulty)
      .filter((p) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term)
        );
      });
  }, [problems, difficulty, search]);

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error('Could not copy problem id');
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <BookOpen size={32} />
            Problems
          </h1>
          <p className={styles.subtitle}>
            Global problem set — copy the Problem ID to assign into contests.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={load} className="btn btn-secondary" id="problems-refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link href="/problems/create" className="btn btn-primary" id="problems-add-btn">
            <Plus size={16} />
            New Problem
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            className="input"
            placeholder="Search by title, id, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="problems-search"
          />
        </div>
        <div className={styles.difficultyTabs}>
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.diffTab} ${difficulty === opt.value ? styles.diffTabActive : ''}`}
              onClick={() => setDifficulty(opt.value)}
              id={`difficulty-${opt.value.toLowerCase()}`}
            >
              <Filter size={14} /> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.row} skeleton`}>
              <div className={styles.badgeSkeleton} />
              <div className={styles.titleSkeleton} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <ShieldCheck size={32} />
          <p>No problems found. Try a different search or add one.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className={styles.row}
              id={`problem-row-${problem.id}`}
            >
              <div className={styles.left}>
                <span className={`${styles.badge} ${styles[`diff-${problem.difficulty.toLowerCase()}`]}`}>
                  {problem.difficulty}
                </span>
                <span className={styles.title}>{problem.title}</span>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.copyBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    copyId(problem.id);
                  }}
                  id={`copy-problem-${problem.id}`}
                  title="Copy Problem ID"
                >
                  {copiedId === problem.id ? <Check size={14} /> : <Copy size={14} />}
                  <span className="mono">{problem.id}</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
