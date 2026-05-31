import { supabase } from './supabase'
import type { Profile } from './types'

export const AuthModel = {
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getProfile(userId: string) {
    console.log('Fetching profile for user:', userId)
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Supabase error fetching profile:', error)
      throw error
    }
    
    if (data) {
      // Synthesize full_name for the UI
      (data as any).full_name = `${data.nombres} ${data.apellidos}`
    }
    
    return data as Profile | null
  },

  async createProfile(profile: any) {
    console.log('Creating/Upserting profile for user:', profile.id, profile)
    
    // Map internal fields to DB columns
    const dbProfile = {
      id: profile.id,
      email: profile.email,
      nombres: profile.nombres,
      apellidos: profile.apellidos,
      rol: profile.rol,
      password_hash: 'managed_by_supabase_auth'
    }

    // First check if a profile with this email already exists but has a different ID
    // (Happens if created via Dashboard first)
    const { data: existingByEmail } = await supabase
      .from('usuarios')
      .select('id, rol, nombres, apellidos')
      .eq('email', profile.email)
      .maybeSingle()

    if (existingByEmail && existingByEmail.id !== profile.id) {
      console.log('Email exists with different ID, updating ID to match Auth...')
      // Preserve the original role and names from the dashboard-created profile
      dbProfile.rol = existingByEmail.rol
      dbProfile.nombres = existingByEmail.nombres
      dbProfile.apellidos = existingByEmail.apellidos
      
      // Delete the old record to allow the new one with correct Auth ID
      await supabase.from('usuarios').delete().eq('id', existingByEmail.id)
    }

    const { data, error } = await supabase
      .from('usuarios')
      .upsert([dbProfile], { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      console.error('Supabase error in createProfile:', JSON.stringify(error, null, 2))
      throw error
    }
    
    if (data) {
      // Ensure docente/estudiante records exist for this new ID
      if (data.rol === 'DOCENTE') {
        await supabase.from('docentes').upsert({ usuario_id: data.id, activo: true }, { onConflict: 'usuario_id' })
      } else if (data.rol === 'ESTUDIANTE') {
        await supabase.from('estudiantes').upsert({ 
          usuario_id: data.id, 
          registro_universitario: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          activo: true 
        }, { onConflict: 'usuario_id' })
      }
      (data as any).full_name = `${data.nombres} ${data.apellidos}`
    }
    
    return data as Profile
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async logSystemAction(userId: string, action: string) {
    try {
      // Intentamos obtener la IP pública de forma sencilla
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null)
      const ipData = ipResponse ? await ipResponse.json() : { ip: 'Unknown' }
      
      await supabase.from('logs_sistema').insert({
        usuario_id: userId,
        accion: action,
        ip_address: ipData.ip,
        created_at: new Date().toISOString()
      })
    } catch (e) {
      console.error('Error logging system action:', e)
    }
  }
}
