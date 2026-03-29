'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { contestApi } from '@/lib/api';
import type { ProblemResponse, SubmissionStatus } from '@/lib/types';
import { DifficultyBadge } from '@/app/components/StatusBadge';
import { toast } from '@/app/components/Toast';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  FileInput,
  FileOutput,
  Loader,
  Play,
  Send,
  Terminal,
  XCircle,
} from 'lucide-react';
import styles from './problem.module.css';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className={styles.editorLoading}>Loading editor...</div>,
});

const LANGUAGES = [
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
];

const DEFAULT_CODE: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your solution here
    
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
        
    }
}`,
  python: `# Your solution here
`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    // Your solution here
    
});`,
};

type ConsoleMode = 'input' | 'result';

type RunStatus = 'idle' | 'running';

export default function ProblemPage({ params }: { params: Promise<{ id: string; problemId: string }> }) {
  const { id: contestId, problemId } = use(params);
  const [problem, setProblem] = useState<ProblemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE['cpp']);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Console state
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleMode, setConsoleMode] = useState<ConsoleMode>('input');
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await contestApi.getContestProblem(contestId, problemId);
        setProblem(data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [contestId, problemId]);

  const sampleTests = useMemo(() => (problem?.testCases || []).filter((tc) => tc.isSample), [problem]);
  const currentLang = LANGUAGES.find((l) => l.value === language);
  const executingRun = runStatus === 'running';

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '');
    setShowLangDropdown(false);
  };

  const handleRun = async () => {
    if (!problem) return;
    setConsoleOpen(true);
    setConsoleMode('result');
    setActiveTestTab(0);
    setRunStatus('running');
    setTestResults([]);

    try {
      const results = await contestApi.runCodeMock(
        problem.id,
        code,
        language,
        (problem.testCases || []).filter((tc) => tc.isSample),
      );
      setTestResults(results);
    } catch {
      toast.error('Execution failed');
    } finally {
      setRunStatus('idle');
    }
  };

  // Mock submission — simulate verdicts
  const handleSubmit = async () => {
    if (submissionStatus === 'submitting') return;

    setSubmissionStatus('submitting');
    toast.info('Submitting solution...');

    const delay = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const isAccepted = Math.random() > 0.4; // 60% chance AC
    if (isAccepted) {
      setSubmissionStatus('accepted');
      toast.success('Accepted! Solution passed all test cases.');
    } else {
      setSubmissionStatus('wrong_answer');
      toast.error('Wrong Answer on hidden test cases.');
    }

    setTimeout(() => setSubmissionStatus('idle'), 3500);
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Loading problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className={styles.loadingPage}>
        <p>Problem not found</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Left: Problem Statement ─── */}
      <div className={styles.statementPanel}>
        <div className={styles.statementHeader}>
          <Link href={`/contests/${contestId}`} className={styles.back}>
            <ArrowLeft size={14} /> Back
          </Link>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="badge badge-amber">{problem.baseScore} pts</span>
        </div>

        <h1 className={styles.problemTitle}>{problem.title}</h1>

        <div className={styles.statementBody}>
          <section className={styles.section}>
            <h3><BookOpen size={16} /> Description</h3>
            <div className={styles.text}>{problem.description}</div>
          </section>

          <section className={styles.section}>
            <h3><FileInput size={16} /> Input Format</h3>
            <div className={styles.text}>{problem.inputFormat}</div>
          </section>

          <section className={styles.section}>
            <h3><FileOutput size={16} /> Output Format</h3>
            <div className={styles.text}>{problem.outputFormat}</div>
          </section>

          <section className={styles.section}>
            <h3><AlertTriangle size={16} /> Constraints</h3>
            <div className={`${styles.text} mono`}>{problem.constraints}</div>
          </section>

          {sampleTests.length > 0 && (
            <section className={styles.section}>
              <h3>Sample Test Cases</h3>
              {sampleTests.map((tc, i) => (
                <div key={tc.id || i} className={styles.testCase}>
                  <div className={styles.testCaseGroup}>
                    <span className={styles.testLabel}>Input</span>
                    <pre className={styles.testPre}>{tc.input}</pre>
                  </div>
                  <div className={styles.testCaseGroup}>
                    <span className={styles.testLabel}>Expected Output</span>
                    <pre className={styles.testPre}>{tc.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      {/* ── Right: Editor + Console ─── */}
      <div className={styles.editorPanel}>
        <div className={styles.editorToolbar}>
          <div className={styles.langSelector}>
            <button className={styles.langBtn} onClick={() => setShowLangDropdown(!showLangDropdown)}>
              {currentLang?.label || 'Language'}
              <ChevronDown size={14} />
            </button>
            {showLangDropdown && (
              <div className={styles.langDropdown}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    className={`${styles.langOption} ${language === lang.value ? styles.langActive : ''}`}
                    onClick={() => handleLanguageChange(lang.value)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.editorActions}>
            <button
              className="btn btn-secondary"
              onClick={handleRun}
              disabled={executingRun}
              id="problem-run"
            >
              {executingRun ? <Loader size={16} className="animate-spin" /> : <Play size={16} />} Run
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submissionStatus === 'submitting'}
              id="problem-submit"
            >
              {submissionStatus === 'submitting' ? (
                <>
                  <Loader size={16} className="animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ flex: consoleOpen ? 0.6 : 1, transition: 'flex 0.25s ease' }}>
          <MonacoEditor
            height="100%"
            language={currentLang?.monacoLang}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              smoothScrolling: true,
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {consoleOpen && (
          <div style={{ flex: 0.4, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.9rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setConsoleMode('input')} style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: 'none', background: consoleMode === 'input' ? 'var(--bg-secondary)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Testcases</button>
                <button onClick={() => setConsoleMode('result')} style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: 'none', background: consoleMode === 'result' ? 'var(--bg-secondary)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Test Results</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <Terminal size={16} />
                <button onClick={() => setConsoleOpen(false)} style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>Close</button>
              </div>
            </div>

            <div style={{ padding: '0.9rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sampleTests.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>No sample test cases available.</span>}
                  {sampleTests.map((tc, idx) => {
                    const result = testResults[idx];
                    const statusColor = executingRun
                      ? 'var(--accent-amber)'
                      : result
                        ? (result.passed ? 'var(--accent-green)' : 'var(--accent-red)')
                        : 'var(--text-tertiary)';
                    const statusLabel = executingRun
                      ? 'Running'
                      : result
                        ? (result.passed ? 'Passed' : 'Failed')
                        : 'Pending';
                    return (
                      <button
                        key={tc.id || idx}
                        onClick={() => setActiveTestTab(idx)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: activeTestTab === idx ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: statusColor,
                            display: 'inline-block',
                          }}
                          aria-label={statusLabel}
                          title={statusLabel}
                        />
                        Case {idx + 1}
                      </button>
                    );
                  })}
                </div>

              {consoleMode === 'input' && sampleTests[activeTestTab] && (
                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Input</div>
                  <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {sampleTests[activeTestTab].input}
                  </pre>
                </div>
              )}

              {consoleMode === 'result' && (
                executingRun ? (
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader size={16} className="animate-spin" /> Executing code...
                  </div>
                ) : testResults.length > 0 && testResults[activeTestTab] ? (
                  <div>
                    <h3 style={{ color: testResults[activeTestTab].passed ? 'var(--accent-green)' : 'var(--accent-red)', margin: 0 }}>
                      {testResults[activeTestTab].passed ? 'Accepted' : 'Wrong Answer'}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Output {testResults[activeTestTab].passed ? 'matched' : 'did not match'} expected for this sample.
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.4rem 0' }}>Input</div>
                    <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {testResults[activeTestTab].input}
                    </pre>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.4rem 0' }}>Actual Output</div>
                    <pre style={{ background: testResults[activeTestTab].passed ? 'var(--bg-secondary)' : 'rgba(239,68,68,0.1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {testResults[activeTestTab].actualOutput}
                    </pre>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0.4rem 0' }}>Expected Output</div>
                    <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {testResults[activeTestTab].expectedOutput}
                    </pre>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>Run your code to see results.</div>
                )
              )}
            </div>
          </div>
        )}

        {/* Verdict toast bar */}
        {submissionStatus !== 'idle' && (
          <div
            className={`${styles.verdict} ${
              submissionStatus === 'accepted'
                ? styles.verdictAc
                : submissionStatus === 'wrong_answer'
                ? styles.verdictWa
                : styles.verdictPending
            }`}
          >
            {submissionStatus === 'submitting' && (
              <>
                <Loader size={20} className="animate-spin" />
                <span>Running full test suite...</span>
              </>
            )}
            {submissionStatus === 'accepted' && (
              <>
                <CheckCircle size={20} />
                <span>Accepted</span>
              </>
            )}
            {submissionStatus === 'wrong_answer' && (
              <>
                <XCircle size={20} />
                <span>Wrong Answer</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
