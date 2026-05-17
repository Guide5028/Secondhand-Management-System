import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://sbehqydhgrpgqmqnfpkh.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZWhxeWRoZ3JwZ3FtcW5mcGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY3MDAsImV4cCI6MjA5NDU4MjcwMH0.04Kb2xmVYeyrAKwjFXXTyb7d4bb8Xf3GgavLGFNP6xo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
