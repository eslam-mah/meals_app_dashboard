
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import MenuItemsPage from '../components/MenuItemsPage';
import PromoCodesPage from '../components/PromoCodesPage';
import FeedbackPage from '../components/FeedbackPage';
import NotificationsPage from '../components/NotificationsPage';

const Index = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/menu-items" replace />} />
        <Route path="/menu-items" element={<MenuItemsPage />} />
        <Route path="/promo-codes" element={<PromoCodesPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Index;
