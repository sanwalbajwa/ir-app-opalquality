'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Shield, UserCheck, Crown } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    securityCode: '' // Added security code field
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [availableRoles, setAvailableRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)



  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Add this useEffect to load dynamic roles
useEffect(() => {
  const loadRoles = async () => {
    try {
      setRolesLoading(true)
      const response = await fetch('/api/management/user-roles')
      const data = await response.json()
      
      console.log('Loaded roles:', data) // Debug log
      
      if (response.ok && data.roles) {
        setAvailableRoles(data.roles)
        console.log('Available roles set:', data.roles) // Debug log
      } else {
        console.error('Failed to load roles:', data)
        setAvailableRoles([])
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      setAvailableRoles([])
    } finally {
      setRolesLoading(false)
    }
  }
  
  loadRoles()
}, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }
    
    // Security code validation
    if (!formData.securityCode.trim()) {
      newErrors.securityCode = 'Security code is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFieldErrorStyle = (fieldName) => {
    return errors[fieldName] 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setSubmitStatus(null)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error types
        if (data.errorType === 'EMAIL_EXISTS') {
          setErrors({ email: 'This email address is already registered' })
        } else if (data.errorType === 'EMPLOYEE_ID_EXISTS') {
          setErrors({ employeeId: 'This employee ID is already in use' })
        } else if (data.errorType === 'INVALID_SECURITY_CODE') {
          setErrors({ securityCode: 'Invalid or already used security code' })
        } else if (data.errorType === 'ROLE_MISMATCH') {
          setErrors({ securityCode: data.error })
        } else {
          setSubmitStatus({
            type: 'error',
            message: data.error || 'Registration failed. Please try again.'
          })
        }
        return
      }
      
      // Success
      setSubmitStatus({
        type: 'success',
        message: 'Registration successful! Redirecting to login...'
      })
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?message=Registration successful! Please log in.')
      }, 2000)
      
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'guard':
        return <UserCheck className="w-5 h-5 text-gray-600" />
      case 'rover':
        return <UserCheck className="w-5 h-5 text-green-600" />
      case 'management':
        return <Crown className="w-5 h-5 text-blue-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  const getRoleDescription = (role) => {
    switch (role) {
      case 'guard':
        return 'Security personnel for fixed positions'
      case 'rover':
        return 'Mobile security personnel for patrols'
      case 'management':
        return 'Administrative and oversight roles'
      default:
        return ''
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our security team</p>
          </div>

          {/* Status Messages */}
          {submitStatus && (
            <div className={`p-4 rounded-xl border ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${getFieldErrorStyle('fullName')}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${getFieldErrorStyle('email')}`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 pr-12 ${getFieldErrorStyle('password')}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 pr-12 ${getFieldErrorStyle('confirmPassword')}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={rolesLoading}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${getFieldErrorStyle('role')} ${rolesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {rolesLoading ? 'Loading roles...' : 'Select Your Role'}
                </option>
                <option value="management">Management</option>
                {availableRoles.length > 0 && availableRoles.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.displayName}
                  </option>
                ))}
              </select>
              
              {/* Debug info - remove this after testing */}
              {!rolesLoading && (
                <div className="text-xs text-gray-500 mt-1">
                  Debug: Found {availableRoles.length} dynamic roles
                </div>
              )}
              
              {errors.role && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.role}
                </p>
              )}
              
              {/* Role Description */}
              {formData.role && formData.role !== 'management' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    {getRoleIcon(formData.role)}
                    <span className="font-medium text-gray-700 capitalize">
                      {availableRoles.find(r => r.name === formData.role)?.displayName || formData.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {availableRoles.find(r => r.name === formData.role)?.description || getRoleDescription(formData.role)}
                  </p>
                </div>
              )}
              
              {formData.role === 'management' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    {getRoleIcon(formData.role)}
                    <span className="font-medium text-gray-700">Management</span>
                  </div>
                  <p className="text-sm text-gray-600">Administrative and oversight roles</p>
                </div>
              )}
            </div>
            {/* Security Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Code *
              </label>
              <input
                type="text"
                name="securityCode"
                value={formData.securityCode}
                onChange={handleChange}
                required
                placeholder="Enter security code provided by admin"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${getFieldErrorStyle('securityCode')}`}
              />
              {errors.securityCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.securityCode}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Contact your administrator to get a security code for registration
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}