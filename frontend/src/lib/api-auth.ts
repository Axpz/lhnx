import { api, tokenManager } from './api-client'

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'user' | 'enterprise' | 'admin'

export interface User {
  id: string
  email: string
  user_metadata?: {
    role?: UserRole
    username?: string
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

// Helper to get user role
export function getUserRole(user: User | null): UserRole {
  return user?.user_metadata?.role || 'user'
}

// Helper to get username
export function getUsername(user: User | null): string {
  return user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

export interface AuthResponse {
  user: User
  session: Session
  access_token: string
  refresh_token: string
}

export interface RegisterRequest {
  email: string
  password: string
  data?: {
    role?: UserRole
    username?: string
    [key: string]: any
  }
}

export interface SigninRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  data?: Record<string, any>
}

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Register a new user account
 */
export async function signup(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/signup', data)
  
  // tokenManager.setTokens(response.access_token, response.refresh_token)
  return response
}

/**
 * Login with email and password
 */
export async function signin(data: SigninRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/token', {
    grant_type: 'password',
    email: data.email,
    password: data.password
  })
  
  tokenManager.setTokens(response.access_token, response.refresh_token)
  return response
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken?: string): Promise<AuthResponse> {
  const token = refreshToken || tokenManager.getRefreshToken()
  if (!token) {
    throw new Error('No refresh token available')
  }

  const response = await api.post<AuthResponse>('/auth/token', {
    grant_type: 'refresh_token',
    refresh_token: token
  })
  
  tokenManager.setTokens(response.access_token, response.refresh_token)
  return response
}

/**
 * Logout current session
 */
export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout')
  } finally {
    tokenManager.clearTokens()
  }
}

// ============================================================================
// User Profile API
// ============================================================================

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  const response = await api.get<{ user: User }>('/auth/user')
  return response.user
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateUserRequest): Promise<User> {
  const response = await api.put<{ user: User }>('/auth/user', data)
  return response.user
}