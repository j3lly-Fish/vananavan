'use server'

import { signIn } from '@/auth'
import { db } from '@/db'
import { users, profiles } from '@/db/schema'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) return

        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    redirect('/login?error=Invalid credentials')
                default:
                    redirect('/login?error=Something went wrong')
            }
        }
        throw error
    }
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    // Default to parent if not specified, though form should provide it
    const role = (formData.get('role') as 'driver' | 'parent') || 'parent'

    if (!email || !password || !firstName || !lastName) {
        redirect('/register?error=Missing fields')
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
        redirect('/register?error=Email already registered')
    }

    const hashedPassword = await hash(password, 10)

    try {
        // Transactional insert would be ideal but Drizzle-Postgres-JS transaction support 
        // depends on the driver setup. We'll do sequential for now.

        // 1. Create User
        const [newUser] = await db.insert(users).values({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: role,
        }).returning()

        // 2. Create Profile
        await db.insert(profiles).values({
            id: newUser.id,
            email: newUser.email,
            firstName,
            lastName,
            role: role,
        })

    } catch (err) {
        console.error('Registration failed:', err)
        redirect('/register?error=Registration failed')
    }

    // Auto login or redirect to login
    redirect('/login?message=Account created. Please log in.')
}
