
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'menu_items': 'Menu Items',
    'promo_codes': 'Promo Codes',
    'feedback': 'Feedback',
    'notifications': 'Notifications',
    'dashboard_title': 'Food App Dashboard',
    
    // Common
    'loading': 'Loading...',
    'cancel': 'Cancel',
    'create': 'Create',
    'update': 'Update',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'save': 'Save',
    'send': 'Send',
    
    // Promo Codes
    'add_promo_code': 'Add Promo Code',
    'edit_promo_code': 'Edit Promo Code',
    'promo_code': 'Promo Code',
    'description': 'Description',
    'percentage': 'Percentage (%)',
    'start_date': 'Start Date',
    'expiry_date': 'Expiry Date',
    'active': 'Active',
    'expired': 'Expired',
    'scheduled': 'Scheduled',
    'starts': 'Starts',
    'expires': 'Expires',
    
    // Notifications
    'send_notifications': 'Send Notifications',
    'active_devices': 'Active Devices',
    'compose_notification': 'Compose Notification',
    'notification_title': 'Notification Title',
    'notification_body': 'Notification Body',
    'notification_preview': 'Notification Preview',
    'total_devices': 'Total Devices',
    'platform_breakdown': 'Platform Breakdown',
    'firebase_config_required': 'Firebase Configuration Required',
  },
  ar: {
    // Navigation
    'menu_items': 'عناصر القائمة',
    'promo_codes': 'أكواد الخصم',
    'feedback': 'التقييمات',
    'notifications': 'الإشعارات',
    'dashboard_title': 'لوحة تحكم تطبيق الطعام',
    
    // Common
    'loading': 'جاري التحميل...',
    'cancel': 'إلغاء',
    'create': 'إنشاء',
    'update': 'تحديث',
    'edit': 'تعديل',
    'delete': 'حذف',
    'add': 'إضافة',
    'save': 'حفظ',
    'send': 'إرسال',
    
    // Promo Codes
    'add_promo_code': 'إضافة كود خصم',
    'edit_promo_code': 'تعديل كود الخصم',
    'promo_code': 'كود الخصم',
    'description': 'الوصف',
    'percentage': 'النسبة المئوية (%)',
    'start_date': 'تاريخ البداية',
    'expiry_date': 'تاريخ الانتهاء',
    'active': 'نشط',
    'expired': 'منتهي الصلاحية',
    'scheduled': 'مجدول',
    'starts': 'يبدأ',
    'expires': 'ينتهي',
    
    // Notifications
    'send_notifications': 'إرسال الإشعارات',
    'active_devices': 'الأجهزة النشطة',
    'compose_notification': 'كتابة إشعار',
    'notification_title': 'عنوان الإشعار',
    'notification_body': 'محتوى الإشعار',
    'notification_preview': 'معاينة الإشعار',
    'total_devices': 'إجمالي الأجهزة',
    'platform_breakdown': 'تفصيل المنصات',
    'firebase_config_required': 'يتطلب إعداد Firebase',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={language === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
