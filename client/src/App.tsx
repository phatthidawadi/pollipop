import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiRequest, ApiErrorShape } from './api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <Link
        to={user ? (user.role === 'OWNER' ? '/owner/surveys' : '/surveys') : '/login'}
        className="brand"
      >
        <span>Pollipop</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.9 }}>
          ระบบแบบสอบถามและประเมินผลมหาวิทยาลัย
        </span>
      </Link>
      {user && (
        <div className="nav-user">
          <span data-testid="nav-user-name">
            {user.name} ({user.department})
          </span>
          <span className="badge badge-role" data-testid="nav-user-role">
            {user.role}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  );
};

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

  return (
    <div className="container" style={{ maxWidth: 460, marginTop: '3.5rem' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>เข้าสู่ระบบ Pollipop</h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          กรุณาเข้าสู่ระบบด้วยบัญชีอาจารย์ผู้สร้างแบบสอบถาม (OWNER) หรือนักศึกษาผู้ตอบแบบสอบถาม (RESPONDENT)
        </p>

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
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
            data-testid="login-submit"
          >
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

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

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <h2 style={{ margin: 0 }}>จัดการแบบสอบถามของฉัน (Survey Owner Dashboard)</h2>
        <Link
          to="/owner/surveys/new"
          className="btn btn-primary"
          data-testid="create-survey-link"
        >
          + สร้างแบบสอบถามใหม่
        </Link>
      </div>

      {error && (
        <div className="alert-error" data-testid="owner-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card">กำลังโหลดข้อมูล...</div>
      ) : surveys.length === 0 ? (
        <div className="card" data-testid="empty-surveys">
          ยังไม่มีแบบสอบถามที่คุณสร้าง กดปุ่ม &ldquo;+ สร้างแบบสอบถามใหม่&rdquo; เพื่อเริ่มต้น
        </div>
      ) : (
        surveys.map((s) => (
          <div className="card" key={s.id} data-testid={`survey-card-${s.id}`}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0' }}>{s.title}</h3>
                {s.description && (
                  <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>{s.description}</p>
                )}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
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
                    สถานะ: {s.status}
                  </span>
                  <span className="badge badge-closed">โหมด: {s.mode}</span>
                  <span style={{ fontSize: '0.88rem', color: '#475569' }}>
                    คำถาม {s.questionCount} ข้อ | ผู้ตอบแล้ว {s.responseCount} คน
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {s.status === 'DRAFT' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handlePublish(s.id)}
                    data-testid={`publish-btn-${s.id}`}
                  >
                    เผยแพร่ (Publish)
                  </button>
                )}
                {s.status === 'PUBLISHED' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleClose(s.id)}
                    data-testid={`close-btn-${s.id}`}
                  >
                    ปิดรับคำตอบ (Close)
                  </button>
                )}
                <Link
                  to={`/owner/surveys/${s.id}/summary`}
                  className="btn btn-outline"
                  data-testid={`summary-link-${s.id}`}
                >
                  ดูผลสรุป (Summary)
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

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
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>สร้างแบบสอบถามใหม่ (Create Draft Survey)</h2>

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
              placeholder="เช่น แบบประเมินความพึงพอใจวิชา CPE 334"
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
              placeholder="คำชี้แจงสำหรับผู้ตอบแบบสอบถาม"
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
              <option value="IDENTIFIED">IDENTIFIED (ระบุตัวตน — ผู้ตอบดูคำตอบตนเองย้อนหลังได้)</option>
              <option value="ANONYMOUS">ANONYMOUS (ไม่ระบุตัวตน — แยกตัวตนออกจากคำตอบ)</option>
            </select>
          </div>

          <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
          <h3>รายการคำถาม ({questions.length} ข้อ)</h3>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="card"
              style={{ background: '#faf5ff' }}
              data-testid={`question-block-${qIdx}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>คำถามข้อที่ {qIdx + 1}</strong>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
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
                  placeholder="กรอกโจทย์คำถาม"
                  data-testid={`question-text-${qIdx}`}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
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
                    <option value="SINGLE_CHOICE">ตัวเลือกเดียว (SINGLE_CHOICE 2-10 ตัวเลือก)</option>
                    <option value="RATING">เรตติ้งคะแนน 1-5 (RATING)</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.2rem' }}>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(qIdx, { required: e.target.checked })}
                    data-testid={`question-required-${qIdx}`}
                  />
                  บังคับตอบ (Required)
                </label>
              </div>

              {q.type === 'SINGLE_CHOICE' && (
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    ตัวเลือกคำตอบ (2–10 ตัวเลือก)
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
                        data-testid={`question-${qIdx}-option-${optIdx}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => removeOption(qIdx, optIdx)}
                        data-testid={`remove-option-${qIdx}-${optIdx}`}
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => addOption(qIdx)}
                    data-testid={`add-option-${qIdx}`}
                  >
                    + เพิ่มตัวเลือก
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
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

  useEffect(() => {
    apiRequest<RespondentSurveyItem[]>('/api/surveys')
      .then((data) => setSurveys(data))
      .catch((err) => setError(err.message || 'ไม่สามารถโหลดรายการแบบสอบถามได้'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2>รายการแบบสอบถามที่เปิดรับคำตอบ (Available Surveys)</h2>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <div className="card">กำลังโหลดข้อมูล...</div>
      ) : surveys.length === 0 ? (
        <div className="card">ขณะนี้ยังไม่มีแบบสอบถามที่เปิดรับคำตอบ</div>
      ) : (
        surveys.map((s) => (
          <div className="card" key={s.id} data-testid={`respondent-survey-${s.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0' }}>{s.title}</h3>
                {s.description && (
                  <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>{s.description}</p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    className={`badge ${s.answered ? 'badge-published' : 'badge-draft'}`}
                    data-testid={`answered-badge-${s.id}`}
                  >
                    {s.answered ? 'ตอบแล้ว' : 'ยังไม่ได้ตอบ'}
                  </span>
                  <span className="badge badge-closed">โหมด: {s.mode}</span>
                  <span style={{ fontSize: '0.88rem', color: '#475569' }}>
                    จำนวน {s.questionCount} ข้อ
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!s.answered ? (
                  <Link
                    to={`/surveys/${s.id}`}
                    className="btn btn-primary"
                    data-testid={`take-survey-link-${s.id}`}
                  >
                    ทำแบบสอบถาม
                  </Link>
                ) : (
                  <>
                    {s.responseId && (
                      <Link
                        to={`/responses/${s.responseId}`}
                        className="btn btn-secondary"
                        data-testid={`view-response-link-${s.id}`}
                      >
                        ดูคำตอบที่ส่งแล้ว
                      </Link>
                    )}
                    <Link
                      to={`/surveys/${s.id}`}
                      className="btn btn-outline"
                      data-testid={`revisit-survey-link-${s.id}`}
                    >
                      เปิดหน้าแบบสอบถาม
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

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
      <div className="container">
        <div className="card">กำลังโหลดแบบสอบถาม...</div>
      </div>
    );
  }

  if (loadError || !survey) {
    return (
      <div className="container">
        <div className="alert-error" data-testid="survey-load-error">
          {loadError || 'ไม่พบแบบสอบถาม'}
        </div>
        <Link to="/surveys" className="btn btn-outline">
          กลับหน้ารายการแบบสอบถาม
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{survey.title}</h2>
        {survey.description && <p style={{ color: '#64748b' }}>{survey.description}</p>}

        {submittedResponse ? (
          <div className="alert-success" data-testid="submit-success">
            <h3 style={{ marginTop: 0 }}>ส่งคำตอบแบบสอบถามสำเร็จ!</h3>
            <p>รหัสการส่งคำตอบของคุณ: {submittedResponse.id}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              {survey.mode === 'IDENTIFIED' && (
                <Link
                  to={`/responses/${submittedResponse.id}`}
                  className="btn btn-primary"
                  data-testid="confirmation-view-response-link"
                >
                  ดูคำตอบของฉันที่บันทึกไว้
                </Link>
              )}
              <Link to="/surveys" className="btn btn-outline">
                กลับหน้ารายการแบบสอบถาม
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div className="alert-error" data-testid="submit-error">
                {submitError}
              </div>
            )}

            {survey.questions.map((q: any, idx: number) => (
              <div
                key={q.id}
                className="card"
                style={{ background: '#fdf4ff' }}
                data-testid={`take-question-${idx}`}
              >
                <p style={{ fontWeight: 600, marginTop: 0 }}>
                  ข้อที่ {idx + 1}: {q.text}{' '}
                  {q.required ? (
                    <span style={{ color: '#dc2626' }}>*</span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 400 }}>(ไม่บังคับ)</span>
                  )}
                </p>

                {q.type === 'SINGLE_CHOICE' ? (
                  <div>
                    {q.options.map((opt: any, oIdx: number) => (
                      <label
                        key={opt.id}
                        style={{ display: 'block', marginBottom: '0.45rem', cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id]?.optionId === opt.id}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { optionId: opt.id },
                            }))
                          }
                          data-testid={`radio-q${idx}-opt${oIdx}`}
                        />{' '}
                        {opt.text}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <label key={score} style={{ cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id]?.ratingValue === score}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: { ratingValue: score },
                            }))
                          }
                          data-testid={`rating-q${idx}-${score}`}
                        />{' '}
                        {score} คะแนน
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-testid="submit-response-btn"
              >
                {submitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบ (Submit Response)'}
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

const ViewResponsePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [responseRecord, setResponseRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<any>(`/api/responses/${id}`)
      .then((data) => setResponseRecord(data))
      .catch((err) => setError(err.message || 'ไม่มีสิทธิ์เข้าถึงข้อมูลคำตอบนี้'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container">
      {loading ? (
        <div className="card">กำลังโหลดคำตอบ...</div>
      ) : error ? (
        <div className="card">
          <div className="alert-error" data-testid="response-error">
            {error}
          </div>
          <Link to="/surveys" className="btn btn-outline">
            กลับหน้ารายการแบบสอบถาม
          </Link>
        </div>
      ) : (
        <div className="card" data-testid="response-detail">
          <h2 style={{ marginTop: 0 }}>รายละเอียดคำตอบของคุณ: {responseRecord.survey.title}</h2>
          <p style={{ color: '#64748b' }}>
            รหัสคำตอบ: <code>{responseRecord.id}</code> | ส่งเมื่อ:{' '}
            {new Date(responseRecord.submittedAt).toLocaleString('th-TH')}
          </p>

          {responseRecord.answers.map((ans: any, idx: number) => (
            <div key={ans.id} className="card" style={{ background: '#f8fafc' }}>
              <strong>
                ข้อที่ {idx + 1}: {ans.question.text}
              </strong>
              <p style={{ marginBottom: 0, marginTop: '0.4rem', color: '#0284c7', fontWeight: 600 }}>
                คำตอบที่เลือก:{' '}
                {ans.question.type === 'SINGLE_CHOICE'
                  ? ans.option?.text || '-'
                  : `${ans.ratingValue} / 5 คะแนน`}
              </p>
            </div>
          ))}

          <Link to="/surveys" className="btn btn-outline">
            กลับหน้ารายการแบบสอบถาม
          </Link>
        </div>
      )}
    </div>
  );
};

const SurveySummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<any>(`/api/surveys/${id}/summary`)
      .then((data) => setSummary(data))
      .catch((err) => setError(err.message || 'ไม่สามารถเข้าถึงหน้าสรุปผลนี้ได้'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container">
      {loading ? (
        <div className="card">กำลังคำนวณผลสรุปรวม...</div>
      ) : error ? (
        <div className="card">
          <div className="alert-error" data-testid="summary-error">
            {error}
          </div>
          <Link to="/owner/surveys" className="btn btn-outline">
            กลับหน้าหลัก
          </Link>
        </div>
      ) : (
        <div className="card" data-testid="summary-dashboard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.35rem 0' }}>ผลสรุปแบบสอบถาม: {summary.title}</h2>
              <p style={{ margin: 0, color: '#64748b' }}>
                สถานะ: <strong>{summary.status}</strong> | โหมด: <strong>{summary.mode}</strong>
              </p>
            </div>
            <div
              className="card"
              style={{ margin: 0, padding: '0.75rem 1.25rem', background: '#fdf4ff' }}
            >
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>จำนวนผู้ตอบทั้งหมด</span>
              <div
                style={{ fontSize: '1.65rem', fontWeight: 700, color: '#a21caf' }}
                data-testid="total-responses"
              >
                {summary.totalResponses} คน
              </div>
            </div>
          </div>

          <hr style={{ margin: '1.25rem 0', borderColor: '#e2e8f0' }} />

          {summary.questions.map((q: any, idx: number) => (
            <div key={q.questionId} className="card" data-testid={`summary-question-${idx}`}>
              <h3 style={{ marginTop: 0 }}>
                ข้อที่ {idx + 1}: {q.text}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                ประเภท: {q.type} | จำนวนผู้ตอบข้อนี้: {q.totalAnswered} คน
              </p>

              {q.type === 'SINGLE_CHOICE' ? (
                <div>
                  {q.options.map((opt: any) => (
                    <div key={opt.optionId} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{opt.text}</span>
                        <strong>
                          {opt.count} คน ({typeof opt.percentage === 'number' ? opt.percentage.toFixed(2) : opt.percentage}%)
                        </strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(100, opt.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '1.15rem' }}>
                    ค่าเฉลี่ยคะแนน (Average Rating):{' '}
                    <strong data-testid={`avg-rating-${idx}`}>
                      {typeof q.averageRating === 'number'
                        ? `${q.averageRating.toFixed(2)} / 5.00`
                        : 'ยังไม่มีผู้ตอบ'}
                    </strong>
                  </p>
                  {q.distribution && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
                        การแจกแจงความถี่คะแนน (Rating Distribution):
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                          gap: '0.5rem',
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((score) => {
                          const count = q.distribution[score] ?? 0;
                          const pct = q.totalAnswered > 0 ? (count / q.totalAnswered) * 100 : 0;
                          return (
                            <div
                              key={score}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '0.5rem',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontWeight: 600, color: '#334155' }}>{score} ดาว</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                                {count} คน
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                ({pct.toFixed(2)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <Link to="/owner/surveys" className="btn btn-outline">
            กลับหน้าจัดการแบบสอบถาม
          </Link>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRole?: 'OWNER' | 'RESPONDENT';
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container">
        <div className="card">กำลังตรวจสอบสิทธิ์ผู้ใช้งาน...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'OWNER' ? '/owner/surveys' : '/surveys'} replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
              <ViewResponsePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;

