'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/appwrite-service'
import { UserService } from '@/lib/appwrite-service'
import { UserProfile } from '@/types'
import toast from 'react-hot-toast'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        // Prevent multiple simultaneous auth checks
        if (hasChecked) return
        
        // Check if user is already authenticated in store
        if (isAuthenticated && user) {
          if (isMounted) {
            setIsLoading(false)
            setHasChecked(true)
          }
          return
        }

        // Check if there's an active Appwrite session
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser && isMounted) {
          try {
            // User has an active session, get their profile and update store
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
            setIsLoading(false)
            setHasChecked(true)
            return
          } catch (profileError) {
            console.error('Error getting user profile:', profileError)
            // Continue with auth check even if profile fetch fails
          }
        }

        // No active session or profile fetch failed
        if (isMounted) {
          if (requireAuth) {
            // Only redirect if we haven't already checked and user is not authenticated
            if (!hasChecked) {
              setHasChecked(true)
              setIsLoading(false)
              // Use router.push instead of window.location to prevent loops
              window.location.href = redirectTo
            }
          } else {
            setIsLoading(false)
            setHasChecked(true)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        
        if (isMounted) {
          if (requireAuth) {
            // Only redirect on error if we haven't already checked
            if (!hasChecked) {
              setHasChecked(true)
              setIsLoading(false)
              window.location.href = redirectTo
            }
          } else {
            setIsLoading(false)
            setHasChecked(true)
          }
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user, requireAuth, redirectTo, setUser, hasChecked])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If authentication is not required and user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    // Prevent redirect loops by checking if we're already on the right page
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard'
    }
    return null
  }

  // Render children if authentication requirements are met
  return <>{children}</>
} 