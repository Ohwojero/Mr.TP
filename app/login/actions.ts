
'use server'

import { db } from '@/lib/db'
import { compare } from 'bcrypt'

export async function authenticateUser(email: string, password: string) {
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

    if (!user) return null

    const isValid = await compare(password, user.password)
    if (!isValid) return null

    const { password: _, ...safeUser } = user
    return safeUser
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}