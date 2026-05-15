import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = 'https://vgpophemyygawgnrhzer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncG9waGVteXlnYXdnbnJoemVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTIyMDgsImV4cCI6MjA5MzQyODIwOH0.c3t8fLBVy57RWtF_btz71l49uCrmid0tgiHeFCpfeGs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

window.supabase = supabase;
