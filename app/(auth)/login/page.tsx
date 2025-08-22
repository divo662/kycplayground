'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService, UserService } from '@/lib/appwrite-service'
import { loginSchema } from '@/lib/validations'
import { UserProfile } from '@/types'
import AuthGuard from '@/components/auth-guard'
import toast from 'react-hot-toast'

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <LoginContent />
    </AuthGuard>
  )
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  
  const { user, isAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    const checkAuthStatus = async () => {
      try {
        // Prevent multiple auth checks
        if (hasCheckedAuth) return

        // Check if user is already authenticated in store
        if (isAuthenticated && user) {
          if (isMounted) {
            setHasCheckedAuth(true)
            setPageLoading(false)
            // Redirect to dashboard if already logged in
            window.location.href = '/dashboard'
          }
          return
        }

        // Check if there's an existing Appwrite session
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser && isMounted) {
          try {
            // User has an active session, get their profile and redirect
            const userProfile = await UserService.getUserProfile(currentUser.$id) as UserProfile | null
            
            const userData = {
              $id: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
              role: userProfile?.role || 'user',
              status: userProfile?.status || 'active',
              company: userProfile?.company,
              phone: userProfile?.phone,
              country: userProfile?.country,
              plan: userProfile?.plan || 'free',
              apiUsage: userProfile?.apiUsage,
              createdAt: new Date(currentUser.$createdAt),
              updatedAt: new Date(currentUser.$updatedAt),
            }

            setUser(userData)
            setHasCheckedAuth(true)
            setPageLoading(false)
            toast.success('Welcome back!')
            window.location.href = '/dashboard'
            return
          } catch (profileError) {
            console.error('Error getting user profile:', profileError)
            // Continue even if profile fetch fails
          }
        }

        // No existing session found, show login form
        if (isMounted) {
          setHasCheckedAuth(true)
          setPageLoading(false)
        }
      } catch (error) {
        console.log('No existing session found, showing login form')
        if (isMounted) {
          setHasCheckedAuth(true)
          setPageLoading(false)
        }
      }
    }

    checkAuthStatus()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user, setUser, hasCheckedAuth])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Sign in with Appwrite
      const signInResult = await AuthService.signIn(data.email, data.password)
      
      let user: any
      
      // Handle different session types
      if (signInResult.session === 'existing') {
        // User already had an active session
        user = signInResult.user
        toast.success('Welcome back!')
      } else {
        // New session created, get current user
        user = await AuthService.getCurrentUser()
        if (!user) {
          throw new Error('Failed to get user information')
        }
        toast.success('Successfully logged in!')
      }

      // Get user profile from database
      const userProfile = await UserService.getUserProfile(user.$id) as UserProfile | null
      
      const userData = {
        $id: user.$id,
        email: user.email,
        name: user.name,
        role: userProfile?.role || 'user',
        status: userProfile?.status || 'active',
        company: userProfile?.company,
        phone: userProfile?.phone,
        country: userProfile?.country,
        plan: userProfile?.plan || 'free',
        apiUsage: userProfile?.apiUsage,
        createdAt: new Date(user.$createdAt),
        updatedAt: new Date(user.$updatedAt),
      }

      setUser(userData)
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific Appwrite errors
      if (error.code === 401 && error.type === 'user_session_already_exists') {
        // User already has a session, try to get current user and redirect
        try {
          const currentUser = await AuthService.getCurrentUser()
          if (currentUser) {
            const userProfile = await UserService.getUserProfile(currentUser.$id) as UserProfile | null
            
            const userData = {
              $id: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name,
              role: userProfile?.role || 'user',
              status: userProfile?.status || 'active',
              company: userProfile?.company,
              phone: userProfile?.phone,
              country: userProfile?.country,
              plan: userProfile?.plan || 'free',
              apiUsage: userProfile?.apiUsage,
              createdAt: new Date(currentUser.$createdAt),
              updatedAt: new Date(currentUser.$updatedAt),
            }

            setUser(userData)
            toast.success('Welcome back!')
            window.location.href = '/dashboard'
            return
          }
        } catch (profileError) {
          console.error('Error getting user profile:', profileError)
        }
        
        setError('You are already logged in. Redirecting to dashboard...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setError(error.message || 'Invalid email or password')
        toast.error('Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Shield className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">KYCPlayground</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 space-y-3">
            <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Continue with Google
            </button>
            <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Continue with GitHub
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a mock service for testing purposes only
          </p>
        </div>
      </div>
    </div>
  )
} 