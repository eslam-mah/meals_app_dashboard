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
    'now': 'now',
    
    // Menu Items
    'add_menu_item': 'Add Menu Item',
    'edit_menu_item': 'Edit Menu Item',
    'menu_item_created': 'Menu item created successfully!',
    'menu_item_updated': 'Menu item updated successfully!',
    'menu_item_deleted': 'Menu item deleted successfully!',
    'error_deleting_menu_item': 'Error deleting menu item',
    'arabic_name': 'Arabic Name',
    'english_name': 'English Name',
    'arabic_description': 'Arabic Description',
    'english_description': 'English Description',
    'price': 'Price',
    'meal_type': 'Meal Type',
    'food_image': 'Food Image',
    'sizes': 'Sizes',
    'extras': 'Extras',
    'beverages': 'Beverages',
    'add_size': 'Add Size',
    'add_extra': 'Add Extra',
    'add_beverage': 'Add Beverage',
    'menu': 'Menu',
    'recommended': 'Recommended',
    'offer': 'Offer',
    
    // Promo Codes
    'add_promo_code': 'Add Promo Code',
    'edit_promo_code': 'Edit Promo Code',
    'promo_code': 'Promo Code',
    'promo_code_created': 'Promo code created successfully!',
    'promo_code_updated': 'Promo code updated successfully!',
    'promo_code_deleted': 'Promo code deleted successfully!',
    'error_creating_promo_code': 'Error creating promo code',
    'error_updating_promo_code': 'Error updating promo code',
    'error_deleting_promo_code': 'Error deleting promo code',
    'description': 'Description',
    'percentage': 'Percentage (%)',
    'start_date': 'Start Date',
    'expiry_date': 'Expiry Date',
    'active': 'Active',
    'expired': 'Expired',
    'scheduled': 'Scheduled',
    'starts': 'Starts',
    'expires': 'Expires',
    'off': 'OFF',
    'promo_description_placeholder': 'Special discount for new customers',
    'no_promo_codes_yet': 'No promo codes created yet.',
    
    // Feedback
    'customer_feedback': 'Customer Feedback',
    'total_reviews': 'Total Reviews',
    'anonymous': 'Anonymous',
    'food_quality': 'Food Quality',
    'service_speed': 'Service Speed',
    'ease_of_ordering': 'Ease of Ordering',
    'overall_satisfaction': 'Overall Satisfaction',
    'like': 'Like',
    'dislike': 'Dislike',
    'comment': 'Comment',
    'no_feedback_yet': 'No feedback received yet.',
    'feedback_deleted': 'Feedback deleted successfully!',
    'error_deleting_feedback': 'Error deleting feedback',
    'confirm_delete_feedback': 'Are you sure you want to delete this feedback?',
    
    // Notifications
    'send_notifications': 'Send Notifications',
    'active_devices': 'Active Devices',
    'compose_notification': 'Compose Notification',
    'notification_title': 'Notification Title',
    'notification_body': 'Notification Body',
    'notification_preview': 'Notification Preview',
    'total_devices': 'Total Devices',
    'platform_breakdown': 'Platform Breakdown',
    'notification_title_placeholder': 'Enter notification title...',
    'notification_body_placeholder': 'Enter notification message...',
    'sending_notification': 'Sending...',
    'send_to_devices': 'Send to {count} Devices',
    'notification_sent_success_all': 'All {count} notifications sent successfully!',
    'notification_sent_success_partial': '{success} of {total} notifications sent successfully. {failed} failed.',
    'notification_sent_failed_all': 'All {count} notifications failed to send.',
    'notification_send_error': 'Failed to send notification',
    'notification_form_validation': 'Please fill in both title and body',
    'notification_info_message': 'Your notification will be sent to all active devices. Make sure your message is clear and engaging!',
    'no_devices_message': 'No active devices found. Users need to enable notifications in the mobile app first.',
    'notification_preview_title': 'Notification Title',
    'notification_preview_body': 'Notification body will appear here...',
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
    'now': 'الآن',
    
    // Menu Items
    'add_menu_item': 'إضافة عنصر قائمة',
    'edit_menu_item': 'تعديل عنصر القائمة',
    'menu_item_created': 'تم إنشاء عنصر القائمة بنجاح!',
    'menu_item_updated': 'تم تحديث عنصر القائمة بنجاح!',
    'menu_item_deleted': 'تم حذف عنصر القائمة بنجاح!',
    'error_deleting_menu_item': 'خطأ في حذف عنصر القائمة',
    'arabic_name': 'الاسم العربي',
    'english_name': 'الاسم الإنجليزي',
    'arabic_description': 'الوصف العربي',
    'english_description': 'الوصف الإنجليزي',
    'price': 'السعر',
    'meal_type': 'نوع الوجبة',
    'food_image': 'صورة الطعام',
    'sizes': 'الأحجام',
    'extras': 'الإضافات',
    'beverages': 'المشروبات',
    'add_size': 'إضافة حجم',
    'add_extra': 'إضافة إضافة',
    'add_beverage': 'إضافة مشروب',
    'menu': 'قائمة',
    'recommended': 'مُوصى به',
    'offer': 'عرض',
    
    // Promo Codes
    'add_promo_code': 'إضافة كود خصم',
    'edit_promo_code': 'تعديل كود الخصم',
    'promo_code': 'كود الخصم',
    'promo_code_created': 'تم إنشاء كود الخصم بنجاح!',
    'promo_code_updated': 'تم تحديث كود الخصم بنجاح!',
    'promo_code_deleted': 'تم حذف كود الخصم بنجاح!',
    'error_creating_promo_code': 'خطأ في إنشاء كود الخصم',
    'error_updating_promo_code': 'خطأ في تحديث كود الخصم',
    'error_deleting_promo_code': 'خطأ في حذف كود الخصم',
    'description': 'الوصف',
    'percentage': 'النسبة المئوية (%)',
    'start_date': 'تاريخ البداية',
    'expiry_date': 'تاريخ الانتهاء',
    'active': 'نشط',
    'expired': 'منتهي الصلاحية',
    'scheduled': 'مجدول',
    'starts': 'يبدأ',
    'expires': 'ينتهي',
    'off': 'خصم',
    'promo_description_placeholder': 'خصم خاص للعملاء الجدد',
    'no_promo_codes_yet': 'لم يتم إنشاء أي أكواد خصم حتى الآن.',
    
    // Feedback
    'customer_feedback': 'تقييمات العملاء',
    'total_reviews': 'إجمالي التقييمات',
    'anonymous': 'مجهول',
    'food_quality': 'جودة الطعام',
    'service_speed': 'سرعة الخدمة',
    'ease_of_ordering': 'سهولة الطلب',
    'overall_satisfaction': 'الرضا العام',
    'like': 'أعجبني',
    'dislike': 'لم يعجبني',
    'comment': 'تعليق',
    'no_feedback_yet': 'لم يتم استلام أي تقييمات حتى الآن.',
    'feedback_deleted': 'تم حذف التقييم بنجاح!',
    'error_deleting_feedback': 'خطأ في حذف التقييم',
    'confirm_delete_feedback': 'هل أنت متأكد أنك تريد حذف هذا التقييم؟',
    
    // Notifications
    'send_notifications': 'إرسال الإشعارات',
    'active_devices': 'الأجهزة النشطة',
    'compose_notification': 'كتابة إشعار',
    'notification_title': 'عنوان الإشعار',
    'notification_body': 'محتوى الإشعار',
    'notification_preview': 'معاينة الإشعار',
    'total_devices': 'إجمالي الأجهزة',
    'platform_breakdown': 'تفصيل المنصات',
    'notification_title_placeholder': 'أدخل عنوان الإشعار...',
    'notification_body_placeholder': 'أدخل محتوى الإشعار...',
    'sending_notification': 'جاري الإرسال...',
    'send_to_devices': 'إرسال إلى {count} أجهزة',
    'notification_sent_success_all': 'تم إرسال جميع {count} الإشعارات بنجاح!',
    'notification_sent_success_partial': 'تم إرسال {success} من {total} إشعارات بنجاح. فشل {failed}.',
    'notification_sent_failed_all': 'فشل في إرسال جميع {count} الإشعارات.',
    'notification_send_error': 'فشل في إرسال الإشعار',
    'notification_form_validation': 'يرجى ملء العنوان والمحتوى',
    'notification_info_message': 'سيتم إرسال إشعارك إلى جميع الأجهزة النشطة. تأكد من أن رسالتك واضحة وجذابة!',
    'no_devices_message': 'لم يتم العثور على أجهزة نشطة. يحتاج المستخدمون إلى تمكين الإشعارات في تطبيق الهاتف المحمول أولاً.',
    'notification_preview_title': 'عنوان الإشعار',
    'notification_preview_body': 'سيظهر محتوى الإشعار هنا...',
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
