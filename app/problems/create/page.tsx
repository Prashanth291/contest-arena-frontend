'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contestApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import AuthGuard from '@/app/components/AuthGuard';
import { toast } from '@/app/components/Toast';
import type { Difficulty, TestCase } from '@/lib/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  BookOpen,
  FileInput,
  FileOutput,
  AlertTriangle,
  CheckSquare,
  Eye,
} from 'lucide-react';
import styles from './create.module.css';

function CreateProblemForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    difficulty: 'EASY' as Difficulty,
    baseScore: 500,
  });
  const [testCases, setTestCases] = useState<Omit<TestCase, 'id'>[]>([
    { input: '', expectedOutput: '', isSample: true },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.inputFormat.trim()) newErrors.inputFormat = 'Input format is required';
    if (!formData.outputFormat.trim()) newErrors.outputFormat = 'Output format is required';
    if (testCases.length === 0) newErrors.testCases = 'At least one test case is required';
    const hasEmptyTC = testCases.some((tc) => !tc.input.trim() || !tc.expectedOutput.trim());
    if (hasEmptyTC) newErrors.testCases = 'All test cases must have input and expected output';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isSample: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof Omit<TestCase, 'id'>, value: string | boolean) => {
    setTestCases(
      testCases.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    try {
      await contestApi.createProblem({
        ...formData,
        createdBy: user.userId,
        testCases,
      });
      toast.success('Problem created!');
      router.push('/contests');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create problem';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/contests" className={styles.back}>
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className={styles.header}>
        <h1>
          <BookOpen size={32} className={styles.titleIcon} />
          Create Problem
        </h1>
        <p className={styles.subtitle}>Define a new problem with test cases</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} id="create-problem-form">
        {/* Basic info */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Problem Details</h3>

          <div className="input-group">
            <label className="input-label" htmlFor="problem-title">Title</label>
            <input
              id="problem-title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Two Sum"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className="input-error-text">{errors.title}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="problem-description">Description</label>
            <textarea
              id="problem-description"
              className={`input ${styles.textarea} ${errors.description ? 'input-error' : ''}`}
              placeholder="Full problem statement..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
            />
            {errors.description && <span className="input-error-text">{errors.description}</span>}
          </div>

          <div className={styles.row}>
            <div className="input-group">
              <label className="input-label" htmlFor="problem-input-format">
                <FileInput size={14} /> Input Format
              </label>
              <textarea
                id="problem-input-format"
                className={`input ${styles.textareaSmall} ${errors.inputFormat ? 'input-error' : ''}`}
                placeholder="First line contains N..."
                value={formData.inputFormat}
                onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                rows={3}
              />
              {errors.inputFormat && <span className="input-error-text">{errors.inputFormat}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="problem-output-format">
                <FileOutput size={14} /> Output Format
              </label>
              <textarea
                id="problem-output-format"
                className={`input ${styles.textareaSmall} ${errors.outputFormat ? 'input-error' : ''}`}
                placeholder="Print the answer..."
                value={formData.outputFormat}
                onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                rows={3}
              />
              {errors.outputFormat && <span className="input-error-text">{errors.outputFormat}</span>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="problem-constraints">
              <AlertTriangle size={14} /> Constraints
            </label>
            <textarea
              id="problem-constraints"
              className={`input ${styles.textareaSmall}`}
              placeholder="1 <= N <= 10^5"
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              rows={2}
            />
          </div>

          <div className={styles.row}>
            <div className="input-group">
              <label className="input-label">Difficulty</label>
              <select
                className="input"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                id="problem-difficulty"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="problem-score">Base Score</label>
              <input
                id="problem-score"
                type="number"
                className="input"
                value={formData.baseScore}
                onChange={(e) => setFormData({ ...formData, baseScore: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <CheckSquare size={18} />
              Test Cases
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addTestCase}>
              <Plus size={14} /> Add
            </button>
          </div>

          {errors.testCases && <span className="input-error-text">{errors.testCases}</span>}

          {testCases.map((tc, i) => (
            <div key={i} className={styles.testCase}>
              <div className={styles.testCaseHeader}>
                <span className={styles.testCaseNum}>Test Case {i + 1}</span>
                <label className={styles.sampleToggle}>
                  <input
                    type="checkbox"
                    checked={tc.isSample}
                    onChange={(e) => updateTestCase(i, 'isSample', e.target.checked)}
                  />
                  <Eye size={12} />
                  Sample
                </label>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeTestCase(i)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className={styles.testCaseBody}>
                <div className="input-group">
                  <label className="input-label">Input</label>
                  <textarea
                    className={`input ${styles.testInput}`}
                    value={tc.input}
                    onChange={(e) => updateTestCase(i, 'input', e.target.value)}
                    rows={3}
                    placeholder="5\n1 2 3 4 5"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Expected Output</label>
                  <textarea
                    className={`input ${styles.testInput}`}
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)}
                    rows={3}
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          disabled={loading}
          id="create-problem-submit"
        >
          {loading ? 'Creating...' : (
            <>
              <Send size={18} />
              Create Problem
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function CreateProblemPage() {
  return (
    <AuthGuard>
      <CreateProblemForm />
    </AuthGuard>
  );
}
