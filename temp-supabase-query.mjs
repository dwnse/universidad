import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const env = fs.readFileSync('.env','utf8').split(/\r?\n/).reduce((acc,line)=>{const [k,v]=line.split('='); if(k) acc[k]=v; return acc},{});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const { data, error } = await supabase.from('profiles').select('id, full_name, email, role').limit(20)
console.log(JSON.stringify({ error, data }, null, 2))
