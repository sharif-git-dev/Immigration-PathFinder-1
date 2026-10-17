import type { Check, Profile } from '../engine/types';
import type { Outcome } from '../engine/evaluate';
import type { calculateCRS } from '../engine/crs';
import type { FswResult } from '../engine/fsw';
import { COUNTRIES } from './countries';

export interface ProgramArabicText {
  name: string;
  summary: string;
  availabilityNote?: string;
  steps?: string[];
  fees?: string;
  processingTime?: string;
}

export const COUNTRY_AR: Record<string, string> = {
  TR: 'تركيا (Türkiye)',
  CA: 'كندا (Canada)',
  SY: 'سوريا (Syria)',
  IN: 'الهند (India)',
  NG: 'نيجيريا (Nigeria)',
  PH: 'الفلبين (Philippines)',
  US: 'الولايات المتحدة (United States)',
  GB: 'المملكة المتحدة (United Kingdom)',
  FR: 'فرنسا (France)',
  DE: 'ألمانيا (Germany)',
  EG: 'مصر (Egypt)',
  JO: 'الأردن (Jordan)',
  LB: 'لبنان (Lebanon)',
  IQ: 'العراق (Iraq)',
  SA: 'السعودية (Saudi Arabia)',
  AE: 'الإمارات (UAE)',
  PS: 'فلسطين (Palestine)',
  SD: 'السودان (Sudan)',
  YE: 'اليمن (Yemen)',
  MA: 'المغرب (Morocco)',
  DZ: 'الجزائر (Algeria)',
  TN: 'تونس (Tunisia)',
  LY: 'ليبيا (Libya)',
  KW: 'الكويت (Kuwait)',
  QA: 'قطر (Qatar)',
  OM: 'عُمان (Oman)',
  BH: 'البحرين (Bahrain)',
};

export function getCountryDisplayName(code: string, lang: 'ar' | 'en'): string {
  if (lang === 'ar' && COUNTRY_AR[code]) return COUNTRY_AR[code];
  const found = COUNTRIES.find((c) => c.code === code);
  return found ? found.name : code;
}

export const PROVINCE_AR: Record<string, string> = {
  ON: 'أونتاريو (Ontario)',
  BC: 'بريتش كولومبيا (British Columbia)',
  AB: 'ألبرتا (Alberta)',
  QC: 'كيبيك (Quebec)',
  MB: 'مانيتوبا (Manitoba)',
  SK: 'ساسكاتشوان (Saskatchewan)',
  NS: 'نوفا سكوشا (Nova Scotia)',
  NB: 'نيو برونزويك (New Brunswick)',
  NL: 'نيوفاوندلاند ولابرادور (Newfoundland & Labrador)',
  PE: 'جزيرة الأمير إدوارد (Prince Edward Island)',
};

