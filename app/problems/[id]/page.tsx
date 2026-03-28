'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import type { ProblemResponse } from '@/lib/types';
import { toast } from '@/app/components/Toast';
import { ArrowLeft, BookOpen, FileInput, FileOutput, AlertTriangle, CheckSquare } from 'lucide-react';
import styles from './problem.module.css';

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [problem, setProblem] = useState<ProblemResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!problemId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await contestApi.getProblem(problemId as string);
        setProblem(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load problem';
        toast.error(message);
        router.push('/problems');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [problemId, router]);

  if (loading || !problem) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.loading}>Loading problem...</div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/problems" className={styles.back} id="problem-back">
        <ArrowLeft size={16} /> Back to Problems
      </Link>

      <div className={styles.header}>
        <div>
          <div className={`${styles.badge} ${styles[`diff-${problem.difficulty.toLowerCase()}`]}`}>
            {problem.difficulty}
          </div>
          <h1 className={styles.title}>{problem.title}</h1>
          <p className={styles.meta}>Problem ID: <span className="mono">{problem.id}</span></p>
          <p className={styles.meta}>Base Score: <span className="mono">{problem.baseScore}</span></p>
        </div>
      </div>

      <div className={styles.section}>
        <h3><BookOpen size={16} /> Description</h3>
        <p className={styles.body}>{problem.description}</p>
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.sectionCard}>
          <h3><FileInput size={16} /> Input</h3>
          <p className={styles.body}>{problem.inputFormat}</p>
        </div>
        <div className={styles.sectionCard}>
          <h3><FileOutput size={16} /> Output</h3>
          <p className={styles.body}>{problem.outputFormat}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3><AlertTriangle size={16} /> Constraints</h3>
        <p className={styles.body}>{problem.constraints}</p>
      </div>

      <div className={styles.section}>
        <h3><CheckSquare size={16} /> Sample Test Cases</h3>
        <div className={styles.tests}>
          {problem.testCases.filter((tc) => tc.isSample).map((tc) => (
            <div key={tc.id} className={styles.testCard}>
              <div className={styles.testLabel}>Input</div>
              <pre className={styles.pre}>{tc.input}</pre>
              <div className={styles.testLabel}>Expected Output</div>
              <pre className={styles.pre}>{tc.expectedOutput}</pre>
            </div>
          ))}
          {problem.testCases.filter((tc) => tc.isSample).length === 0 && (
            <p className={styles.body}>No sample test cases provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}
