import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SB_XURL;
const supabaseAnonKEY = import.meta.env.VITE_SB_XANON_KEY;

export const supabase = createClient(supabaseURL, supabaseAnonKEY);
