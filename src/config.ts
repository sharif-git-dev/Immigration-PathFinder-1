// ⚠️ تنبيه أمني: إذا كان مستودع GitHub عاماً (Public)، لا ترفع المفتاح هنا إلى GitHub!
// بدلاً من ذلك ضعه في ملف .env.local (المحمي في .gitignore) باسم VITE_DEEPSEEK_API_KEY
// أو في GitHub Secrets، أو استخدم DEEPSEEK_PROXY_URL أدناه.
export const DEEPSEEK_API_KEY: string = '';

// (اختياري - الأكثر أماناً) رابط Cloudflare Worker Proxy لإخفاء المفتاح تماماً عن المتصفح:
export const DEEPSEEK_PROXY_URL: string = '';

export const DEEPSEEK_MODEL: string = 'deepseek-chat';

// حدود الحماية من الاستهلاك الزائد (Rate Limits):
export const AI_MAX_QUESTIONS_PER_DAY: number = 5;   // أقصى عدد أسئلة لكل مستخدم يومياً
export const AI_COOLDOWN_SECONDS: number = 10;       // فترة الانتظار بالثواني بين كل سؤال وآخر
export const AI_MAX_INPUT_CHARS: number = 220;       // أقصى طول للسؤال الواحد (بالحروف)
export const AI_MAX_OUTPUT_TOKENS: number = 250;     // أقصى حجم لرد الذكاء الاصطناعي