export const PROGRAM_AR: Record<string, ProgramArabicText> = {
  'citizenship-descent': {
    name: 'الجنسية الكندية بالنسب (Proof of Citizenship by Descent)',
    summary:
      'للأشخاص المولودين خارج كندا لأب أو أم يحمل الجنسية الكندية. (ملاحظة قانون ديسمبر 2025: إلغاء حد الجيل الأول للمولودين قبل 15 ديسمبر 2025، وشرط إقامة الوالد 1,095 يوماً للمولودين بعد هذا التاريخ).',
    steps: [
      'إثبات أن أحد الوالدين البيولوجيين أو القانونيين كان مواطناً كندياً وقت ولادتك',
      'تقديم طلب شهادة إثبات الجنسية الكندية (Proof of Citizenship)',
    ],
    fees: '75 دولار كندي',
    processingTime: 'من 5 إلى 9 أشهر تقريباً',
  },
  'citizenship-grant': {
    name: 'منح الجنسية الكندية للمقيمين الدائمين (Grant of Citizenship)',
    summary:
      'للمقيمين الدائمين (PR) في كندا الذين أتموا 1,095 يوماً (3 سنوات) من التواجد الفعلي داخل كندا خلال آخر 5 سنوات.',
    steps: [
      'إتمام 1,095 يوماً من الإقامة الفعلية في كندا كمقيم دائم',
      'تقديم الإقرارات الضريبية واجتياز اختبار الجنسية واللغة (للأعمار 18–54)',
    ],
    fees: '630 دولار كندي للبالغين',
    processingTime: 'حوالي 7 إلى 10 أشهر',
  },
  'ee-fsw': {
    name: 'برنامج العمالة الماهرة الفيدرالي (Express Entry — FSW)',
    summary:
      'البرنامج الاقتصادي الرئيسي لأصحاب الكفاءات والمهنيين من خارج أو داخل كندا. يتطلب سنة خبرة ماهرة متواصلة، ومستوى لغة CLB 7، واجتياز شبكة النقاط (67 من 100)، ومبلغ الاستقرار المالي، بالإضافة إلى مجموع نقاط CRS تنافسي للحصول على دعوة (ITA).',
    availabilityNote:
      'تحقيق 67/100 يؤهلك فقط لدخول مجمّع Express Entry؛ للحصول على دعوة فعلية تحتاج إلى نقاط CRS مرتفعة أو التأهل عبر سحوبات الفئات (الفرنسية، الصحة، المهن، STEM) أو ترشيح مقاطعة.',
    steps: [
      'إجراء اختبار لغة معتمد (IELTS General أو CELPIP أو TEF/TCF) وتحقيق CLB 7 على الأقل',
      'معادلة الشهادة الدراسية الأجنبية (ECA — مثل WES)',
      'إنشاء ملف Express Entry مجاناً وانتظار دعوة التقديم (ITA)',
      'تقديم طلب الإقامة الدائمة خلال 60 يوماً من استلام الدعوة',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 أشهر بعد استلام دعوة التقديم (ITA)',
  },
  'ee-cec': {
    name: 'فئة الخبرة الكندية (Express Entry — CEC)',
    summary:
      'للعمال المؤهلين الذين لديهم سنة كاملة على الأقل (1,560 ساعة) من خبرة العمل الماهرة القانونية داخل كندا خلال آخر 3 سنوات. معفى من شرط إثبات الأموال.',
    availabilityNote: 'السحوبات المخصصة لفئة CEC تتطلب عادة نقاط CRS بين 507 و539.',
    steps: [
      'إتمام سنة عمل ماهرة بتصريح عمل سارٍ داخل كندا',
      'تحقيق CLB 7 (لمهن TEER 0/1) أو CLB 5 (لمهن TEER 2/3)',
      'التسجيل في Express Entry وانتظار دعوة التقديم',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 5 إلى 6 أشهر بعد الدعوة',
  },
  'ee-fst': {
    name: 'برنامج الحرفيين المهرة الفيدرالي (Express Entry — FST)',
    summary:
      'لأصحاب الحرف والمهن الصناعية والإنشائية ممن لديهم سنتان خبرة خلال آخر 5 سنوات، مع عرض عمل كندي لمدة سنة أو شهادة مزاولة مهنة كندية.',
    steps: [
      'إثبات سنتين من الخبرة في حرفة مؤهلة',
      'تحقيق مستوى لغة CLB 5 في التحدث والاستماع وCLB 4 في القراءة والكتابة',
      'الحصول على عرض عمل كندي أو شهادة كفاءة مهنية من مقاطعة كندية',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 أشهر بعد الدعوة',
  },
  'ee-category-french': {
    name: 'سحوبات الكفاءة في اللغة الفرنسية (Express Entry — French Category)',
    summary:
      'أقوى مسار حالياً في Express Entry بأقل نقاط مطلوبة (حوالي 390–446 نقطة CRS). يتطلب التأهل الأساسي لدخول المجمّع مع تحقيق مستوى NCLC 7 في اللغة الفرنسية.',
    availabilityNote: 'سحوبات متكررة بحصص كبيرة ومجموع نقاط منخفض مقارنة بالسحوبات العامة.',
    steps: [
      'اجتياز اختبار TEF Canada أو TCF Canada بمستوى NCLC 7 على الأقل في المهارات الأربع',
      'استيفاء شروط أحد برامج Express Entry الأساسية (FSW أو CEC أو FST)',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 أشهر بعد الدعوة',
  },
  'ee-category-healthcare': {
    name: 'سحوبات الرعاية الصحية والخدمات الاجتماعية (Express Entry — Healthcare Category)',
    summary:
      'سحوبات مخصصة للأطباء، الممرضين، الصيادلة، الأخصائيين الاجتماعيين، ومقدمي الرعاية الصحية. (تحديث 2026: يتطلب 12 شهراً على الأقل من الخبرة خلال آخر 3 سنوات).',
    availabilityNote: 'تحديث 2026: رفعت كندا شرط الخبرة في الفئات الموجهة من 6 أشهر إلى 12 شهراً خلال آخر 3 سنوات.',
    steps: [
      'استيفاء شروط دخول مجمّع Express Entry (FSW أو CEC)',
      'إثبات 12 شهراً من الخبرة في مهنة صحية أو اجتماعية مدرجة خلال آخر 3 سنوات',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 أشهر بعد الدعوة',
  },
  'ee-category-stem': {
    name: 'سحوبات الهندسة والتقنية والأمن السيبراني (Express Entry — STEM Category)',
    summary:
      'سحوبات موجهة لـ 11 مهنة هندسية وتقنية محددة لعام 2026 (تشمل المهندسين المدنيين والميكانيكيين والكهربائيين والصناعيين وأخصائيي الأمن السيبراني؛ تم استبعاد مبرمجي البرمجيات العامين). تتطلب 12 شهراً من الخبرة.',
    availabilityNote:
      'تنبيه 2026: قلّصت كندا قائمة STEM إلى 11 مهنة هندسية وأمن سيبراني فقط واستبعدت مطوري البرمجيات العامين، مع اشتراط 12 شهراً من الخبرة.',
    steps: [
      'التأكد من وجود المسمى الوظيفي ضمن المهن الـ 11 المتبقية في قائمة STEM لعام 2026',
      'استيفاء شروط دخول مجمّع Express Entry وإثبات 12 شهراً من الخبرة',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 أشهر بعد الدعوة',
  },
  'pnp-oinp-hcp': {
    name: 'ترشيح مقاطعة أونتاريو للكفاءات البشرية (Ontario OINP — Human Capital Priorities)',
    summary:
      'تختار مقاطعة أونتاريو مرشحين من مجمّع Express Entry ممن يحملون شهادة بكالوريوس ومستوى لغة CLB 7 وخبرة سنة في قطاعات التقنية أو الصحة أو المهن (عادة بنقاط CRS بين 460 و515+).',
    availabilityNote: 'لا يمكن التقديم المباشر؛ يجب انتظار إشعار اهتمام (NOI) من أونتاريو عبر ملفك في Express Entry.',
    steps: [
      'إنشاء ملف Express Entry وتحديد الرغبة في السكن في أونتاريو',
      'تلقي إشعار اهتمام (NOI) من مقاطعة أونتاريو والحصول على +600 نقطة CRS',
    ],
    fees: '1,500 دولار كندي رسوم المقاطعة (+ رسوم الفيدرالي)',
    processingTime: '3 إلى 5 أشهر للترشيح',
  },
  'pnp-sinp-isw': {
    name: 'ترشيح مقاطعة ساسكاتشوان للعمالة الماهرة (Saskatchewan SINP)',
    summary:
      'نظام إبداء الاهتمام (EOI) للعمالة الماهرة. يمنح أولوية كبيرة لمن لديهم قريب من الدرجة الأولى في ساسكاتشوان (+20 نقطة) أو عرض عمل في المقاطعة.',
    availabilityNote: 'بسبب تقليص الحصص الإقليمية في 2026، السحوبات الخارجية تتطلب نقاطاً عالية جداً أو صلة قرابة/عمل في ساسكاتشوان.',
    steps: [
      'تحقيق 60/100 على الأقل في جدول نقاط ساسكاتشوان',
      'تقديم ملف EOI وانتظار دعوة التقديم من المقاطعة',
    ],
    fees: '350 دولار كندي رسوم المقاطعة',
    processingTime: '3 إلى 6 أشهر للترشيح',
  },
  'pnp-mpnp-overseas': {
    name: 'ترشيح مقاطعة مانيتوبا عبر دعم الأقارب (Manitoba MPNP — Skilled Worker Overseas)',
    summary:
      'مخصص للعمالة الماهرة خارج كندا ممن لديهم قريب مقرب (أخ/أخت، والد، عم/خال، عمة/خالة، ابن عم/خال) مواطن أو مقيم دائم يعيش في مانيتوبا منذ سنة على الأقل.',
    steps: [
      'توقيع خطة الاستقرار من قريبك المقيم في مانيتوبا',
      'تحقيق CLB 5 وسنة خبرة و60/100 في نقاط مانيتوبا وتقديم ملف EOI',
    ],
    fees: '500 دولار كندي رسوم المقاطعة',
    processingTime: '4 إلى 6 أشهر للترشيح',
  },
  'pnp-bcpnp-skilled': {
    name: 'ترشيح مقاطعة بريتش كولومبيا للعمالة الماهرة (BC PNP — Skilled Worker)',
    summary:
      'يتطلب عرض عمل دائم بدوام كامل من صاحب عمل مؤهل في مقاطعة بريتش كولومبيا مع سنتين على الأقل من الخبرة المهنية.',
    steps: [
      'الحصول على عرض عمل رسمي من صاحب عمل في بريتش كولومبيا',
      'التسجيل في نظام SIRS وانتظار دعوة المقاطعة',
    ],
    fees: '1,475 دولار كندي رسوم المقاطعة',
    processingTime: '3 إلى 4 أشهر للترشيح',
  },
  'pnp-aaip-aos': {
    name: 'برنامج الهجرة لمقاطعة ألبرتا (Alberta AAIP — Opportunity Stream)',
    summary:
      'مخصص للعمال المتواجدين داخل ألبرتا بتصريح عمل سارٍ وعرض عمل بدوام كامل في المقاطعة.',
    steps: [
      'العمل داخل مقاطعة ألبرتا بتصريح عمل قانوني وعرض عمل مستمر',
      'تقديم إبداء اهتمام (Worker EOI) في بوابة ألبرتا',
    ],
    fees: '840 دولار كندي رسوم المقاطعة',
    processingTime: '4 إلى 6 أشهر',
  },
  'pnp-quebec-pstq': {
    name: 'برنامج العمالة الماهرة لمقاطعة كيبيك (Quebec PSTQ / Arrima)',
    summary:
      'النظام الخاص بمقاطعة كيبيك (خارج Express Entry). يتطلب في 2026 إتقان اللغة الفرنسية (مستوى 7 شفوياً و5 كتابياً على الأقل).',
    steps: [
      'تحقيق المستوى المطلوب في اللغة الفرنسية وتقديم ملف في بوابة Arrima',
      'الحصول على شهادة اختيار كيبيك (CSQ) ثم التقديم للحكومة الفيدرالية',
    ],
    fees: '908 دولار كندي رسوم كيبيك (+ رسوم الفيدرالي)',
    processingTime: '6 أشهر للترشيح + 12–18 شهراً للفيدرالي',
  },
  'economic-empp': {
    name: 'مسار التنقل الاقتصادي للاجئين والنازحين (EMPP — مغلق حالياً)',
    summary:
      'برنامج تجريبي كان يتيح للاجئين وحاملي الحماية المؤقتة (مثل الكملك في تركيا) الهجرة عبر عرض عمل أو مهارات مهنية. أغلقته الحكومة الكندية رسمياً أمام الطلبات الجديدة في 25 مارس 2026.',
    availabilityNote: 'مغلق رسمياً في مارس 2026: أوقفت كندا استلام طلبات EMPP الجديدة، ومن المتوقع إطلاق مسار دائم بديل في أواخر 2026 أو 2027.',
    steps: ['هذا البرنامج مغلق حالياً أمام جميع الطلبات الجديدة وفق موقع canada.ca الرسمي.'],
  },
  'economic-aip': {
    name: 'برنامج الهجرة الأطلسي (Atlantic Immigration Program — AIP)',
    summary:
      'مسار إقامة دائمة مباشر عبر عرض عمل من صاحب عمل معتمد (Designated Employer) في إحدى المقاطعات الأطلسية الأربع (نوفا سكوشا، نيو برونزويك، نيوفاوندلاند، جزيرة الأمير إدوارد).',
    steps: [
      'الحصول على عرض عمل بدوام كامل من صاحب عمل معتمد (Designated Employer) في مقاطعة أطلسية',
      'الحصول على شهادة تأييد المقاطعة (Certificate of Endorsement) والتقديم للإقامة الدائمة',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 6 إلى 11 شهراً',
  },
  'economic-rcip': {
    name: 'برامج الهجرة للمجتمعات الريفية والفرانكوفونية (RCIP & FCIP — 2025/2026)',
    summary:
      'البرامج البديلة الجديدة لعام 2025/2026 في 18 مدينة ومجتمعاً ريفياً كندياً. تتطلب عرض عمل من صاحب عمل معتمد في إحدى تلك المدن وتوصية من لجنة التنمية الاقتصادية المحلية.',
    steps: [
      'الحصول على عرض عمل من صاحب عمل معتمد داخل إحدى المدن الريفية الـ 18 المشاركة',
      'الحصول على شهادة توصية من المجتمع المحلي والتقديم للإقامة الدائمة',
    ],
    fees: '1,525 دولار كندي للبالغ',
    processingTime: 'حوالي 8 إلى 12 شهراً',
  },
  'economic-caregivers': {
    name: 'برامج هجرة مقدمي الرعاية المنزلية (Home Care Worker Pilots — مغلق حالياً)',
    summary:
      'مسار مقدمي الرعاية المنزلية للأطفال وكبار السن. أعلنت وزارة الهجرة الكندية إغلاق التقديم حالياً لحين فتح جولة جديدة.',
    availabilityNote: 'مغلق حالياً أمام الطلبات الجديدة وفق تحديث يناير 2026 على موقع canada.ca.',
    steps: ['التقديم مغلق حالياً على الموقع الرسمي.'],
  },
  'economic-suv': {
    name: 'تأشيرة الشركات الناشئة (Start-Up Visa — متوقف حالياً)',
    summary:
      'برنامج رواد الأعمال المؤسسين لشركات تقنية ناشئة. أوقفت كندا استلام طلبات الالتزام الجديدة مؤقتاً في يوليو 2026.',
    availabilityNote: 'متوقف / مغلق أمام المتقدمين الجدد اعتباراً من يوليو 2026.',
    steps: ['التقديم متوقف حالياً أمام الطلبات الجديدة.'],
  },
  'family-spouse-outland': {
    name: 'كفالة الزوج / الزوجة أو الشريك من خارج كندا (Outland Spousal Sponsorship)',
    summary:
      'إذا كان زوجك/زوجتك مواطناً كندياً أو مقيماً دائماً (PR)، يمكنه كفالتك للحصول على الإقامة الدائمة دون اشتراط حد أدنى للدخل في معظم الحالات.',
    steps: [
      'تقديم طلب الكفالة وطلب الإقامة الدائمة معاً عبر بوابة IRCC',
      'إتمام الفحص الطبي والبصمات والتحقق الأمني',
    ],
    fees: '1,205 دولار كندي',
    processingTime: 'حوالي 10 إلى 14 شهراً (خارج كيبيك)',
  },
  'family-spouse-inland': {
    name: 'كفالة الزوج / الزوجة من داخل كندا (Inland Spousal Sponsorship)',
    summary:
      'للأزواج المتواجدين معاً فعلياً داخل كندا، ويتيح التقديم على تصريح عمل مفتوح أثناء انتظار الإقامة الدائمة.',
    steps: [
      'الإقامة مع الزوج/الزوجة الكندي داخل كندا وتقديم طلب الكفالة الداخلية',
      'التقديم على تصريح عمل مفتوح (Spousal Open Work Permit) بعد استلام رقم الملف (AOR)',
    ],
    fees: '1,205 دولار كندي',
    processingTime: 'حوالي 12 إلى 24 شهراً',
  },
  'family-conjugal': {
    name: 'كفالة الشريك المرتبط (Conjugal Partner Sponsorship)',
    summary:
      'للحالات الاستثنائية التي تمنع فيها عوائق قانونية أو هجرية قاهرة الزواج أو السكن المشترك لمدة سنة.',
    steps: ['إثبات علاقة التزام حقيقية لأكثر من سنة مع وجود مانع قانوني قهري يحول دون الزواج أو الإقامة المشتركة.'],
    fees: '1,205 دولار كندي',
    processingTime: '12 إلى 18 شهراً',
  },
  'family-child': {
    name: 'كفالة الأبناء المعالين (Sponsor Dependent Children)',
    summary:
      'لأبناء المواطن الكندي أو المقيم الدائم ممن تقل أعمارهم عن 22 عاماً وغير متزوجين.',
    steps: ['تقديم طلب كفالة الابن المعال مع شهادات الميلاد وإثبات القرابة.'],
    fees: '175 دولار كندي لكل طفل',
    processingTime: '8 إلى 12 شهراً',
  },
  'family-pgp': {
    name: 'برنامج كفالة الوالدين والأجداد للإقامة الدائمة (PGP — متوقف حالياً)',
    summary:
      'برنامج كفالة الأب أو الأم أو الجد للحصول على الإقامة الدائمة متوقف عن استقبال نماذج اهتمام جديدة منذ 2020 (توصي كندا باستخدام تأشيرة Super Visa بدلاً منه).',
    availabilityNote: 'مغلق أمام المتقدمين الجدد؛ البديل الرسمي المتاح حالياً هو تأشيرة Super Visa لمدة 5 سنوات.',
    steps: ['لا يقبل طلبات جديدة حالياً؛ راجع تأشيرة Super Visa للوالدين والأجداد.'],
  },
  'family-lonely-canadian': {
    name: 'كفالة قريب آخر — استثناء الكندي الوحيد (Lonely Canadian Rule)',
    summary:
      'استثناء نادر جداً يتيح للمواطن أو المقيم الدائم كفالة قريب بالدم (مثل أخ أو أخت أو ابن أخ) فقط إذا لم يكن للكفيل أي زوج أو ابن أو والد أو جد على قيد الحياة في العالم، ولا يوجد له أي قريب كندي على الإطلاق.',
    steps: ['التحقق من عدم وجود أي قريب مباشر على قيد الحياة للكفيل الكندي قبل التقديم.'],
    fees: '1,205 دولار كندي',
    processingTime: '20 إلى 30+ شهراً',
  },
  'refugee-psr': {
    name: 'برنامج الكفالة الخاصة للاجئين عبر المنظمات المعتمدة (PSR — SAH)',
    summary:
      'يتيح للاجئين والنازحين خارج بلدهم الأصلي (بما في ذلك حاملو الحماية المؤقتة / الكملك) إعادة التوطين في كندا إذا توفرت منظمة كندية حاملة لاتفاقية كفالة (SAH) مستعدة لتبني الملف. (ملاحظة 2026: كفالة المجموعة الخماسية G5 متوقفة حالياً، بينما كفالة منظمات SAH مفتوحة).',
    availabilityNote:
      'تحديث 2026: أوقفت كندا مؤقتاً طلبات المجموعة الخماسية (Group of Five) ورعاة المجتمع، بينما تظل الكفالة عبر المنظمات المعتمدة (SAH) مفتوحة ولا تشترط وثيقة UNHCR.',
    steps: [
      'التواجد خارج بلدك الأصلي وخارج كندا مع وجود خوف مبرر من الاضطهاد أو النزاع عند العودة',
      'تأمين منظمة كندية معتمدة (Sponsorship Agreement Holder — SAH) لديها حصة لتقديم ملفك',
      'تلتزم الجهة الكافلة بتغطية تكاليف المعيشة للسنة الأولى في كندا',
      'إجراء المقابلة والفحص الطبي والأمني في السفارة الكندية (وتقييم الوضع الراهن في بلدك الأصلي)',
    ],
    fees: 'مجاني (0 دولار كندي رسوم حكومية)',
    processingTime: 'من 24 إلى 48+ شهراً حسب ضغط المكتب الكندي بالخارج',
  },
  'refugee-gar': {
    name: 'برنامج اللاجئين المكفولين حكومياً عبر إحالة المفوضية (GAR — UNHCR Referral)',
    summary:
      'إعادة توطين اللاجئين الأكثر ضعفاً المحالين مباشرة من مفوضية الأمم المتحدة لشؤون اللاجئين (UNHCR) إلى الحكومة الكندية. لا يمكن التقديم المباشر عليه بنفسك.',
    availabilityNote: 'بالإحالة فقط: لا يمكنك تقديم طلب مباشر لكندا؛ المفوضية (UNHCR) هي الجهة الوحيدة التي تختار وتحيل الملفات.',
    steps: [
      'التسجيل لدى مفوضية الأمم المتحدة لشؤون اللاجئين (UNHCR) في بلد اللجوء',
      'تقوم المفوضية بتقييم الحالات الأكثر خطورة وضعفاً وإحالتها لكندا (أقل من 1% من المسجلين عالمياً)',
    ],
    fees: 'مجاني (0 دولار كندي)',
    processingTime: '18 إلى 36+ شهراً بعد إحالة المفوضية',
  },
  'refugee-in-canada-claim': {
    name: 'طلب اللجوء من داخل كندا أو عبر منفذ حدودي كندي (In-Canada Asylum Claim)',
    summary:
      'مخصص حصرياً للأشخاص المتواجدين فعلياً داخل الأراضي الكندية أو الواقفين عند منفذ دخول كندي رسمي. لا يمكن التقديم عليه أبداً من خارج كندا (مثل تركيا أو الشرق الأوسط).',
    steps: ['التواجد الفعلي داخل كندا أو عند منفذ حدودي كندي وتقديم طلب الحماية لمجلس الهجرة واللاجئين (IRB).'],
    fees: 'مجاني (0 دولار كندي)',
    processingTime: '18 إلى 24 شهراً لجلسة الاستماع',
  },
  'hc-pr': {
    name: 'الإقامة الدائمة لأسباب إنسانية ورحيمة من داخل كندا (H&C — Section 25)',
    summary:
      'مسار استثنائي تقديري للأشخاص المقيمين فعلياً داخل كندا ممن يثبتون استقراراً عميقاً ومصلحة فضلى للأطفال أو مشقة قاسية في حال مغادرة كندا.',
    steps: ['التواجد داخل كندا وتقديم ملف إنساني مدعوم بالأدلة.'],
    fees: '1,210 دولار كندي للبالغ',
    processingTime: '20 إلى 36+ شهراً',
  },
  'hc-americas': {
    name: 'المسار الإنساني العائلي لمواطني كولومبيا وهايتي وفنزويلا (مغلق)',
    summary: 'مسار خاص أُغلق بعد اكتمال الحصة المحددة.',
    availabilityNote: 'مغلق أمام الطلبات الجديدة.',
  },
  'hc-sudan': {
    name: 'المسار الإنساني العائلي للمتضررين من النزاع في السودان (مغلق)',
    summary: 'مسار خاص أُغلق بعد الوصول إلى الحد الأقصى للطلبات.',
    availabilityNote: 'مغلق أمام الطلبات الجديدة وفق موقع canada.ca.',
  },
  'work-pgwp': {
    name: 'تصريح العمل بعد التخرج في كندا (Post-Graduation Work Permit — PGWP)',
    summary:
      'تصريح عمل مفتوح لمدة تصل إلى 3 سنوات لخريجي الجامعات والكليات الكندية المعتمدة. يتطلب في 2026 شهادة لغة (CLB 7 لخريجي الجامعات، وCLB 5 مع تخصص مطلوب لخريجي الكليات).',
    steps: [
      'التخرج من برنامج دراسي بدوام كامل (8 أشهر فأكثر) في مؤسسة كندية مؤهلة لـ PGWP',
      'تقديم شهادة لغة معتمدة (CLB 7 للبكالوريوس/الماجستير/الدكتوراه أو CLB 5 للدبلوم في تخصص مطلوب)',
    ],
    fees: '255 دولار كندي',
    processingTime: '2 إلى 5 أشهر',
  },
  'work-lmia': {
    name: 'تصريح عمل مرتبط بصاحب عمل كندي (LMIA Work Permit)',
    summary:
      'تصريح عمل مغلق يتطلب حصول صاحب العمل الكندي أولاً على موافقة دراسة تأثير سوق العمل (Positive LMIA) من الحكومة الكندية.',
    steps: [
      'الحصول على عقد عمل رسمي من صاحب عمل في كندا',
      'حصول صاحب العمل على موافقة LMIA إيجابية ثم التقديم على تصريح العمل',
    ],
    fees: '155 دولار كندي (+ 85 دولار للبصمات)',
    processingTime: '4 إلى 14 أسبوعاً حسب بلد الإقامة',
  },
  'work-francophone-mobility': {
    name: 'تصريح عمل التنقل الفرانكوفوني المعفى من LMIA (Mobilité Francophone)',
    summary:
      'يتيح لصاحب العمل الكندي (خارج مقاطعة كيبيك) توظيفك بدون الحاجة لـ LMIA إذا كان لديك عرض عمل في مهنة TEER 0–3 ومستوى متوسط في الفرنسية (NCLC 5+ في التحدث والاستماع).',
    steps: [
      'إثبات مستوى NCLC 5 أو أعلى في التحدث والاستماع باللغة الفرنسية',
      'الحصول على عرض عمل خارج كيبيك وتقديم طلب تصريح عمل معفى من LMIA (الرمز C16)',
    ],
    fees: '155 دولار كندي',
    processingTime: '4 إلى 10 أسابيع',
  },
  'work-ict': {
    name: 'نقل الموظفين داخل الشركات متعددة الجنسيات (Intra-Company Transferee — ICT)',
    summary:
      'تصريح عمل معفى من LMIA للمديرين أو أصحاب المعرفة المتخصصة الذين عملوا لمدة سنة على الأقل في شركة أجنبية ولديها فرع أو شركة شقيقة في كندا.',
    steps: ['إثبات العمل لمدة سنة متواصلة في الشركة الأم بالخارج وصدور قرار نقل رسمي للفرع الكندي.'],
    fees: '155 دولار كندي',
    processingTime: '4 إلى 10 أسابيع',
  },
  'work-iec': {
    name: 'برنامج الخبرة الدولية الكندية للشباب (IEC — Working Holiday)',
    summary:
      'تصريح عمل مفتوح للشباب (18–30 أو 35 سنة) لمواطني الدول التي تربطها بكندا اتفاقية تبادل شبابي ثنائية فقط (مثل دول أوروبا، بريطانيا، أستراليا، اليابان، كوريا، تشيلي، كوستاريكا).',
    steps: ['متاح حصرياً لمواطني الدول الموقعة على اتفاقية IEC مع كندا.'],
    fees: '179.75 دولار كندي (+ 100 دولار لتصريح العمل المفتوح)',
    processingTime: '4 إلى 8 أسابيع',
  },
  'work-sowp': {
    name: 'تصريح عمل مفتوح للزوج / الزوجة (Spousal Open Work Permit — SOWP)',
    summary:
      'متاح لأزواج طلاب الماجستير والدكتوراه وبرامج الطب/القانون/الهندسة المحددة، أو أزواج العمال في مهن TEER 0/1 أو مهن النقص المحددة في TEER 2/3 (بشرط بقاء 16 شهراً على الأقل في تصريح عمل الزوج).',
    steps: ['إثبات وضع الزوج القانوني في كندا وتقديم طلب تصريح عمل مفتوح للزوج/الزوجة.'],
    fees: '255 دولار كندي',
    processingTime: '6 إلى 12 أسبوعاً',
  },
  'work-refugee-claimant': {
    name: 'تصريح عمل مفتوح لطالبي اللجوء والأشخاص المحميين داخل كندا',
    summary:
      'يتيح لطالبي اللجوء المتواجدين داخل كندا والذين أُحيلت مطالبهم إلى مجلس الهجرة واللاجئين (IRB) الحصول على تصريح عمل مفتوح مجاناً.',
    steps: ['التواجد داخل كندا مع وجود ملف لجوء محال إلى IRB وإتمام الفحص الطبي.'],
    fees: 'مجاني (0 دولار كندي)',
    processingTime: '1 إلى 3 أشهر',
  },
  'study-permit': {
    name: 'تصريح الدراسة الجامعية أو الكليات في كندا (Study Permit)',
    summary:
      'للدراسة في جامعة أو كلية كندية معتمدة (DLI). (تحديث سبتمبر 2026: يتطلب خطاب قبول + خطاب مصادقة المقاطعة PAL لغير طلاب الماجستير/الدكتوراه + إثبات نفقات معيشة لا تقل عن 23,448 دولار كندي للفرد الواحد بالإضافة إلى قسط السنة الأولى).',
    availabilityNote:
      'تحديث 1 سبتمبر 2026: ارتفع الحد الأدنى لإثبات المصاريف المعيشية لتصريح الدراسة إلى 23,448 دولار كندي لطالب واحد (خارج كيبيك) بجانب الرسوم الدراسية.',
    steps: [
      'الحصول على خطاب قبول (LOA) من مؤسسة تعليمية كندية معتمدة (DLI)',
      'الحصول على خطاب مصادقة المقاطعة (PAL/TAL) — يُعفى منه طلاب الماجستير والدكتوراه',
      'إثبات توفر الرسوم الدراسية + 23,448 دولار كندي على الأقل للمعيشة (لطالب مفرد اعتباراً من سبتمبر 2026)',
    ],
    fees: '150 دولار كندي (+ 85 دولار للبصمات)',
    processingTime: '6 إلى 12 أسبوعاً',
  },
  'study-short-term': {
    name: 'دراسة دورة قصيرة الأمد (6 أشهر أو أقل — معفاة من تصريح الدراسة)',
    summary:
      'الدورات الدراسية أو اللغوية التي تبلغ مدتها الإجمالية 6 أشهر أو أقل لا تتطلب تصريح دراسة، بل يكفي الحصول على تأشيرة زيارة (TRV) أو تصريح سفر إلكتروني (eTA).',
    steps: ['التسجيل في دورة لا تتجاوز 6 أشهر والتقديم على تأشيرة زائر عادية.'],
    fees: '100 دولار كندي (لتأشيرة الزيارة)',
    processingTime: '4 إلى 10 أسابيع',
  },
  'study-minor': {
    name: 'تصريح الدراسة للأطفال القُصّر (المدارس الابتدائية والثانوية)',
    summary:
      'مخصص للأطفال دون سن الرشد (أقل من 18 أو 19 سنة) للدراسة في مدارس كندا، وهم معفون من سقف تصاريح الدراسة ومن خطاب PAL.',
    steps: ['قبول مدرسي أو تواجد أحد الوالدين بتصريح عمل/دراسة في كندا، أو تعيين وصي قانوني كندي (Custodian).'],
    fees: '150 دولار كندي',
    processingTime: '6 إلى 10 أسابيع',
  },
  'visit-trv': {
    name: 'تأشيرة الزيارة الكندية (Temporary Resident Visa — TRV)',
    summary:
      'تأشيرة السياحة أو زيارة العائلة أو رحلات العمل القصيرة لمواطني الدول التي تحتاج إلى فيزا لدخول كندا. تعتمد الموافقة على إقناع موظف الهجرة بقوة روابطك ببلد إقامتك وقدرتك المالية ومغادرتك لكندا في نهاية الزيارة.',
    steps: [
      'تقديم طلب تأشيرة الزيارة إلكترونياً عبر بوابة IRCC',
      'إرفاق كشف حساب بنكي، إثبات عمل/إقامة، خطاب دعوة (إن وجد)، وحجز البصمات',
    ],
    fees: '100 دولار كندي (+ 85 دولار للبصمات)',
    processingTime: 'من 3 إلى 12 أسبوعاً حسب بلد الإقامة',
  },
  'visit-eta': {
    name: 'تصريح السفر الإلكتروني للسفر الجوي (Electronic Travel Authorization — eTA)',
    summary:
      'مخصص لمواطني الدول المعفاة من التأشيرة (مثل دول الاتحاد الأوروبي، بريطانيا، أستراليا، اليابان، إلخ) للسفر جواً إلى كندا.',
    steps: ['التقديم عبر الموقع الرسمي خلال دقائق بتكلفة 7 دولارات كندية فقط.'],
    fees: '7 دولارات كندية',
    processingTime: 'خلال دقائق',
  },
  'visit-eta-conditional': {
    name: 'تصريح السفر الإلكتروني المشروط لمواطني دول محددة (Expanded eTA)',
    summary:
      'يتيح لمواطني 13 دولة محددة (منها المغرب والفلبين والبرازيل) السفر جواً بتصريح eTA بدلاً من الفيزا إذا كانوا يحملون تأشيرة أمريكية سارية أو فيزا كندية سابقة خلال آخر 10 سنوات.',
    steps: ['إثبات وجود تأشيرة أمريكية سارية (US Non-Immigrant Visa) أو تأشيرة كندية سابقة والتقديم على eTA للسفر الجوي فقط.'],
    fees: '7 دولارات كندية',
    processingTime: 'خلال دقائق إلى عدة أيام',
  },
  'visit-us-resident': {
    name: 'دخول المواطنين الأمريكيين وحاملي البطاقة الخضراء الأمريكية (US Green Card)',
    summary:
      'المواطنون الأمريكيون والمقيمون الدائمون في الولايات المتحدة (حاملو Green Card) معفون من تأشيرة الزيارة ومن تصريح eTA عند دخول كندا.',
    steps: ['إبراز جواز السفر الساري والبطاقة الخضراء الأمريكية (Green Card) عند السفر إلى كندا.'],
    fees: 'مجاني (0 دولار كندي)',
    processingTime: 'فوري عند السفر',
  },
  'visit-super-visa': {
    name: 'تأشيرة السوبر فيزا للوالدين والأجداد (Super Visa — إقامة حتى 5 سنوات)',
    summary:
      'تأشيرة متعددة السفرات لمدة 10 سنوات تتيح لآباء وأمهات وأجداد المواطنين الكنديين أو المقيمين الدائمين البقاء في كندا لمدة 5 سنوات متواصلة في كل زيارة.',
    steps: [
      'خطاب دعوة من الابن أو الحفيد المواطن/المقيم الدائم في كندا مع إثبات تحقيقه للحد الأدنى للدخل (LICO)',
      'شراء تأمين طبي خاص معتمد لتغطية 100,000 دولار كندي على الأقل لمدة سنة وإجراء الفحص الطبي',
    ],
    fees: '100 دولار كندي (+ 85 دولار للبصمات)',
    processingTime: 'من 4 إلى 12 أسبوعاً',
  },
  'visit-visitor-record': {
    name: 'تمديد الإقامة كزائر من داخل كندا (Visitor Record)',
    summary:
      'وثيقة تمنحك تمديداً قانونياً للبقاء داخل كندا كزائر قبل انتهاء صلاحية إقامتك الحالية.',
    steps: ['التقديم من داخل كندا قبل 30 يوماً على الأقل من انتهاء فترة الإقامة الحالية.'],
    fees: '100 دولار كندي',
    processingTime: 'حوالي 3 إلى 4 أشهر',
  },
  'visit-trp': {
    name: 'تصريح الإقامة المؤقت الاستثنائي لغير المقبولين (Temporary Resident Permit — TRP)',
    summary:
      'تصريح استثنائي لمن لديهم مانع قانوني أو جنائي أو طبي يمنع دخولهم العادي إلى كندا مع وجود سبب قهري ومبرر قوي للسفر.',
    steps: ['تقديم طلب TRP مع شرح الأسباب القهرية للسفر والأدلة الداعمة.'],
    fees: '229.77 دولار كندي',
    processingTime: 'من 3 إلى 8 أشهر',
  },
};

export function translateCRSLabel(label: string): string {
  const map: Record<string, string> = {
    'Core / Human Capital — Age': 'العمر (العوامل الأساسية)',
    'Core / Human Capital — Level of Education': 'المستوى التعليمي',
    'Core / Human Capital — First Official Language': 'اللغة الرسمية الأولى (الإنجليزية/الفرنسية)',
    'Core / Human Capital — Second Official Language': 'اللغة الرسمية الثانية',
    'Core / Human Capital — Canadian Work Experience': 'خبرة العمل داخل كندا',
    'Spouse / Partner — Level of Education': 'تعليم الزوج/الزوجة',
    'Spouse / Partner — First Official Language': 'لغة الزوج/الزوجة',
    'Spouse / Partner — Canadian Work Experience': 'خبرة عمل الزوج/الزوجة في كندا',
    'Skill Transferability — Education + Language': 'تفاعل التعليم مع مستوى اللغة',
    'Skill Transferability — Education + Canadian Work': 'تفاعل التعليم مع الخبرة الكندية',
    'Skill Transferability — Foreign Work + Language': 'تفاعل الخبرة الخارجية مع اللغة',
    'Skill Transferability — Foreign Work + Canadian Work': 'تفاعل الخبرة الخارجية مع الخبرة الكندية',
    'Skill Transferability — Trade Certificate + Language': 'تفاعل شهادة الحرفة مع اللغة',
    'Additional — Brother or Sister in Canada (Citizen/PR)': 'إضافي: أخ أو أخت في كندا (+15)',
    'Additional — French Language Proficiency': 'إضافي: إتقان اللغة الفرنسية (+25 / +50)',
    'Additional — Post-Secondary Education in Canada': 'إضافي: شهادة دراسية من كندا (+15 / +30)',
  };
  return map[label] || label;
}

export function translateFSWLabel(label: string): string {
  const map: Record<string, string> = {
    'Language Skills (First + Second Official Language)': 'مهارات اللغة (حتى 28 نقطة)',
    'Education': 'المؤهل الدراسي (حتى 25 نقطة)',
    'Skilled Work Experience': 'خبرة العمل الماهرة (حتى 15 نقطة)',
    'Age': 'العمر (حتى 12 نقطة)',
    'Arranged Employment in Canada': 'عرض عمل معتمد في كندا (حتى 10 نقاط)',
    'Adaptability': 'عوامل التكيف والأقارب (حتى 10 نقاط)',
  };
  return map[label] || label;
}

export function translateCheckResultBadge(result: Check['result']): string {
  switch (result) {
    case 'pass':
      return 'مستوفى';
    case 'fail':
      return 'غير مستوفى';
    case 'warn':
      return 'تنبيه مهم';
    case 'unknown':
      return 'يحتاج تحقق / دعوة';
    default:
      return 'معلومة';
  }
}

/**
 * Builds a concise, structured summary of the user's survey answers and computed outcomes
 * so the Gemini AI Assistant knows the user's exact case immediately.
 */
export function buildCaseSummaryForAI(
  profile: Profile,
  crs: ReturnType<typeof calculateCRS>,
  fsw: FswResult,
  outcomes: Outcome[],
  lang: 'ar' | 'en' = 'ar',
): string {
  const isAr = lang === 'ar';
  const openOutcomes = outcomes.filter(
    (o) => o.program.availability !== 'closed' && o.program.availability !== 'paused',
  );

  const getProgName = (o: Outcome) =>
    isAr ? PROGRAM_AR[o.program.id]?.name || o.program.name : o.program.name;

  const eligibleList = openOutcomes.filter((o) => o.status === 'eligible');
  const conditionalList = openOutcomes.filter((o) => o.status === 'possible');
  const closeList = openOutcomes.filter((o) => o.status === 'close').slice(0, 4);

  const topOutcome = openOutcomes[0];
  const topMissingChecks = topOutcome
    ? topOutcome.result.checks
        .filter((c) => c.result === 'fail' || c.result === 'warn' || c.result === 'unknown')
        .map((c) => `${c.label}${c.detail ? ` (${c.detail})` : ''}`)
        .slice(0, 3)
        .join('; ')
    : '';

  if (!isAr) {
    const resCountryEn = profile.residenceCountry
      ? getCountryDisplayName(profile.residenceCountry, 'en')
      : 'Not specified';
    const citizenshipsEn =
      profile.citizenships && profile.citizenships.length > 0
        ? profile.citizenships.map((c) => getCountryDisplayName(c, 'en')).join(', ')
        : 'Not specified';

    return [
      `• Residence: ${resCountryEn} (Status: ${
        profile.residenceCountry === 'CA'
          ? profile.canadaStatus || 'In Canada'
          : profile.residenceStatus || 'Not specified'
      })`,
      `• Citizenship: ${citizenshipsEn} | Age: ${profile.age ?? 'N/A'}`,
      `• Education: ${profile.education || 'N/A'} (Canadian study: ${
        profile.canadianEducation && profile.canadianEducation !== 'none' ? 'Yes' : 'No'
      })`,
      `• Language: English CLB ${profile.englishCLB ?? 0} | French NCLC ${profile.frenchCLB ?? 0}`,
      `• Work Experience: ${profile.foreignExpYears ?? 0} yrs foreign | ${
        profile.canadianExpYears ?? 0
      } yrs in Canada (Fields: ${profile.occupationFields?.join(', ') || 'None'})`,
      `• Job Offer in Canada: ${
        profile.jobOffer === 'yes' ? `Yes (${profile.jobOfferProvince || 'Any'})` : 'No'
      }`,
      `• Family in Canada: ${
        profile.relativesCitizenPR && profile.relativesCitizenPR.length > 0
          ? profile.relativesCitizenPR.join(', ')
          : 'None'
      }`,
      `• Refugee / Fear of Return: ${
        profile.fearOfReturn === 'yes'
          ? `Yes (Doc: ${profile.refugeeDocument || 'none'}, UNHCR: ${
              profile.unhcrRegistered || 'no'
            }, SAH sponsor: ${profile.sponsorAvailable?.includes('sah') ? 'Yes' : 'No'})`
          : 'No'
      }`,
      `• Settlement Funds: $${(profile.fundsCAD ?? 0).toLocaleString()} CAD`,
      `• Express Entry CRS: ${crs.total}/1200 (2026 General/CEC cutoff ~510, French ~400, Category ~440) | FSW Grid: ${
        fsw.total
      }/100 (${fsw.passed ? 'Pass 67+' : 'Below 67'})`,
      `• #1 Best Option: ${topOutcome ? `${getProgName(topOutcome)} [${topOutcome.status}]` : 'None'}${
        topMissingChecks ? ` — Key conditions/gaps: ${topMissingChecks}` : ''
      }`,
      `• Qualified Programs (${eligibleList.length}): ${
        eligibleList.length > 0 ? eligibleList.map(getProgName).join(' | ') : 'None yet'
      }`,
      `• Conditional / Draw-Based (${conditionalList.length}): ${
        conditionalList.length > 0 ? conditionalList.slice(0, 5).map(getProgName).join(' | ') : 'None'
      }`,
      `• Close (Missing 1 fixable step): ${
        closeList.length > 0 ? closeList.map(getProgName).join(' | ') : 'None'
      }`,
    ].join('\n');
  }

  const resCountry = profile.residenceCountry
    ? getCountryDisplayName(profile.residenceCountry, 'ar')
    : 'غير محدد';
  const citizenships =
    profile.citizenships && profile.citizenships.length > 0
      ? profile.citizenships.map((c) => getCountryDisplayName(c, 'ar')).join('، ')
      : 'غير محدد';

  const resStatusMap: Record<string, string> = {
    citizen: 'مواطن في بلد الإقامة',
    permanent_resident: 'مقيم دائم',
    temporary_protection: 'حماية مؤقتة (كملك)',
    refugee_recognized: 'لاجئ معترف به رسمياً',
    asylum_pending: 'طالب لجوء',
    temp_work: 'إقامة عمل مؤقتة',
    temp_study: 'إقامة دراسة',
    temp_visitor: 'زائر',
    no_status: 'بلا إقامة قانونية',
  };

  const caStatusMap: Record<string, string> = {
    pgwp: 'تصريح عمل بعد التخرج (PGWP)',
    worker: 'تصريح عمل داخل كندا',
    student: 'طالب دولي داخل كندا',
    visitor: 'زائر داخل كندا',
    asylum_claimant: 'طالب لجوء داخل كندا',
    protected_person: 'شخص محمي داخل كندا',
    out_of_status: 'منتهي الإقامة داخل كندا',
  };

  const eduMap: Record<string, string> = {
    phd: 'دكتوراه',
    masters: 'ماجستير',
    two_or_more: 'شهادتان جامعيتان',
    bachelors: 'بكالوريوس',
    two_year: 'دبلوم سنتين',
    one_year: 'دبلوم سنة',
    secondary: 'ثانوية عامة',
    none: 'أقل من ثانوية',
  };

  const lines = [
    `• الإقامة: ${resCountry} (${
      profile.residenceCountry === 'CA'
        ? caStatusMap[profile.canadaStatus || ''] || 'داخل كندا'
        : resStatusMap[profile.residenceStatus || ''] || 'غير محدد'
    }) | الجنسية: ${citizenships} | العمر: ${profile.age ?? 'غير محدد'}`,
    `• التعليم: ${eduMap[profile.education || ''] || 'غير محدد'} (دراسة بكندا: ${
      profile.canadianEducation && profile.canadianEducation !== 'none' ? 'نعم' : 'لا'
    })`,
    `• اللغة: الإنجليزية CLB ${profile.englishCLB ?? 0} | الفرنسية NCLC ${profile.frenchCLB ?? 0}`,
    `• الخبرة: ${profile.foreignExpYears ?? 0} سنوات بالخارج | ${
      profile.canadianExpYears ?? 0
    } سنوات بكندا (المجال: ${profile.occupationFields?.join(', ') || 'غير محدد'})`,
    `• عرض عمل بكندا: ${profile.jobOffer === 'yes' ? 'نعم' : 'لا'} | أقارب بكندا: ${
      profile.relativesCitizenPR && profile.relativesCitizenPR.length > 0
        ? profile.relativesCitizenPR.join(', ')
        : 'لا يوجد'
    }`,
    `• اللجوء: ${
      profile.fearOfReturn === 'yes'
        ? `نعم (وثيقة: ${profile.refugeeDocument || 'لا'}، كفيل SAH: ${
            profile.sponsorAvailable?.includes('sah') ? 'متوفر' : 'غير متوفر'
          })`
        : 'لا'
    } | المدخرات: $${(profile.fundsCAD ?? 0).toLocaleString()} CAD`,
    `• النقاط: CRS ${crs.total}/1200 (معدل السحب العام ~510، الفرنسي ~400) | FSW ${fsw.total}/100 (${
      fsw.passed ? 'مجتاز 67+' : 'أقل من 67'
    })`,
    `• أفضل خيار رقم 1: ${topOutcome ? getProgName(topOutcome) : 'لا يوجد'}${
      topMissingChecks ? ` — الملاحظات/النواقص: ${topMissingChecks}` : ''
    }`,
    `• البرامج المؤهلة (${eligibleList.length}): ${
      eligibleList.length > 0 ? eligibleList.map(getProgName).join(' | ') : 'لا يوجد حالياً'
    }`,
    `• البرامج المشروطة (${conditionalList.length}): ${
      conditionalList.length > 0 ? conditionalList.slice(0, 5).map(getProgName).join(' | ') : 'لا يوجد'
    }`,
    `• برامج ينقصها شرط واحد: ${
      closeList.length > 0 ? closeList.map(getProgName).join(' | ') : 'لا يوجد'
    }`,
  ];

  return lines.join('\n');
}
