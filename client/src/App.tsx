import React, { useState, useEffect, useMemo } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiRequest, ApiErrorShape } from './api';

// ---------------------------------------------------------------------------
// Sweet Candy SVG Icons & Decorative Elements
// ---------------------------------------------------------------------------

export const LollipopIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Angled Stick pointing down-left */}
    <line
      x1="18"
      y1="23"
      x2="10"
      y2="34"
      stroke="#B8C8D8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Blue Ribbon Wings */}
    <path
      d="M17.5 24.5C13.5 22.5 9.5 25.5 12 29.5C14.5 29.5 16.5 27 17.5 25.5Z"
      fill="#BAE3F8"
      stroke="#96CEEB"
      strokeWidth="0.8"
    />
    <path
      d="M18.5 24.5C22.5 22.5 24.5 26 22 29C19.8 29.5 18.5 27 18.5 25.5Z"
      fill="#BAE3F8"
      stroke="#96CEEB"
      strokeWidth="0.8"
    />
    {/* Ribbon Center Knot */}
    <ellipse cx="18" cy="24.8" rx="2" ry="1.6" fill="#88CBEA" />

    {/* Lollipop Head */}
    <circle
      cx="22"
      cy="14"
      r="10.5"
      fill="#FFF7FA"
      stroke="#DE88AA"
      strokeWidth="2.2"
    />

    {/* Clockwise Spiral Swirl */}
    <path
      d="M22 6C17.5817 6 14 9.58172 14 14C14 18.4183 17.5817 22 22 22C25.3137 22 28 19.3137 28 16C28 13.5 26 11.5 23.5 11.5C21.5 11.5 20 13 20 14.8C20 15.8 20.8 16.5 21.8 16.5"
      stroke="#DE88AA"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CornerCandyDecor: React.FC = () => (
  <svg
    width="84"
    height="48"
    viewBox="0 0 84 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="corner-candy-decor"
  >
    {/* Wrapped Candy (Pink) */}
    <g transform="translate(10, 8) rotate(-15)">
      {/* Wrapper Left Wing */}
      <path d="M6 12L-4 4L-2 16L-4 20L6 12Z" fill="#ffccd5" opacity="0.8" />
      {/* Candy Body */}
      <rect x="5" y="5" width="20" height="14" rx="7" fill="url(#wrapped-pink)" />
      {/* Wrapper Right Wing */}
      <path d="M24 12L34 4L32 16L34 20L24 12Z" fill="#ffccd5" opacity="0.8" />
      {/* Gloss */}
      <ellipse cx="14" cy="9" rx="5" ry="2" fill="#ffffff" opacity="0.6" />
    </g>
    {/* Wrapped Candy (Sky Blue) */}
    <g transform="translate(48, 16) rotate(20) scale(0.75)">
      <path d="M6 12L-4 4L-2 16L-4 20L6 12Z" fill="#bae6fd" opacity="0.8" />
      <rect x="5" y="5" width="20" height="14" rx="7" fill="url(#wrapped-blue)" />
      <path d="M24 12L34 4L32 16L34 20L24 12Z" fill="#bae6fd" opacity="0.8" />
      <ellipse cx="14" cy="9" rx="5" ry="2" fill="#ffffff" opacity="0.6" />
    </g>
    {/* Little Sparkles */}
    <path
      d="M38 4L39.2 6.8L42 8L39.2 9.2L38 12L36.8 9.2L34 8L36.8 6.8L38 4Z"
      fill="#fde047"
      opacity="0.85"
    />
    <defs>
      <linearGradient id="wrapped-pink" x1="5" y1="5" x2="25" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff8fab" />
        <stop offset="1" stopColor="#ff4d6d" />
      </linearGradient>
      <linearGradient id="wrapped-blue" x1="5" y1="5" x2="25" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7dd3fc" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export const CandyJarIllustration: React.FC = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="empty-state-icon">
    {/* Glass Jar Body */}
    <path
      d="M26 34C26 30 28 28 32 28H68C72 28 74 30 74 34V80C74 86 70 90 64 90H36C30 90 26 86 26 80V34Z"
      fill="#f0f9ff"
      stroke="#7dd3fc"
      strokeWidth="2.5"
      opacity="0.8"
    />
    {/* Jar Lid */}
    <rect x="30" y="20" width="40" height="8" rx="4" fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" />
    <rect x="42" y="14" width="16" height="6" rx="3" fill="#f472b6" />
    {/* Candies Inside */}
    <circle cx="42" cy="74" r="8" fill="#ff758f" />
    <circle cx="58" cy="76" r="7" fill="#38bdf8" />
    <circle cx="50" cy="62" r="8.5" fill="#facc15" />
    <circle cx="38" cy="52" r="6" fill="#a78bfa" />
    <circle cx="62" cy="56" r="6.5" fill="#34d399" />
    {/* Glass Highlights */}
    <path d="M32 38V76" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <ellipse cx="64" cy="40" rx="3" ry="1.5" fill="#ffffff" opacity="0.7" />
  </svg>
);

