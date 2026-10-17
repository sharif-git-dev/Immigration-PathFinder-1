import React, { useState } from 'react';
import type { Profile } from '../engine/types';
import type { Outcome } from '../engine/evaluate';
import { calculateCRS } from '../engine/crs';
import { calculateFSWPoints } from '../engine/fsw';
import { buildCaseSummaryForAI } from '../data/arabicTranslations';
import { DEEPSEEK_API_KEY } from '../config';

interface AiCaseAssistantProps {
  profile: Profile;
  outcomes: Outcome[];
  lang: 'ar' | 'en';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
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

  const crs = calculateCRS(profile);
  const fsw = calculateFSWPoints(profile);
  const caseSummary = buildCaseSummaryForAI(profile, crs, fsw, outcomes);

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
    const trimmedQuestion = userPrompt.trim();
    if (!trimmedQuestion) return;

    const activeKey = getApiKeyFromCode();
    if (!activeKey) {
      setErrorMsg(
        isAr
          ? 'ضع مفتاح DeepSeek API في ملف src/config.ts'
          : 'Add your DeepSeek API key in src/config.ts',
      );
      return;
    }

    setErrorMsg(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmedQuestion }];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    const systemInstruction = `أنت مستشار ذكي مختصر للهجرة إلى كندا (بيانات 2026 الرسمية من canada.ca).
ملخص حالة المستخدم المحسوب تلقائياً:
---
${caseSummary}
---
قواعد:
- برنامج EMPP مغلق منذ مارس 2026، وكفالة الخمسة G5 متوقفة، وكفالة المنظمات SAH مفتوحة.
- أجب باختصار شديد (3 إلى 4 نقاط قصيرة فقط) باللغة العربية بناءً على ملخص حالة المستخدم أعلاه مباشرة.`;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemInstruction },
            ...nextMessages.map((m) => ({
              role: m.role,
              content: m.text,
            })),
          ],
          temperature: 0.3,
          max_tokens: 350,
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

      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err: any) {
      setErrorMsg(err.message || 'API Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-card">
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
            disabled={loading}
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
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isAr ? 'اكتب سؤالك هنا...' : 'Ask a question...'}
          className="results-search-input"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="btn-ai-send"
        >
          {loading ? '...' : isAr ? 'إرسال' : 'Send'}
        </button>
      </form>
    </div>
  );
};
