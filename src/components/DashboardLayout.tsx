
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Bell, User, Search, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: t('menu_items'), href: '/menu-items', icon: Home },
    { name: t('promo_codes'), href: '/promo-codes', icon: Search },
    { name: t('feedback'), href: '/feedback', icon: User },
    { name: t('notifications'), href: '/notifications', icon: Bell },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const NavContent = () => (
    <nav className="flex flex-col space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-orange-100 text-orange-900 border-r-4 border-orange-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              language === 'ar' && 'flex-row-reverse text-right'
            )}
          >
            <Icon className={cn("h-5 w-5", language === 'ar' ? 'ml-3' : 'mr-3')} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">{t('dashboard_title')}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </Button>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-64">
                <div className="py-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0",
          language === 'ar' ? 'lg:right-0' : 'lg:left-0'
        )}>
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">{t('dashboard_title')}</h1>
              <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                <Globe className="h-4 w-4 mr-1" />
                {language.toUpperCase()}
              </Button>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <NavContent />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={cn(
          "lg:flex lg:flex-col lg:flex-1",
          language === 'ar' ? 'lg:pr-64' : 'lg:pl-64'
        )}>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
