import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/models/UserRole'

export async function GET() {
  try {
    const roles = await UserRole.findAll()
    return Response.json({ roles })
  } catch (error) {
    console.error('Get user roles error:', error)
    return Response.json({ error: 'Failed to fetch user roles' }, { status: 500 })
  }
}

// POST create new user role
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const roleData = await request.json()
    
    // Validate required fields
    if (!roleData.name || !roleData.displayName) {
      return Response.json({ error: 'Name and display name are required' }, { status: 400 })
    }
    
    const role = await UserRole.create(roleData)
    
    return Response.json({
      message: 'User role created successfully',
      role
    })
    
  } catch (error) {
    console.error('Create user role error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE user role
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { roleId } = await request.json()
    
    if (!roleId) {
      return Response.json({ error: 'Role ID is required' }, { status: 400 })
    }
    
    await UserRole.delete(roleId)
    
    return Response.json({ message: 'User role deleted successfully' })
    
  } catch (error) {
    console.error('Delete user role error:', error)
    return Response.json({ error: 'Failed to delete user role' }, { status: 500 })
  }
}