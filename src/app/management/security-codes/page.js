'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, UserCheck, Plus, Copy, Check, X, Calendar, User } from 'lucide-react'

export default function SecurityCodesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)
  const [generatingForRole, setGeneratingForRole] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedCodeData, setGeneratedCodeData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Redirect if not management
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'management') {
      router.push('/login')
    }
  }, [session, status, router])

  // Fetch codes
  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/security-codes')
      if (response.ok) {
        const data = await response.json()
        setCodes(data.codes)
      }
    } catch (error) {
      console.error('Error fetching codes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Add delete function
const deleteCode = async (codeId, code) => {
  setCodeToDelete({ id: codeId, code })
  setShowDeleteModal(true)
}

// Confirm delete function
const confirmDelete = async () => {
  if (!codeToDelete) return
  
  setDeleting(true)
  try {
    const response = await fetch(`/api/security-codes/${codeToDelete.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      fetchCodes() // Refresh codes list
      setShowDeleteModal(false)
      setCodeToDelete(null)
    } else {
      const errorData = await response.json()
      alert(`Error: ${errorData.error}`)
    }
  } catch (error) {
    console.error('Error deleting code:', error)
    alert('Failed to delete code. Please try again.')
  } finally {
    setDeleting(false)
  }
}

  useEffect(() => {
    if (session?.user?.role === 'management') {
      fetchCodes()
    }
  }, [session])

  // Generate code for specific role
  const generateCode = async (role) => {
  setGeneratingForRole(role)
  setGenerating(true)
  try {
    const response = await fetch('/api/security-codes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    })

    if (response.ok) {
      const data = await response.json()
      
      // Store the generated code data and show success modal
      setGeneratedCodeData({
        code: data.code.code,
        role: role,
        createdAt: new Date().toLocaleString()
      })
      setShowSuccessModal(true)
      setShowRoleSelector(false)
      
      fetchCodes() // Refresh codes list
    } else {
      const errorData = await response.json()
      alert(`Error: ${errorData.error}`)
    }
  } catch (error) {
    console.error('Error generating code:', error)
    alert('Failed to generate code. Please try again.')
  } finally {
    setGenerating(false)
    setGeneratingForRole('')
  }
}

  // Copy code to clipboard
  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Get role display
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'guard': return 'Security Guard'
      case 'rover': return 'Rover'
      case 'security_supervisor': return 'Security Supervisor'
      default: return role
    }
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'guard': return <UserCheck className="w-4 h-4" />
      case 'rover': return <UserCheck className="w-4 h-4 text-green-600" />
      case 'security_supervisor': return <Shield className="w-4 h-4 text-purple-600" />
      default: return <User className="w-4 h-4" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'management') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Codes</h1>
            <p className="text-gray-600 mt-2">Generate and manage registration security codes</p>
          </div>
          
          <button
            onClick={() => setShowRoleSelector(true)}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Generate Code
          </button>
        </div>

        {/* Enhanced Glassmorphism Role Selector Modal */}
            {showRoleSelector && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-96 max-w-90vw shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-4 duration-300">
            {/* Header with gradient background */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Generate Security Code</h3>
                <p className="text-gray-600">Choose the role for the new security code</p>
            </div>
            
            {/* Role Options with enhanced styling */}
            <div className="space-y-4 mb-8">
                {[
                { 
                    role: 'guard', 
                    name: 'Security Guard', 
                    icon: UserCheck, 
                    gradient: 'from-gray-500 to-gray-600',
                    hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
                    description: 'Fixed position security personnel'
                },
                { 
                    role: 'rover', 
                    name: 'Rover', 
                    icon: UserCheck, 
                    gradient: 'from-green-500 to-green-600',
                    hoverGradient: 'hover:from-green-600 hover:to-green-700',
                    description: 'Mobile patrol security personnel'
                },
                { 
                    role: 'security_supervisor', 
                    name: 'Security Supervisor', 
                    icon: Shield, 
                    gradient: 'from-purple-500 to-purple-600',
                    hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
                    description: 'Security team leadership role'
                }
                ].map(({ role, name, icon: Icon, gradient, hoverGradient, description }) => (
                <button
                    key={role}
                    onClick={() => generateCode(role)}
                    disabled={generating}
                    className={`w-full p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:border-transparent hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group ${hoverGradient}`}
                >
                    <div className="flex items-center gap-4">
                    {/* Icon with gradient background */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-200">
                        {name}
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-200">
                        {description}
                        </p>
                    </div>
                    
                    {/* Loading spinner for the specific role being generated */}
                    {generating && generatingForRole === role && (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    </div>
                </button>
                ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                onClick={() => setShowRoleSelector(false)}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                Cancel
                </button>
            </div>
            
            {/* Loading overlay */}
            {generating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium">Generating code...</p>
                </div>
                </div>
            )}
            </div>
        </div>
        )}

{/* Glassmorphism Success Modal */}
{showSuccessModal && generatedCodeData && (
  <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-96 max-w-90vw shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-4 duration-300">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Code Generated!</h3>
        <p className="text-gray-600">Security code has been created successfully</p>
      </div>
      
      {/* Generated Code Display */}
      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/30">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Code</label>
          <div className="flex items-center justify-center gap-3 mb-4">
            <code className="text-2xl font-bold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/40 tracking-widest">
              {generatedCodeData.code}
            </code>
            <button
              onClick={() => copyCode(generatedCodeData.code)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-white/50 rounded-lg transition-colors"
              title="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Role:</span>
              <p className="font-medium text-gray-900 capitalize">{generatedCodeData.role.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">{generatedCodeData.createdAt}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowSuccessModal(false)
            setGeneratedCodeData(null)
          }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Done
        </button>
        <button
          onClick={() => {
            setShowSuccessModal(false)
            setGeneratedCodeData(null)
            setShowRoleSelector(true)
          }}
          className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium"
        >
          Generate Another
        </button>
      </div>
    </div>
  </div>
)}
{/* Glassmorphism Success Modal */}
{showSuccessModal && generatedCodeData && (
  <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-96 max-w-90vw shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-4 duration-300">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Code Generated!</h3>
        <p className="text-gray-600">Security code has been created successfully</p>
      </div>
      
      {/* Generated Code Display with glassmorphism */}
      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/30 shadow-inner">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Code</label>
          <div className="flex items-center justify-center gap-3 mb-4">
            <code className="text-2xl font-bold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/40 tracking-widest shadow-sm">
              {generatedCodeData.code}
            </code>
            <button
              onClick={() => copyCode(generatedCodeData.code)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/30"
              title="Copy code"
            >
              {copiedCode === generatedCodeData.code ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <span className="text-gray-500 block text-xs uppercase tracking-wide">Role</span>
              <p className="font-medium text-gray-900 capitalize">{generatedCodeData.role.replace('_', ' ')}</p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <span className="text-gray-500 block text-xs uppercase tracking-wide">Created</span>
              <p className="font-medium text-gray-900">{generatedCodeData.createdAt}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions with glassmorphism */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowSuccessModal(false)
            setGeneratedCodeData(null)
          }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          Done
        </button>
        <button
          onClick={() => {
            setShowSuccessModal(false)
            setGeneratedCodeData(null)
            setShowRoleSelector(true)
          }}
          className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium shadow-sm"
        >
          Generate Another
        </button>
      </div>
    </div>
  </div>
)}
{/* Delete Confirmation Modal with glassmorphism */}
{showDeleteModal && codeToDelete && (
  <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-96 max-w-90vw shadow-2xl border border-white/20 transform animate-in slide-in-from-bottom-4 duration-300">
      {/* Warning Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <X className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Security Code</h3>
        <p className="text-gray-600">This action cannot be undone</p>
      </div>
      
      {/* Code to delete */}
      <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-red-200/50">
        <div className="text-center">
          <label className="block text-sm font-medium text-red-700 mb-2">Code to Delete</label>
          <code className="text-lg font-bold text-red-900 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200/50 tracking-wider">
            {codeToDelete.code}
          </code>
        </div>
      </div>
      
      {/* Warning message */}
      <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Deleting this security code will permanently remove it from the system. 
          If someone has this code but hasn't used it yet, they will no longer be able to register.
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowDeleteModal(false)
            setCodeToDelete(null)
          }}
          disabled={deleting}
          className="flex-1 bg-white/70 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium py-3 px-6 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          disabled={deleting}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {deleting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </div>
          ) : (
            'Delete Code'
          )}
        </button>
      </div>
    </div>
  </div>
)}
        {/* Codes List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Generated Codes</h2>
            <p className="text-gray-600">Total: {codes.length} codes</p>
          </div>

          {codes.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No security codes yet</h3>
              <p className="text-gray-600">Generate your first security code to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codes.map((code) => (
                    <tr key={code._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm text-black">
                            {code.code}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(code.role)}
                          <span className="text-sm text-gray-900">{getRoleDisplay(code.role)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          code.isUsed 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {code.isUsed ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(code.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {code.usedBy ? (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            User registered
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    {!code.isUsed && (
      <>
        <button
          onClick={() => copyCode(code.code)}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
          title="Copy code"
        >
          {copiedCode === code.code ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => deleteCode(code._id, code.code)}
          className="text-red-600 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          title="Delete code"
        >
          <X className="w-4 h-4" />
          <span className="text-xs">Delete</span>
        </button>
      </>
    )}
    {code.isUsed && (
      <span className="text-gray-400 text-xs">Code used</span>
    )}
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}