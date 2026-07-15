export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email format'
  return null
}

export function validateName(name: string): string | null {
  if (!name) return 'Name is required'
  if (name.length < 3) return 'Name must be at least 3 characters'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-zA-Z]/.test(password)) return 'Password must include at least one letter'
  if (!/[0-9]/.test(password)) return 'Password must include at least one number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return 'Password must include at least one special character'
  return null
}
