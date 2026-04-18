import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inlksftwkjuiulmrhyso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtzZnR3a2p1aXVsbXJoeXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTkzNzAsImV4cCI6MjA5MjA5NTM3MH0.h-ss-1Bt_F2TGYtfSojERNEMypgVNO7NycTgTHKbTL0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
