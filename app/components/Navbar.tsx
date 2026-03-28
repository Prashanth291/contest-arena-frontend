'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Trophy,
  Code2,
  BookOpen,
  Plus,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} container`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} id="nav-logo">
          <Zap size={24} className={styles.logoIcon} />
          <span className={styles.logoText}>
            Contest<span className={styles.logoAccent}>Arena</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.links}>
          <Link
            href="/contests"
            id="nav-contests"
            className={`${styles.link} ${isActive('/contests') ? styles.linkActive : ''}`}
          >
            <Trophy size={16} />
            Contests
          </Link>

          <Link
            href="/problems"
            id="nav-problems"
            className={`${styles.link} ${isActive('/problems') ? styles.linkActive : ''}`}
          >
            <BookOpen size={16} />
            Problems
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/contests/create"
                id="nav-create-contest"
                className={`${styles.link} ${isActive('/contests/create') ? styles.linkActive : ''}`}
              >
                <Plus size={16} />
                Create Contest
              </Link>
              <Link
                href="/problems/create"
                id="nav-create-problem"
                className={`${styles.link} ${isActive('/problems/create') ? styles.linkActive : ''}`}
              >
                <Code2 size={16} />
                Create Problem
              </Link>
            </>
          )}
        </div>

        {/* Right section */}
        <div className={styles.right}>
          {isAuthenticated && user ? (
            <div className={styles.userWrapper} ref={userMenuRef}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="nav-user-menu"
              >
                <div className={styles.avatar}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className={styles.username}>{user.username}</span>
                <ChevronDown
                  size={14}
                  className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.username}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-violet' : 'badge-cyan'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link href="/dashboard" className={styles.dropdownItem} id="nav-dashboard">
                    <User size={14} />
                    Dashboard
                  </Link>
                  <button
                    className={styles.dropdownItem}
                    onClick={logout}
                    id="nav-logout"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth/login" className="btn btn-ghost" id="nav-login">
                <LogIn size={16} />
                Sign In
              </Link>
              <Link href="/auth/register" className="btn btn-primary" id="nav-register">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            id="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/problems" className={styles.mobileLink}>
            <BookOpen size={18} /> Problems
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/contests/create" className={styles.mobileLink}>
                <Plus size={18} /> Create Contest
              </Link>
              <Link href="/problems/create" className={styles.mobileLink}>
                <Code2 size={18} /> Create Problem
              </Link>
              <Link href="/dashboard" className={styles.mobileLink}>
                <User size={18} /> Dashboard
              </Link>
            </>
          )}
          <div className={styles.mobileDivider} />
          {isAuthenticated ? (
            <button className={styles.mobileLink} onClick={logout}>
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <>
              <Link href="/auth/login" className={styles.mobileLink}>
                <LogIn size={18} /> Sign In
              </Link>
              <Link href="/auth/register" className={styles.mobileLink}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
