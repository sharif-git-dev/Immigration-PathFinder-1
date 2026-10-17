import React, { useState, useEffect } from 'react';
import type { Profile } from '../engine/types';
import type { Outcome } from '../engine/evaluate';
import { calculateCRS } from '../engine/crs';
import { calculateFSWPoints } from '../engine/fsw';
import { buildCaseSummaryForAI } from '../data/arabicTranslations';
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_PROXY_URL,
  DEEPSEEK_MODEL,
  AI_MAX_QUESTIONS_PER_DAY,
  AI_COOLDOWN_SECONDS,
  AI_MAX_INPUT_CHARS,
  AI_MAX_OUTPUT_TOKENS,
} from '../config';

interface AiCaseAssistantProps {
  profile: Profile;
  outcomes: Outcome[];
  lang: 'ar' | 'en';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const RATE_LIMIT_STORAGE_KEY = 'canada_pathfinder_ai_daily_usage_v1';

interface DailyUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyUsage(): DailyUsage {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyUsage;
      if (parsed.date === today && typeof parsed.count === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { date: today, count: 0 };
}

function incrementDailyUsage(): DailyUsage {
  const current = loadDailyUsage();
  const updated: DailyUsage = { date: current.date, count: current.count + 1 };
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

function getApiKeyFromCode(): string {
  if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.trim()) {
    return DEEPSEEK_API_KEY.trim();
  }
  const proc = (globalThis as any).process;
  const envKey =
    proc?.env?.DEEPSEEK_API_KEY ||
    (import.meta as any).env?.VITE_DEEPSEEK_API_KEY ||
    proc?.env?.API_KEY ||
    proc?.env?.GEMINI_API_KEY ||
    '';
  return typeof envKey === 'string' ? envKey.trim() : '';
}

export const AiCaseAssistant: React.FC<AiCaseAssistantProps> = ({
  profile,
  outcomes,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyUsed, setDailyUsed] = useState<number>(() => loadDailyUsage().count);
  const [cooldownLeft, setCooldownLeft] = useState<number>(0);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  const crs = calculateCRS(profile);
  const fsw = calculateFSWPoints(profile);
  const caseSummary = buildCaseSummaryForAI(profile, crs, fsw, outcomes);

  const remainingQuestions = Math.max(0, AI_MAX_QUESTIONS_PER_DAY - dailyUsed);
  const isQuotaReached = remainingQuestions <= 0;

  const quickQuestions = isAr
    ? [
        'ما هو أفضل برنامج لحالتي؟',
        'كيف أرفع نقاطي؟',
        'ما بديل برنامج EMPP؟',
        'ما هي الخطوة الأولى؟',
      ]
    : [
        'Best program for me?',
        'How to raise my score?',
        'EMPP alternatives?',
        'First step to take?',
      ];

  const askAI = async (userPrompt: string) => {
    const trimmedQuestion = userPrompt.trim().slice(0, AI_MAX_INPUT_CHARS);
    if (!trimmedQuestion) return;

    // 1. Check daily limit
    const currentUsage = loadDailyUsage();
    setDailyUsed(currentUsage.count);
    if (currentUsage.count >= AI_MAX_QUESTIONS_PER_DAY) {
      setErrorMsg(
        isAr
          ? `وصلت للحد الأقصى اليومي (${AI_MAX_QUESTIONS_PER_DAY} أسئلة). حاول غداً.`
          : `Daily limit reached (${AI_MAX_QUESTIONS_PER_DAY} questions/day). Try again tomorrow.`,
      );
      return;
    }

    // 2. Check cooldown
    if (cooldownLeft > 0) {
      setErrorMsg(
        isAr
          ? `يرجى الانتظار ${cooldownLeft} ثوانٍ قبل إرسال سؤال آخر.`
          : `Please wait ${cooldownLeft}s before asking another question.`,
      );
      return;
    }

    const proxyUrl = DEEPSEEK_PROXY_URL.trim();
    const activeKey = getApiKeyFromCode();

    if (!proxyUrl && !activeKey) {
      setErrorMsg(
        isAr
          ? 'المفتاح غير مضاف بعد (VITE_DEEPSEEK_API_KEY أو src/config.ts)'
          : 'API key not configured yet.',
      );
      return;
    }

    setErrorMsg(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmedQuestion }];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    // Only send last 2 messages to minimize token usage
    const recentHistory = nextMessages.slice(-2);

    const systemInstruction = `أنت مستشار ذكي مختصر للهجرة إلى كندا (بيانات 2026 الرسمية من canada.ca).
ملخص حالة المستخدم:
---
${caseSummary}
---
قواعد صارمة:
- أجب فقط على الأسئلة المتعلقة بهجرة كندا وحالة المستخدم أعلاه. ارفض أي سؤال خارج موضوع هجرة كندا.
- برنامج EMPP مغلق منذ مارس 2026، وكفالة الخمسة G5 متوقفة، وكفالة المنظمات SAH مفتوحة.
- أجب باختصار شديد (3 نقاط قصيرة كحد أقصى).`;

    try {
      const endpoint = proxyUrl || 'https://api.deepseek.com/chat/completions';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (!proxyUrl && activeKey) {
        headers.Authorization = `Bearer ${activeKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemInstruction },
            ...recentHistory.map((m) => ({
              role: m.role,
              content: m.text,
            })),
          ],
          temperature: 0.2,
          max_tokens: AI_MAX_OUTPUT_TOKENS,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data?.choices?.[0]?.message?.content?.trim() ||
        (isAr ? 'لا يوجد رد.' : 'No response.');

      const updatedUsage = incrementDailyUsage();
      setDailyUsed(updatedUsage.count);
      setCooldownLeft(AI_COOLDOWN_SECONDS);
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err: any) {
      setErrorMsg(err.message || 'API Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <h3 className="ai-assistant-title">
            {isAr ? 'اسأل الذكاء الاصطناعي عن حالتك' : 'Ask AI'}
          </h3>
          <button
            type="button"
            onClick={() => setShowInfo((prev) => !prev)}
            className={`info-bang-btn ${showInfo ? 'active' : ''}`}
            title={isAr ? 'عرض ملخص حالتك المرسل للذكاء الاصطناعي' : 'Case summary'}
          >
            !
          </button>
        </div>

        <span
          className={`clean-badge ${isQuotaReached ? 'badge-ineligible' : 'badge-potential'}`}
          title={isAr ? 'عدد الأسئلة المتبقية اليوم' : 'Remaining questions today'}
        >
          {isAr
            ? `${remainingQuestions} / ${AI_MAX_QUESTIONS_PER_DAY} أسئلة اليوم`
            : `${remainingQuestions} / ${AI_MAX_QUESTIONS_PER_DAY} today`}
        </span>
      </div>

      {showInfo && (
        <div className="info-bang-popover" style={{ marginTop: 12 }}>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: 13,
              color: '#475569',
              lineHeight: 1.6,
            }}
          >
            {caseSummary}
          </pre>
        </div>
      )}

      <div className="ai-quick-chips">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading || isQuotaReached || cooldownLeft > 0}
            onClick={() => askAI(q)}
            className="ai-chip-btn"
          >
            {q}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="ai-chat-log">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-chat-bubble ${
                msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-assistant'
              }`}
            >
              <div className="ai-bubble-text">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-chat-bubble ai-bubble-assistant">
              <div className="ai-bubble-text" style={{ color: '#64748b' }}>
                ...
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          askAI(question);
        }}
        className="ai-input-row"
      >
        <input
          type="text"
          value={question}
          maxLength={AI_MAX_INPUT_CHARS}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            isQuotaReached
              ? isAr
                ? 'انتهى الحد اليومي للأسئلة'
                : 'Daily limit reached'
              : isAr
              ? `اكتب سؤالك هنا (حتى ${AI_MAX_INPUT_CHARS} حرفاً)...`
              : `Ask a question (max ${AI_MAX_INPUT_CHARS} chars)...`
          }
          className="results-search-input"
          disabled={loading || isQuotaReached}
        />
        <button
          type="submit"
          disabled={loading || isQuotaReached || cooldownLeft > 0 || !question.trim()}
          className="btn-ai-send"
        >
          {loading
            ? '...'
            : cooldownLeft > 0
            ? `${cooldownLeft}s`
            : isAr
            ? 'إرسال'
            : 'Send'}
        </button>
      </form>
    </div>
  );
};