export const CandySuccessIllustration: React.FC = () => (
  <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ margin: '0 auto 0.75rem auto', display: 'block' }}>
    {/* Big Lollipop */}
    <circle cx="45" cy="40" r="24" fill="url(#succ-candy)" />
    <path
      d="M45 22C35 22 27 30 27 40C27 50 35 58 45 58C52 58 58 52 58 45C58 40 54 36 49 36C46 36 44 38 44 41"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.9"
    />
    <rect x="42.5" y="62" width="5" height="24" rx="2.5" fill="#f59e0b" />
    {/* Sparkle Stars */}
    <path d="M20 22L21.5 25.5L25 27L21.5 28.5L20 32L18.5 28.5L15 27L18.5 25.5L20 22Z" fill="#facc15" />
    <path d="M70 20L71 22.5L73.5 23.5L71 24.5L70 27L69 24.5L66.5 23.5L69 22.5L70 20Z" fill="#ff8fab" />
    <path d="M74 54L75.2 56.8L78 58L75.2 59.2L74 62L72.8 59.2L70 58L72.8 56.8L74 54Z" fill="#38bdf8" />
    <defs>
      <linearGradient id="succ-candy" x1="21" y1="16" x2="69" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff758f" />
        <stop offset="0.5" stopColor="#ff4d6d" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

// ---------------------------------------------------------------------------
// Category SVGs
// ---------------------------------------------------------------------------

export const BookIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const CanteenIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18" />
    <path d="M4 17a8 8 0 0 1 16 0" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" />
  </svg>
);

export const WifiIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
  </svg>
);

export const ActivityIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polygon points="12 13 13 15 15.5 15.2 13.8 16.8 14.3 19 12 17.8 9.7 19 10.2 16.8 8.5 15.2 11 15" fill="currentColor" stroke="none" />
  </svg>
);

export const GeneralIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const SearchIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const ShareLinkIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const BarChartIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// ---------------------------------------------------------------------------
// Hero Banner & Candy SVGs
// ---------------------------------------------------------------------------

export const HeroCandyLeft: React.FC = () => (
  <svg
    width="90"
    height="70"
    viewBox="0 0 90 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hero-candy-left"
  >
    <g transform="translate(10, 15) rotate(-22)">
      <path d="M12 18L0 6L3 22L0 28L12 18Z" fill="#90CDF4" fillOpacity="0.75" />
      <rect x="10" y="8" width="30" height="20" rx="10" fill="#76C1EA" fillOpacity="0.85" />
      <path d="M38 18L50 6L47 22L50 28L38 18Z" fill="#90CDF4" fillOpacity="0.75" />
      <ellipse cx="25" cy="14" rx="8" ry="3.5" fill="#ffffff" fillOpacity="0.7" />
    </g>
  </svg>
);

export const HeroCandyRight: React.FC = () => (
  <svg
    width="100"
    height="75"
    viewBox="0 0 100 75"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hero-candy-right"
  >
    <g transform="translate(25, 12) rotate(18)">
      <path d="M10 16L0 6L2 20L0 26L10 16Z" fill="#FBCFE8" fillOpacity="0.75" />
      <rect x="8" y="7" width="28" height="18" rx="9" fill="#F4A2C5" fillOpacity="0.85" />
      <path d="M34 16L44 6L42 20L44 26L34 16Z" fill="#FBCFE8" fillOpacity="0.75" />
      <ellipse cx="22" cy="12" rx="7" ry="3" fill="#ffffff" fillOpacity="0.7" />
    </g>
    <path
      d="M15 12L16.2 15.5L20 16.5L16.2 17.5L15 21L13.8 17.5L10 16.5L13.8 15.5L15 12Z"
      fill="#F9A8D4"
      fillOpacity="0.85"
    />
    <path
      d="M75 42L75.8 44.5L78.5 45.2L75.8 45.9L75 48.5L74.2 45.9L71.5 45.2L74.2 44.5L75 42Z"
      fill="#FDE047"
      fillOpacity="0.8"
    />
  </svg>
);

export const HeroBanner: React.FC = () => (
  <div className="hero-banner">
    <HeroCandyLeft />
    <HeroCandyRight />
    <div className="hero-banner-tag">A LITTLE SPACE FOR YOUR VOICE</div>
    <h1 className="hero-banner-title">
      พื้นที่เล็ก ๆ สำหรับ <span className="accent">ทุกความคิดเห็น</span>
    </h1>
    <p className="hero-banner-subtitle">
      แบ่งปันเรื่องเล็ก ๆ เพื่อชีวิตในมหาวิทยาลัยที่ดีขึ้น
    </p>
    <div className="hero-banner-quote">a little thought, a sweeter campus ♡</div>
  </div>
);

// ---------------------------------------------------------------------------
// Category Determination Helper
// ---------------------------------------------------------------------------
export function getSurveyCategory(title: string, description?: string | null): {
  id: 'library' | 'canteen' | 'wifi' | 'activity' | 'general';
  name: string;
  icon: React.ReactNode;
  circleColor: 'pink' | 'blue';
  boxClass: string;
} {
  const text = `${title} ${description || ''}`.toLowerCase();
  if (text.includes('ห้องสมุด') || text.includes('หนังสือ') || text.includes('library')) {
    return {
      id: 'library',
      name: 'ห้องสมุดและวิชาการ',
      icon: <BookIcon />,
      circleColor: 'pink',
      boxClass: 'category-library',
    };
  }
  if (text.includes('โรงอาหาร') || text.includes('อาหาร') || text.includes('canteen')) {
    return {
      id: 'canteen',
      name: 'โรงอาหารและบริการ',
      icon: <CanteenIcon />,
      circleColor: 'blue',
      boxClass: 'category-canteen',
    };
  }
  if (text.includes('wi-fi') || text.includes('wifi') || text.includes('อินเทอร์เน็ต') || text.includes('สัญญาณ')) {
    return {
      id: 'wifi',
      name: 'Wi-Fi และเครือข่าย',
      icon: <WifiIcon />,
      circleColor: 'pink',
      boxClass: 'category-wifi',
    };
  }
  if (text.includes('กิจกรรม') || text.includes('นันทนาการ') || text.includes('activity')) {
    return {
      id: 'activity',
      name: 'กิจกรรมนักศึกษา',
      icon: <ActivityIcon />,
      circleColor: 'blue',
      boxClass: 'category-activity',
    };
  }
  return {
    id: 'general',
    name: 'แบบสอบถามทั่วไป',
    icon: <GeneralIcon />,
    circleColor: 'blue',
    boxClass: 'category-general',
  };
}

