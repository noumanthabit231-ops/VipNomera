import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adqhatadlrzmtufndpau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWhhdGFkbHJ6bXR1Zm5kcGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzIzMTMsImV4cCI6MjA5NDg0ODMxM30.8NZt-slovh_d906SNdB0HsBaN_l7d8L5pyuNJ-MrWPE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
