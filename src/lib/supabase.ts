
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bklaalgiadeapphjlpra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbGFhbGdpYWRlYXBwaGpscHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDk5NDYsImV4cCI6MjA2NTAyNTk0Nn0.8Nhtv0krtfJfYCuiNgrceGzCyxe4JOaG25RMo2tpmuU';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on your database schema
export interface MenuItem {
  id: string;
  created_at: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  meal_type: string;
  sizes: any;
  extras: any;
  beverages: any;
  food_picture: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: string;
  percentage: number;
  starts_at: string;
  expires_at: string;
  usage_limit: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating1: number;
  rating2: number;
  rating3: number;
  comment: string;
  created_at: string;
  phone_number: string;
  overall_rate: number;
}

export interface NotificationToken {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  created_at: string;
}

export interface User {
  id: string;
  created_at: string;
  email: string;
  name: string;
  phone_number: string;
  city: string;
  location: string;
  user_type: string;
}
