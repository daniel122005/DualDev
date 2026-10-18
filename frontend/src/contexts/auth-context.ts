import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  register: (nombre: string, correo: string, password: string) => Promise<string | null>
  login: (correo: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
