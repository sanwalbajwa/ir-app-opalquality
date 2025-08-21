// src/api/management/user-roles/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/models/UserRole'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await UserRole.findAll()
    
    console.log('📋 API: Loaded roles:', roles.length)
    
    return NextResponse.json({ 
      success: true, 
      roles: roles || [] 
    })
  } catch (error) {
    console.error('❌ Error loading user roles:', error)
    return NextResponse.json({ 
      error: 'Failed to load user roles',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Creating role with data:', body)
    
    const { name, displayName, description } = body
    
    if (!name || !displayName) {
      return NextResponse.json({ 
        error: 'Name and display name are required' 
      }, { status: 400 })
    }
    
    const role = await UserRole.create({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      description: description || ''
    })
    
    console.log('✅ Role created:', role._id)
    
    return NextResponse.json({ 
      success: true, 
      role 
    })
  } catch (error) {
    console.error('❌ Error creating user role:', error)
    
    if (error.message === 'Role name already exists') {
      return NextResponse.json({ 
        error: 'A role with this name already exists' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user role',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roleId } = body
    
    if (!roleId) {
      return NextResponse.json({ 
        error: 'Role ID is required' 
      }, { status: 400 })
    }
    
    console.log('🗑️ API: Attempting to delete role:', roleId)
    
    // Check if role can be safely deleted
    const deleteCheck = await UserRole.canDelete(roleId)
    
    if (!deleteCheck.canDelete) {
      console.log('⛔ Cannot delete role:', deleteCheck.reason)
      return NextResponse.json({ 
        error: deleteCheck.reason,
        usersCount: deleteCheck.usersCount,
        roleName: deleteCheck.roleName
      }, { status: 400 })
    }
    
    // Perform hard delete
    const result = await UserRole.hardDelete(roleId)
    
    console.log('✅ Role deleted successfully:', result.message)
    
    return NextResponse.json({ 
      success: true,
      message: result.message,
      deletedRole: result.deletedRole
    })
  } catch (error) {
    console.error('❌ Error deleting user role:', error)
    
    return NextResponse.json({ 
      error: error.message || 'Failed to delete user role'
    }, { status: 500 })
  }
}