// Bilingual translations for TabibDesk landing page
export const translations = {
  ar: {
    // Hero
    heroHeadline: "عيادتك تمشي أسرع… من غير ورق ومن غير فورمز",
    heroSubheadline: "TabibDesk يكتب معاك. يلخّص. يذكّر. ويخلي المتابعة سهلة.",
    ctaPrimary: "ابدأ تجربة مجانية",
    ctaSecondary: "اطلب ديمو",
    heroFeature1: "زيارة أسرع",
    heroFeature2: "متابعة أوتوماتيك",
    heroFeature3: "ملف مريض ذكي",

    // Problem → Outcome
    problem1: "المواعيد بتتلخبط",
    problem2: "المريض بيرجع بعد شهر وانت ناسي التفاصيل",
    problem3: "المتابعات بتضيع",
    outcome1: "ملخص جاهز لكل مريض",
    outcome2: "تاسكات للسكرتيرة والمريض",
    outcome3: "تنبيهات للمتابعات والتحاليل",

    // Differentiators
    diff1: "تسجيل بالڤويس → نوت جاهزة",
    diff1Note: "(دكتور يوافق)",
    diff2: "AI يلخص آخر الزيارات في ثواني",
    diff3: "AI يقترح تاسكات وفولو-أب",
    diff4: "رفع تحاليل/صور + استخراج نتائج (اختياري)",
    diff5: "كل عيادة تختار اللي يظهر: تبويبات بسيطة",

    // How it works
    step1: "افتح المريض",
    step2: "اتكلم/اكتب… والنوت تتجهز",
    step3: "اقفل الزيارة: خطة + تاسكات + معاد متابعة",
    controlNote: "كل اقتراحات الـ AI لازم تتأكد منها.",

    // What you get
    module1: "المواعيد",
    module2: "ملفات المرضى + الخط الزمني",
    module3: "النوتات + القوالب",
    module4: "التاسكات والمتابعات",
    module5: "التحاليل/الملفات",
    module6: "الإجراءات/العلاجات",
    module7: "إحصائيات بسيطة (غيابات، إعادة حجز، متابعات متأخرة)",
    module8: "استشارة أونلاين + دفعات (اختياري)",

    // Pricing
    pricingTitle: "الأسعار",
    planBasic: "Solo Basic",
    planBasicPrice: "899",
    planBasicPeriod: "جنيه/شهر",
    planBasicDesc: "طبيب واحد + موظف واحد",
    planPro: "Solo Pro",
    planProPrice: "1,599",
    planProPeriod: "جنيه/شهر",
    planProDesc: "طبيب واحد + موظفين",
    addonAINotes: "AI Notes",
    addonAINotesPrice: "499",
    addonVoice: "Voice",
    addonVoicePrice: "699",
    addonLabAI: "Lab AI",
    addonLabAIPrice: "399",
    addonAIBundle: "AI Bundle",
    addonAIBundlePrice: "1,199",
    pricingCancel: "يمكنك الإلغاء في أي وقت.",

    // Trust
    trust1: "بياناتك محفوظة",
    trust2: "صلاحيات للموظفين",
    trust3: "سجل تغييرات (Audit log)",

    // Final CTA
    finalCTATitle: "جرّب TabibDesk",
    finalCTASubtitle: "احجز ديمو",

    // Language toggle
    langAr: "العربية",
    langEn: "English",
  },
  en: {
    // Hero
    heroHeadline: "Your clinic runs faster... without papers, without forms",
    heroSubheadline: "TabibDesk writes with you. Summarizes. Reminds. Makes follow-ups easy.",
    ctaPrimary: "Start free trial",
    ctaSecondary: "Request demo",
    heroFeature1: "Faster visits",
    heroFeature2: "Automatic follow-up",
    heroFeature3: "Smart patient file",

    // Problem → Outcome
    problem1: "Appointments get mixed up",
    problem2: "Patient returns after a month and you forgot the details",
    problem3: "Follow-ups get lost",
    outcome1: "Ready summary for each patient",
    outcome2: "Tasks for secretary and patient",
    outcome3: "Alerts for follow-ups and labs",

    // Differentiators
    diff1: "Voice recording → Ready notes",
    diff1Note: "(doctor approves)",
    diff2: "AI summarizes recent visits in seconds",
    diff3: "AI suggests tasks and follow-ups",
    diff4: "Upload labs/images + extract results (optional)",
    diff5: "Each clinic chooses what appears: simple tabs",

    // How it works
    step1: "Open patient",
    step2: "Speak/write... notes get ready",
    step3: "Close visit: plan + tasks + follow-up date",
    controlNote: "All AI suggestions need your approval.",

    // What you get
    module1: "Appointments",
    module2: "Patient profiles + timeline",
    module3: "Notes + templates",
    module4: "Tasks & follow-ups",
    module5: "Labs/files",
    module6: "Procedures/therapies",
    module7: "Basic insights (no-shows, rebooking, overdue follow-ups)",
    module8: "Online consultation + payments (optional)",

    // Pricing
    pricingTitle: "Pricing",
    planBasic: "Solo Basic",
    planBasicPrice: "899",
    planBasicPeriod: "EGP/month",
    planBasicDesc: "1 doctor + 1 staff",
    planPro: "Solo Pro",
    planProPrice: "1,599",
    planProPeriod: "EGP/month",
    planProDesc: "1 doctor + 2 staff",
    addonAINotes: "AI Notes",
    addonAINotesPrice: "499",
    addonVoice: "Voice",
    addonVoicePrice: "699",
    addonLabAI: "Lab AI",
    addonLabAIPrice: "399",
    addonAIBundle: "AI Bundle",
    addonAIBundlePrice: "1,199",
    pricingCancel: "You can cancel anytime.",

    // Trust
    trust1: "Your data is secure",
    trust2: "Permissions for staff",
    trust3: "Change log (Audit log)",

    // Final CTA
    finalCTATitle: "Try TabibDesk",
    finalCTASubtitle: "Book a demo",

    // Language toggle
    langAr: "العربية",
    langEn: "English",
  },
} as const

export type Language = "ar" | "en"

