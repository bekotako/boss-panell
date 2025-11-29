import { createClient } from '@supabase/supabase-js';

// Eğer Vercel anahtarları okuyamazsa boş string yerine 'placeholder' kullan
// Bu sayede "supabaseKey is required" hatası almayız ve build tamamlanır.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);