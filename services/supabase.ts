
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables! Check your .env.local file.');
} else {
    if (!supabaseUrl.startsWith('https://')) {
        console.error('Supabase URL is missing "https://". Please ensure it looks like: https://your-project.supabase.co');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