// ---------------------------------------------------------------------------
// Navigation Bar
// ---------------------------------------------------------------------------
export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isOwner = user?.role === 'OWNER';
  const isMySurveysActive = location.pathname.startsWith('/owner/surveys');
  const isAllSurveysActive =
    location.pathname === '/surveys' ||
    (location.pathname.startsWith('/surveys/') && !isMySurveysActive);

  return (
    <header className="navbar">
      <Link
        to={user ? (isOwner ? '/owner/surveys' : '/surveys') : '/login'}
        className="brand"
      >
        <span className="brand-title">Pollipop</span>
        <div className="brand-icon">
          <LollipopIcon size={34} />
        </div>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav className="nav-links">
            <Link
              to="/surveys"
              className={`nav-link ${isAllSurveysActive && !isMySurveysActive ? 'active' : ''}`}
            >
              แบบสอบถามทั้งหมด
            </Link>
            <Link
              to={isOwner ? '/owner/surveys' : '/surveys'}
              className={`nav-link ${isMySurveysActive ? 'active' : ''}`}
            >
              แบบสอบถามของฉัน
            </Link>
          </nav>

          <div className="nav-user">
            <div className="nav-avatar" title={user.name}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="nav-user-info">
              <span data-testid="nav-user-name" style={{ fontWeight: 600 }}>
                {user.name}
              </span>
              <span className="badge badge-role" data-testid="nav-user-role">
                {user.role}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// ---------------------------------------------------------------------------
// Login Page
// ---------------------------------------------------------------------------
const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'OWNER' ? '/owner/surveys' : '/surveys', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      navigate(loggedIn.role === 'OWNER' ? '/owner/surveys' : '/surveys', { replace: true });
    } catch (err: any) {
      const apiErr = err as ApiErrorShape;
      if (apiErr.details && apiErr.details.length > 0) {
        setError(apiErr.details.map((d) => d.message).join(', '));
      } else {
        setError(apiErr.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (role: 'owner' | 'student') => {
    if (role === 'owner') {
      setEmail('owner1@pollipop.local');
      setPassword('ChangeMeInDev123!');
    } else {
      setEmail('student1@pollipop.local');
      setPassword('ChangeMeInDev123!');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: '2.5rem' }}>
      <div className="card" style={{ position: 'relative' }}>
        <CornerCandyDecor />
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <span className="brand-title" style={{ fontSize: '2.1rem' }}>Pollipop</span>
            <LollipopIcon size={38} />
          </div>
          <h2 style={{ margin: '0.3rem 0 0.25rem 0', fontSize: '1.25rem' }}>เข้าสู่ระบบ</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            เลือกเข้าสู่ระบบในบทบาทอาจารย์ผู้สร้าง หรือนักศึกษาผู้ตอบแบบสอบถาม
          </p>
        </div>

        {error && (
          <div className="alert-error" data-testid="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">อีเมลมหาวิทยาลัย (Email)</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="owner1@pollipop.local หรือ student1@pollipop.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน (Password)</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={submitting}
            data-testid="login-submit"
          >
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>คลิกเพื่อกรอกบัญชีสาธิตอัตโนมัติ:</span>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              onClick={() => fillDemoAccount('owner')}
            >
              อาจารย์ (Owner 1)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              onClick={() => fillDemoAccount('student')}
            >
              นักศึกษา (Student 1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Owner Survey Dashboard
// ---------------------------------------------------------------------------
interface OwnerSurveyItem {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  questionCount: number;
  responseCount: number;
}

const OwnerDashboardPage: React.FC = () => {
  const [surveys, setSurveys] = useState<OwnerSurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<OwnerSurveyItem[]>('/api/surveys');
      setSurveys(data);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดรายการแบบสอบถามได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handlePublish = async (id: string) => {
    setError(null);
    try {
      await apiRequest(`/api/surveys/${id}/publish`, { method: 'POST' });
      await loadSurveys();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถเผยแพร่แบบสอบถามได้');
    }
  };

  const handleClose = async (id: string) => {
    setError(null);
    try {
      await apiRequest(`/api/surveys/${id}/close`, { method: 'POST' });
      await loadSurveys();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถปิดรับคำตอบได้');
    }
  };

  const handleShareLink = (id: string) => {
    const url = `${window.location.origin}/surveys/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const counts = useMemo(() => {
    const total = surveys.length;
    const published = surveys.filter((s) => s.status === 'PUBLISHED').length;
    const draft = surveys.filter((s) => s.status === 'DRAFT').length;
    const closed = surveys.filter((s) => s.status === 'CLOSED').length;
    return { total, published, draft, closed };
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(query);
        const matchDesc = s.description ? s.description.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [surveys, statusFilter, searchQuery]);

  return (
    <div className="container">
      {/* Top Hero Banner */}
      <HeroBanner />

      {/* Section Header */}
      <div className="section-meta-tag">YOUR LITTLE CORNER</div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <span>แบบสอบถามของฉัน</span>
            <span className="title-count-badge">{counts.total}</span>
          </h2>
          <p className="page-desc">
            ทุกคำตอบ คือจุดเริ่มต้นของสิ่งที่ดีขึ้น
          </p>
        </div>
        <Link
          to="/owner/surveys/new"
          className="btn-primary-create"
          data-testid="create-survey-link"
        >
          + สร้างแบบสอบถามใหม่
        </Link>
      </div>

      {/* Search and Sort Row */}
      <div className="controls-row">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาแบบสอบถาม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut-pill">/</span>
        </div>

        <div className="sort-dropdown">
          <span>เรียงตาม</span>
          <span className="value">ล่าสุด</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="tabs-bar">
        <div className="tabs-group">
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span>ทั้งหมด</span>
            <span className="tab-pill">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'PUBLISHED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            <span>เปิดรับคำตอบ</span>
            <span className="tab-pill">{counts.published}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'DRAFT' ? 'active' : ''}`}
            onClick={() => setStatusFilter('DRAFT')}
          >
            <span>ฉบับร่าง</span>
            <span className="tab-pill">{counts.draft}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'CLOSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CLOSED')}
          >
            <span>ปิดรับคำตอบ</span>
            <span className="tab-pill">{counts.closed}</span>
          </button>
        </div>
        <div className="tabs-total-count">
          {filteredSurveys.length} แบบสอบถาม
        </div>
      </div>

      {copiedId && (
        <div className="alert-success" style={{ padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
          คัดลอกลิงก์แบบสอบถามสำหรับแชร์ให้นักศึกษาเรียบร้อยแล้ว!
        </div>
      )}

      {error && (
        <div className="alert-error" data-testid="owner-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          กำลังโหลดข้อมูลแบบสอบถาม...
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="empty-state" data-testid="empty-surveys">
          <CandyJarIllustration />
          <div className="empty-state-title">ไม่พบแบบสอบถามตามเงื่อนไข</div>
          <div className="empty-state-text">
            {surveys.length === 0
              ? 'คุณยังไม่มีแบบสอบถามที่สร้างขึ้น กดปุ่มสร้างแบบสอบถามใหม่เพื่อเริ่มออกแบบคำถาม'
              : 'ลองปรับคำค้นหาหรือตัวกรองสถานะเพื่อดูรายการแบบสอบถามอื่น'}
          </div>
          {surveys.length === 0 && (
            <Link to="/owner/surveys/new" className="btn-primary-create">
              + สร้างแบบสอบถามแรกของคุณ
            </Link>
          )}
        </div>
      ) : (
        filteredSurveys.map((s) => {
          const category = getSurveyCategory(s.title, s.description);
          return (
            <div className="card" key={s.id} data-testid={`survey-card-${s.id}`}>
              <div className="survey-card-layout">
                {/* Left section: Icon + Info */}
                <div className="survey-card-left">
                  <div className={`category-icon-circle ${category.circleColor}`}>
                    {category.icon}
                  </div>
                  <div className="survey-details">
                    <h3 className="survey-title-text">{s.title}</h3>
                    {s.description && (
                      <p className="survey-desc-text">{s.description}</p>
                    )}
                    <div className="survey-meta-row">
                      <span
                        className={`badge ${
                          s.status === 'DRAFT'
                            ? 'badge-draft'
                            : s.status === 'PUBLISHED'
                            ? 'badge-published'
                            : 'badge-closed'
                        }`}
                        data-testid={`survey-status-${s.id}`}
                      >
                        {s.status === 'DRAFT'
                          ? 'ฉบับร่าง (DRAFT)'
                          : s.status === 'PUBLISHED'
                          ? 'เปิดรับคำตอบ (PUBLISHED)'
                          : 'ปิดรับคำตอบ (CLOSED)'}
                      </span>
                      <span className="meta-dot">•</span>
                      <span>{s.questionCount} คำถาม</span>
                      <span className="meta-dot">•</span>
                      <span>
                        {s.responseCount > 0 ? `ผู้ตอบแล้ว ${s.responseCount} คน` : 'ยังไม่มีผู้ตอบ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section: Action Buttons */}
                <div className="card-actions-group">
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={() => handleShareLink(s.id)}
                    title="คัดลอกลิงก์สำหรับแชร์"
                  >
                    <ShareLinkIcon />
                  </button>

                  {s.status === 'DRAFT' && (
                    <button
                      type="button"
                      className="btn-publish-draft"
                      onClick={() => handlePublish(s.id)}
                      data-testid={`publish-btn-${s.id}`}
                    >
                      เผยแพร่ (Publish)
                    </button>
                  )}

                  {s.status === 'PUBLISHED' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      onClick={() => handleClose(s.id)}
                      data-testid={`close-btn-${s.id}`}
                    >
                      ปิดรับคำตอบ (Close)
                    </button>
                  )}

                  <Link
                    to={`/owner/surveys/${s.id}/summary`}
                    className="summary-btn"
                    data-testid={`summary-link-${s.id}`}
                  >
                    <BarChartIcon />
                    <span>ดูผลสรุป (Summary)</span>
                  </Link>

                  <button
                    type="button"
                    className="icon-action-btn"
                    title="ตัวเลือกเพิ่มเติม"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Sweet Footer Note */}
      <div className="sweet-footer">ความคิดเห็นของเธอมีความหมายเสมอ ♡ 🍬</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Create Survey Page
// ---------------------------------------------------------------------------
interface DraftQuestionForm {
  text: string;
  type: 'SINGLE_CHOICE' | 'RATING';
  required: boolean;
  options: string[];
}

const CreateSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'IDENTIFIED' | 'ANONYMOUS'>('IDENTIFIED');
  const [questions, setQuestions] = useState<DraftQuestionForm[]>([
    {
      text: '',
      type: 'SINGLE_CHOICE',
      required: true,
      options: ['ดีมาก', 'ดี'],
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: '', type: 'RATING', required: true, options: ['ตัวเลือก 1', 'ตัวเลือก 2'] },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, patch: Partial<DraftQuestionForm>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, `ตัวเลือก ${q.options.length + 1}`] } : q
      )
    );
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, oi) => oi !== optIdx) } : q
      )
    );
  };

  const updateOptionText = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, oi) => (oi === optIdx ? val : opt)) }
          : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest('/api/surveys', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || undefined,
          mode,
          questions: questions.map((q) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.type === 'SINGLE_CHOICE' ? q.options : undefined,
          })),
        }),
      });
      navigate('/owner/surveys');
    } catch (err: any) {
      const apiErr = err as ApiErrorShape;
      if (apiErr.details && apiErr.details.length > 0) {
        setError(apiErr.details.map((d) => `${d.field}: ${d.message}`).join(' | '));
      } else {
        setError(apiErr.message || 'ไม่สามารถสร้างแบบสอบถามได้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 840 }}>
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.45rem' }}>สร้างแบบสอบถามใหม่ (Create Draft Survey)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          กำหนดชื่อ วัตถุประสงค์ คำอธิบาย และสร้างชุดคำถามสำหรับสำรวจความคิดเห็นของนักศึกษา
        </p>

        {error && (
          <div className="alert-error" data-testid="create-survey-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="survey-title">ชื่อแบบสอบถาม *</label>
            <input
              id="survey-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ความพึงพอใจต่อบริการพื้นที่การเรียนรู้ในมหาวิทยาลัย"
              data-testid="survey-title-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="survey-desc">คำอธิบายเพิ่มเติม</label>
            <textarea
              id="survey-desc"
              className="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำชี้แจง วัตถุประสงค์ หรือระยะเวลาการสำรวจสำหรับผู้ตอบแบบสอบถาม"
              data-testid="survey-desc-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="survey-mode">โหมดความเป็นส่วนตัวของแบบสอบถาม</label>
            <select
              id="survey-mode"
              className="select"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'IDENTIFIED' | 'ANONYMOUS')}
              data-testid="survey-mode-select"
            >
              <option value="IDENTIFIED">IDENTIFIED (ระบุตัวตน — นักศึกษาตรวจดูคำตอบของตนเองย้อนหลังได้)</option>
              <option value="ANONYMOUS">ANONYMOUS (ไม่ระบุตัวตน — บันทึกผลแบบ Decoupled เพื่อคุ้มครองความเป็นส่วนตัว)</option>
            </select>
          </div>

          <hr style={{ margin: '1.75rem 0', borderColor: 'var(--border-subtle)' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>รายการคำถาม ({questions.length} ข้อ)</h3>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="card"
              style={{ background: '#fdfbfe', border: '1px solid var(--border-subtle)' }}
              data-testid={`question-block-${qIdx}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <strong style={{ color: 'var(--candy-pink-500)', fontSize: '0.98rem' }}>
                  คำถามข้อที่ {qIdx + 1}
                </strong>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => removeQuestion(qIdx)}
                  >
                    ลบข้อนี้
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>โจทย์คำถาม *</label>
                <input
                  className="input"
                  value={q.text}
                  onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                  placeholder="กรอกโจทย์คำถามที่ต้องการถามนักศึกษา"
                  data-testid={`question-text-${qIdx}`}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <label>ประเภทคำถาม</label>
                  <select
                    className="select"
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(qIdx, {
                        type: e.target.value as 'SINGLE_CHOICE' | 'RATING',
                      })
                    }
                    data-testid={`question-type-${qIdx}`}
                  >
                    <option value="SINGLE_CHOICE">ตัวเลือกเดียว (SINGLE_CHOICE 2–10 ตัวเลือก)</option>
                    <option value="RATING">เรตติ้งคะแนน 1–5 (RATING)</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.2rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(qIdx, { required: e.target.checked })}
                    data-testid={`question-required-${qIdx}`}
                  />
                  จำเป็นต้องตอบ (Required)
                </label>
              </div>

              {q.type === 'SINGLE_CHOICE' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    ตัวเลือกคำตอบ (กำหนดได้ 2–10 ตัวเลือก)
                  </label>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}
                    >
                      <input
                        className="input"
                        value={opt}
                        onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                        placeholder={`ตัวเลือกที่ ${optIdx + 1}`}
                        data-testid={`question-${qIdx}-option-${optIdx}`}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.75rem' }}
                          onClick={() => removeOption(qIdx, optIdx)}
                          data-testid={`remove-option-${qIdx}-${optIdx}`}
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 10 && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.84rem', marginTop: '0.25rem' }}
                      onClick={() => addOption(qIdx)}
                      data-testid={`add-option-${qIdx}`}
                    >
                      + เพิ่มตัวเลือก
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={addQuestion}
              data-testid="add-question-btn"
            >
              + เพิ่มข้อคำถาม
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              data-testid="save-survey-btn"
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึกแบบสอบถามฉบับร่าง (Save Draft)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Respondent Survey List Page
// ---------------------------------------------------------------------------
interface RespondentSurveyItem {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  status: string;
  questionCount: number;
  answered: boolean;
  responseId: string | null;
}

const RespondentSurveyListPage: React.FC = () => {
  const [surveys, setSurveys] = useState<RespondentSurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnswered, setFilterAnswered] = useState<'ALL' | 'UNANSWERED' | 'ANSWERED'>('ALL');

  useEffect(() => {
    apiRequest<RespondentSurveyItem[]>('/api/surveys')
      .then((data) => setSurveys(data))
      .catch((err) => setError(err.message || 'ไม่สามารถโหลดรายการแบบสอบถามได้'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const total = surveys.length;
    const unanswered = surveys.filter((s) => !s.answered).length;
    const answered = surveys.filter((s) => s.answered).length;
    return { total, unanswered, answered };
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      if (filterAnswered === 'UNANSWERED' && s.answered) return false;
      if (filterAnswered === 'ANSWERED' && !s.answered) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(query);
        const matchDesc = s.description ? s.description.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [surveys, filterAnswered, searchQuery]);

  return (
    <div className="container">
      {/* Top Hero Banner */}
      <HeroBanner />

      {/* Section Header */}
      <div className="section-meta-tag">CAMPUS VOICES</div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <span>แบบสอบถามทั้งหมด</span>
            <span className="title-count-badge">{counts.total}</span>
          </h2>
          <p className="page-desc">
            ร่วมส่งเสียงสะท้อนเพื่อพัฒนาคุณภาพชีวิต การเรียนรู้ และสิ่งอำนวยความสะดวกในมหาวิทยาลัย
          </p>
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="controls-row">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาแบบสอบถามที่สนใจ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut-pill">/</span>
        </div>

        <div className="sort-dropdown">
          <span>เรียงตาม</span>
          <span className="value">ล่าสุด</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tabs-bar">
        <div className="tabs-group">
          <button
            type="button"
            className={`tab-btn ${filterAnswered === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterAnswered('ALL')}
          >
            <span>ทั้งหมด</span>
            <span className="tab-pill">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${filterAnswered === 'UNANSWERED' ? 'active' : ''}`}
            onClick={() => setFilterAnswered('UNANSWERED')}
          >
            <span>ยังไม่ได้ตอบ</span>
            <span className="tab-pill">{counts.unanswered}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${filterAnswered === 'ANSWERED' ? 'active' : ''}`}
            onClick={() => setFilterAnswered('ANSWERED')}
          >
            <span>ตอบแล้ว</span>
            <span className="tab-pill">{counts.answered}</span>
          </button>
        </div>
        <div className="tabs-total-count">
          {filteredSurveys.length} แบบสอบถาม
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          กำลังโหลดรายการแบบสอบถาม...
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="empty-state">
          <CandyJarIllustration />
          <div className="empty-state-title">ไม่พบแบบสอบถามในขณะนี้</div>
          <div className="empty-state-text">
            {surveys.length === 0
              ? 'ขณะนี้ยังไม่มีแบบสอบถามที่เปิดรับคำตอบ กรุณากลับมาตรวจสอบใหม่อีกครั้ง'
              : 'ลองปรับคำค้นหาหรือตัวกรองการตอบแบบสอบถาม'}
          </div>
        </div>
      ) : (
        filteredSurveys.map((s) => {
          const category = getSurveyCategory(s.title, s.description);
          return (
            <div className="card" key={s.id} data-testid={`respondent-survey-${s.id}`}>
              <div className="survey-card-layout">
                {/* Left section: Icon + Info */}
                <div className="survey-card-left">
                  <div className={`category-icon-circle ${category.circleColor}`}>
                    {category.icon}
                  </div>
                  <div className="survey-details">
                    <h3 className="survey-title-text">{s.title}</h3>
                    {s.description && (
                      <p className="survey-desc-text">{s.description}</p>
                    )}
                    <div className="survey-meta-row">
                      <span
                        className={`badge ${s.answered ? 'badge-published' : 'badge-draft'}`}
                        data-testid={`answered-badge-${s.id}`}
                      >
                        {s.answered ? 'ตอบแล้ว' : 'ยังไม่ได้ตอบ'}
                      </span>
                      <span className="meta-dot">•</span>
                      <span>{s.questionCount} คำถาม</span>
                      <span className="meta-dot">•</span>
                      <span className="badge badge-role" style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem' }}>
                        {s.mode === 'ANONYMOUS' ? 'ไม่ระบุชื่อ' : 'ระบุตัวตน'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section: Action Buttons */}
                <div className="card-actions-group">
                  {!s.answered ? (
                    <Link
                      to={`/surveys/${s.id}`}
                      className="btn-primary-create"
                      data-testid={`take-survey-link-${s.id}`}
                    >
                      ทำแบบสอบถาม
                    </Link>
                  ) : (
                    <>
                      {s.responseId && (
                        <Link
                          to={`/responses/${s.responseId}`}
                          className="summary-btn"
                          data-testid={`view-response-link-${s.id}`}
                        >
                          ดูคำตอบที่ส่งแล้ว
                        </Link>
                      )}
                      <Link
                        to={`/surveys/${s.id}`}
                        className="icon-action-btn"
                        data-testid={`revisit-survey-link-${s.id}`}
                        title="ดูหน้ารายละเอียด"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Sweet Footer Note */}
      <div className="sweet-footer">ความคิดเห็นของเธอมีความหมายเสมอ ♡ 🍬</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Take Survey Page
// ---------------------------------------------------------------------------
const TakeSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; ratingValue?: number }>>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedResponse, setSubmittedResponse] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiRequest<any>(`/api/surveys/${id}`)
      .then((data) => setSurvey(data))
      .catch((err) => setLoadError(err.message || 'ไม่พบแบบสอบถามนี้'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payloadAnswers = Object.entries(answers).map(([questionId, val]) => ({
        questionId,
        optionId: val.optionId ?? null,
        ratingValue: val.ratingValue ?? null,
      }));

      const res = await apiRequest<any>(`/api/surveys/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({ answers: payloadAnswers }),
      });
      setSubmittedResponse(res);
    } catch (err: any) {
      const apiErr = err as ApiErrorShape;
      if (apiErr.details && apiErr.details.length > 0) {
        setSubmitError(apiErr.details.map((d) => d.message).join(' | '));
      } else {
        setSubmitError(apiErr.message || 'ไม่สามารถส่งคำตอบได้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          กำลังโหลดแบบสอบถาม...
        </div>
      </div>
    );
  }

  if (loadError || !survey) {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="alert-error" data-testid="survey-load-error">
          {loadError || 'ไม่พบแบบสอบถาม'}
        </div>
        <Link to="/surveys" className="btn btn-outline">
          กลับหน้ารายการแบบสอบถาม
        </Link>
      </div>
    );
  }

  const category = getSurveyCategory(survey.title, survey.description);

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="card">
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div className={`category-icon-box ${category.boxClass}`} style={{ width: 40, height: 40, minWidth: 40 }}>
            {category.icon}
          </div>
          <div>
            <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
              {category.name}
            </span>
            <span className="badge badge-mode" style={{ marginLeft: '0.4rem', fontSize: '0.75rem' }}>
              {survey.mode === 'ANONYMOUS' ? 'แบบสอบถามไม่ระบุชื่อ' : 'แบบสอบถามระบุตัวตน'}
            </span>
          </div>
        </div>

        <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.45rem' }}>{survey.title}</h2>
        {survey.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', margin: '0 0 1rem 0' }}>
            {survey.description}
          </p>
        )}

        {submittedResponse ? (
          <div className="alert-success" data-testid="submit-success" style={{ textAlign: 'center', padding: '2rem' }}>
            <CandySuccessIllustration />
            <h3 style={{ margin: '0.5rem 0 0.35rem 0', fontSize: '1.45rem', color: '#414C63' }}>
              ขอบคุณที่แบ่งปันนะ ♡
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-body)', fontSize: '0.92rem' }}>
              ส่งคำตอบแบบสอบถามสำเร็จ! ทุกความคิดเห็นของเธอมีความหมายต่อมหาวิทยาลัยเสมอ
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {survey.mode === 'IDENTIFIED' && (
                <Link
                  to={`/responses/${submittedResponse.id}`}
                  className="btn btn-primary"
                  data-testid="confirmation-view-response-link"
                >
                  ตรวจสอบคำตอบของฉัน
                </Link>
              )}
              <Link to="/surveys" className="btn btn-outline">
                กลับหน้ารายการแบบสอบถาม
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="alert-error" data-testid="submit-error">
                {submitError}
              </div>
            )}

            {survey.questions?.map((q: any, qIdx: number) => {
              const currentVal = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    background: '#fefdfe',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem',
                  }}
                  data-testid={`question-card-${q.id}`}
                >
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--candy-pink-500)', fontSize: '1.05rem' }}>
                        {qIdx + 1}.
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                        {q.text}
                      </span>
                      {q.required && (
                        <span style={{ color: 'var(--candy-pink-500)', fontWeight: 600, fontSize: '0.9rem' }}>
                          *
                        </span>
                      )}
                    </div>
                  </div>

                  {q.type === 'SINGLE_CHOICE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {q.options?.map((opt: any, optIdx: number) => {
                        const isSelected = currentVal?.optionId === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`choice-option-label ${isSelected ? 'selected' : ''}`}
                            data-testid={`option-label-${qIdx}-${optIdx}`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt.id}
                              checked={isSelected}
                              onChange={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { optionId: opt.id },
                                }))
                              }
                              data-testid={`radio-q${qIdx}-opt${optIdx}`}
                              style={{ accentColor: '#f43f5e', transform: 'scale(1.15)' }}
                            />
                            <span style={{ fontSize: '0.94rem' }}>{opt.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'RATING' && (
                    <div>
                      <div className="rating-group">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = currentVal?.ratingValue === val;
                          const ratingDescriptions = [
                            '1 = น้อยที่สุด',
                            '2 = น้อย',
                            '3 = ปานกลาง',
                            '4 = มาก',
                            '5 = มากที่สุด',
                          ];
                          return (
                            <label
                              key={val}
                              className={`rating-btn-label ${isSelected ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={val}
                                checked={isSelected}
                                onChange={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: { ratingValue: val },
                                  }))
                                }
                                data-testid={`rating-q${qIdx}-${val}`}
                                style={{ accentColor: '#f43f5e', transform: 'scale(1.15)', marginBottom: '0.25rem' }}
                              />
                              <span className="rating-score-num">{val}</span>
                              <span className="rating-score-desc">
                                {val === 1
                                  ? 'น้อยที่สุด'
                                  : val === 5
                                  ? 'มากที่สุด'
                                  : val === 3
                                  ? 'ปานกลาง'
                                  : ''}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>★ 1: น้อยที่สุด / ควรปรับปรุง</span>
                        <span>★ 5: มากที่สุด / ดีเยี่ยม</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-testid="submit-response-btn"
                style={{ padding: '0.65rem 1.75rem', fontSize: '0.98rem' }}
              >
                {submitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบแบบสอบถาม'}
              </button>
              <Link to="/surveys" className="btn btn-outline">
                ยกเลิก
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Response Detail View
// ---------------------------------------------------------------------------
const ResponseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<any>(`/api/responses/${id}`)
      .then((data) => setResponse(data))
      .catch((err) => setError(err.message || 'ไม่สามารถโหลดคำตอบได้'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>กำลังโหลดคำตอบที่ส่ง...</div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="alert-error" data-testid="response-error">
          {error || 'ไม่พบคำตอบ'}
        </div>
        <Link to="/surveys" className="btn btn-outline">
          กลับหน้ารายการแบบสอบถาม
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="card" data-testid="response-detail">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <span className="badge badge-published" style={{ marginBottom: '0.35rem' }}>
              บันทึกคำตอบแล้ว
            </span>
            <h2 style={{ margin: '0.2rem 0', fontSize: '1.4rem' }}>{response.survey?.title}</h2>
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            ส่งเมื่อ: {new Date(response.submittedAt).toLocaleString('th-TH')}
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
          {response.survey?.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {response.answers?.map((ans: any, idx: number) => (
            <div
              key={ans.id}
              className="card"
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                marginBottom: 0,
                padding: '1.15rem',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.96rem' }}>
                {idx + 1}. {ans.question?.text}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>คำตอบของคุณ:</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--candy-pink-500)',
                    background: '#fff1f2',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.92rem',
                  }}
                >
                  {ans.option ? ans.option.text : ans.ratingValue !== null ? `${ans.ratingValue} / 5 คะแนน` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/surveys" className="btn btn-outline">
            ← กลับหน้ารายการแบบสอบถาม
          </Link>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Survey Summary Dashboard Page
// ---------------------------------------------------------------------------
const SurveySummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<any>(`/api/surveys/${id}/summary`)
      .then((data) => setSummary(data))
      .catch((err) => setError(err.message || 'ไม่สามารถโหลดผลสรุปแบบสอบถามได้'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 840 }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>กำลังประมวลผลข้อมูลสรุป...</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="container" style={{ maxWidth: 840 }}>
        <div className="alert-error" data-testid="summary-error">
          {error || 'ไม่พบข้อมูลผลสรุป'}
        </div>
        <Link to="/owner/surveys" className="btn btn-outline">
          กลับหน้ารายการแบบสอบถาม
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 840 }} data-testid="summary-dashboard">
      <div className="page-header">
        <div>
          <Link to="/owner/surveys" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← กลับหน้าจัดการแบบสอบถาม
          </Link>
          <h2 className="page-title" style={{ marginTop: '0.35rem' }}>
            <span>ผลสรุปภาพรวมแบบสอบถาม</span>
          </h2>
          <p className="page-desc">{summary.title || summary.surveyTitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="card"
            style={{
              padding: '0.65rem 1.25rem',
              marginBottom: 0,
              background: 'linear-gradient(135deg, #fff0f3 0%, #e0f2fe 100%)',
              border: '1px solid #ffd1dc',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              จำนวนผู้ตอบแบบสอบถามทั้งหมด
            </div>
            <div
              style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}
              data-testid="total-responses"
            >
              {summary.totalResponses} คน
            </div>
          </div>
        </div>
      </div>

      {summary.questions?.map((q: any, qIdx: number) => (
        <div className="card" key={q.questionId} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              ข้อ {qIdx + 1}: {q.text || q.questionText}
            </h3>
            <span className="badge badge-mode" style={{ fontSize: '0.78rem' }}>
              ตอบแล้ว {q.totalAnswered} คน
            </span>
          </div>

          {(q.type === 'SINGLE_CHOICE' || q.questionType === 'SINGLE_CHOICE') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {q.options?.map((opt: any) => {
                const pct = typeof opt.percentage === 'number' ? opt.percentage : 0;
                return (
                  <div key={opt.optionId} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 500 }}>{opt.text}</span>
                      <span style={{ fontWeight: 600, color: 'var(--candy-pink-500)' }}>
                        {opt.count} คน ({pct.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(q.type === 'RATING' || q.questionType === 'RATING') && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fff1f4 0%, #f0f9ff 100%)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>คะแนนเฉลี่ย</div>
                  <div
                    style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--candy-pink-500)' }}
                    data-testid={`avg-rating-${qIdx}`}
                  >
                    {typeof q.averageRating === 'number'
                      ? `${q.averageRating.toFixed(2)} / 5.00`
                      : 'ยังไม่มีคะแนน'}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    การกระจายตัวของระดับคะแนน 1–5 ดาว:
                  </div>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = q.distribution?.[star] || 0;
                    const pct = q.totalAnswered > 0 ? (count / q.totalAnswered) * 100 : 0;
                    return (
                      <div
                        key={star}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.25rem' }}
                      >
                        <span style={{ width: 44, fontWeight: 500 }}>{star} ดาว</span>
                        <div className="progress-track" style={{ flex: 1, height: 8, margin: 0 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: star >= 4 ? '#ff758f' : star === 3 ? '#38bdf8' : '#cbd5e1',
                            }}
                          />
                        </div>
                        <span style={{ width: 90, textAlign: 'right', color: 'var(--text-muted)' }}>
                          {count} คน ({pct.toFixed(2)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Protected Route Guard
// ---------------------------------------------------------------------------
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'OWNER' | 'RESPONDENT';
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'OWNER' ? '/owner/surveys' : '/surveys'} replace />;
  }

  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// Main App Component & Router
// ---------------------------------------------------------------------------
export const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Owner Routes */}
        <Route
          path="/owner/surveys"
          element={
            <ProtectedRoute allowedRole="OWNER">
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/surveys/new"
          element={
            <ProtectedRoute allowedRole="OWNER">
              <CreateSurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/surveys/:id/summary"
          element={
            <ProtectedRoute allowedRole="OWNER">
              <SurveySummaryPage />
            </ProtectedRoute>
          }
        />

        {/* Respondent Routes */}
        <Route
          path="/surveys"
          element={
            <ProtectedRoute allowedRole="RESPONDENT">
              <RespondentSurveyListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveys/:id"
          element={
            <ProtectedRoute allowedRole="RESPONDENT">
              <TakeSurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responses/:id"
          element={
            <ProtectedRoute allowedRole="RESPONDENT">
              <ResponseDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
