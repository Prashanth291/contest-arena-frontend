'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import type { ProblemResponse, SubmissionStatus } from '@/lib/types';
import { DifficultyBadge } from '@/app/components/StatusBadge';
import { toast } from '@/app/components/Toast';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Loader,
  BookOpen,
  FileInput,
  FileOutput,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import styles from './problem.module.css';
import dynamic from 'next/dynamic';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className={styles.editorLoading}>Loading editor...</div> },
);

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
  java: `import java.util.Scanner;

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

export default function ProblemPage({
  params,
}: {
  params: Promise<{ id: string; problemId: string }>;
}) {
  const { id: contestId, problemId } = use(params);
  const [problem, setProblem] = useState<ProblemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE['cpp']);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await contestApi.getProblem(problemId);
        setProblem(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load problem';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '');
    setShowLangDropdown(false);
  };

  // Mock submission — simulates code execution
  const handleSubmit = async () => {
    if (submissionStatus === 'submitting') return;

    setSubmissionStatus('submitting');
    toast.info('Submitting solution...');

    // Simulate execution delay (1–3 seconds)
    const delay = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Random verdict
    const isAccepted = Math.random() > 0.4; // 60% chance AC
    if (isAccepted) {
      setSubmissionStatus('accepted');
      toast.success('✓ Accepted! Solution passed all test cases.');
    } else {
      setSubmissionStatus('wrong_answer');
      toast.error('✗ Wrong Answer on test case 3.');
    }

    // Reset after showing verdict
    setTimeout(() => setSubmissionStatus('idle'), 4000);
  };

  const currentLang = LANGUAGES.find((l) => l.value === language);

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

  const sampleTests = problem.testCases.filter((tc) => tc.isSample);

  return (
    <div className={styles.page}>
      {/* ── Left: Problem Statement ─── */}
      <div className={styles.statementPanel}>
        <div className={styles.statementHeader}>
          <Link href={`/contests/${contestId}`} className={styles.back}>
            <ArrowLeft size={14} />
            Back
          </Link>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className={`badge badge-amber`}>
            {problem.baseScore} pts
          </span>
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

          {/* Sample test cases */}
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

      {/* ── Right: Code Editor ─── */}
      <div className={styles.editorPanel}>
        {/* Editor toolbar */}
        <div className={styles.editorToolbar}>
          <div className={styles.langSelector}>
            <button
              className={styles.langBtn}
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              id="lang-selector"
            >
              {currentLang?.label}
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
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submissionStatus === 'submitting'}
              id="problem-submit"
            >
              {submissionStatus === 'submitting' ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className={styles.editorWrapper}>
          <MonacoEditor
            height="100%"
            language={currentLang?.monacoLang}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: 'on',
              roundedSelection: true,
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              tabSize: 4,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Verdict Panel */}
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
                <span>Running test cases...</span>
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
