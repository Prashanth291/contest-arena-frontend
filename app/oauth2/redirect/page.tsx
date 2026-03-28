'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toast } from '@/app/components/Toast';

function OAuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      login(token);
      toast.success('Signed in successfully!');
      router.push('/contests');
    } else {
      toast.error('OAuth authentication failed — no token received');
      router.push('/auth/login');
    }
  }, [searchParams, login, router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--accent-cyan)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        Completing authentication...
      </p>
    </div>
  );
}

export default function OAuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-cyan)',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      }
    >
      <OAuthRedirectHandler />
    </Suspense>
  );
}
