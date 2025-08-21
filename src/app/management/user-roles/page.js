'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ArrowLeft,
  Users,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield,
  UserCheck
} from 'lucide-react'

export default function UserRolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'management') {
      router.push('/login')
      return
    }
    
    loadRoles()
  }, [session, status, router])

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/management/user-roles')
      const data = await response.json()
      if (response.ok) {
        setRoles(data.roles)
      }
    } catch (error) {
      console.error('Error loading roles:', error)
    }
    setLoading(false)
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    // Generate the name from displayName if not provided
    const roleName = formData.displayName.toLowerCase().replace(/\s+/g, '_')
    
    const response = await fetch('/api/management/user-roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: roleName,
        displayName: formData.displayName,
        description: formData.description
      })
    })

    if (response.ok) {
      setShowModal(false)
      setFormData({ name: '', displayName: '', description: '' })
      loadRoles()
      alert('Role created successfully!')
    } else {
      const data = await response.json()
      alert(`Error: ${data.error}`)
    }
  } catch (error) {
    alert('Network error occurred')
  }
  setLoading(false)
}

  const handleDelete = async (roleId, roleName) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) return

    try {
      const response = await fetch('/api/management/user-roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      })

      if (response.ok) {
        loadRoles()
        alert('Role deleted successfully!')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading user roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <button
          onClick={() => router.push('/management-dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-200 border border-white/20 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="w-8 h-8 text-blue-600" />
              <Users className="w-8 h-8 text-purple-600" />
              User Roles Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage dynamic user roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Role
          </button>
        </div>

        {/* Roles List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <h2 className="text-xl font-bold text-gray-900">Current Roles ({roles.length + 1})</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Management Role (Fixed) */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-blue-900">Management</h3>
                  <p className="text-blue-700 text-sm">System administrator role</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                System Role
              </span>
            </div>

            {/* Dynamic Roles */}
            {roles.map((role) => (
              <div key={role._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">{role.displayName}</h3>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(role._id, role.displayName)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {roles.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Dynamic Roles</h3>
                <p className="text-gray-600">Create your first dynamic user role to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for adding new role */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New User Role</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Security Guard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Role description..."
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold"
                  >
                    {loading ? 'Creating...' : 'Create Role'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}