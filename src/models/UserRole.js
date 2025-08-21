import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export class UserRole {
  static async create(roleData) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    // Check if role name already exists
    const existingRole = await userRoles.findOne({ 
      name: roleData.name.toLowerCase() 
    })
    if (existingRole) {
      throw new Error('Role name already exists')
    }
    
    const newRole = {
      name: roleData.name,
      displayName: roleData.displayName,
      description: roleData.description,
      permissions: roleData.permissions || ['guard_basic'], // Default guard permissions
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await userRoles.insertOne(newRole)
    return { _id: result.insertedId, ...newRole }
  }
  
  static async findAll() {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles
      .find({ isActive: true })
      .sort({ displayName: 1 })
      .toArray()
  }
  
  static async findById(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles.findOne({ _id: new ObjectId(id) })
  }
  
  static async update(id, updateData) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    )
  }
  
  // UPDATED: Soft delete (existing method - keep for safety)
  static async softDelete(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false, 
          deletedAt: new Date() 
        } 
      }
    )
  }
  
  // NEW: Hard delete - completely removes from database
  static async hardDelete(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    const users = db.collection('users')
    
    console.log('🗑️ Starting hard delete for role ID:', id)
    
    // First, check if any users are currently using this role
    const usersWithRole = await users.find({ role: { $exists: true } }).toArray()
    const roleToDelete = await userRoles.findOne({ _id: new ObjectId(id) })
    
    if (!roleToDelete) {
      throw new Error('Role not found')
    }
    
    console.log('🔍 Found role to delete:', roleToDelete.name)
    
    // Check if any users have this role
    const usersUsingRole = usersWithRole.filter(user => user.role === roleToDelete.name)
    
    if (usersUsingRole.length > 0) {
      console.log('⚠️ Found users using this role:', usersUsingRole.length)
      throw new Error(`Cannot delete role "${roleToDelete.displayName}". ${usersUsingRole.length} user(s) are currently assigned this role. Please reassign or delete those users first.`)
    }
    
    console.log('✅ No users found using this role, proceeding with deletion')
    
    // Perform the hard delete
    const result = await userRoles.deleteOne({ _id: new ObjectId(id) })
    
    console.log('🗑️ Delete result:', {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount
    })
    
    if (result.deletedCount === 0) {
      throw new Error('Failed to delete role from database')
    }
    
    return {
      success: true,
      message: `Role "${roleToDelete.displayName}" has been permanently deleted from the database`,
      deletedRole: roleToDelete
    }
  }
  
  // NEW: Check if role is safe to delete
  static async canDelete(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    const users = db.collection('users')
    
    const role = await userRoles.findOne({ _id: new ObjectId(id) })
    if (!role) {
      return { canDelete: false, reason: 'Role not found' }
    }
    
    // Check if any users have this role
    const usersWithRole = await users.countDocuments({ role: role.name })
    
    return {
      canDelete: usersWithRole === 0,
      reason: usersWithRole > 0 ? `${usersWithRole} user(s) are assigned this role` : null,
      usersCount: usersWithRole,
      roleName: role.displayName
    }
  }
  
  // NEW: Get all roles including soft-deleted ones (for admin purposes)
  static async findAllIncludingDeleted() {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles
      .find({})
      .sort({ displayName: 1 })
      .toArray()
  }
  
  // NEW: Restore a soft-deleted role
  static async restore(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    return await userRoles.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date()
        },
        $unset: {
          deletedAt: ""
        }
      }
    )
  }
  
  // UPDATED: Default delete method now does hard delete
  static async delete(id) {
    return await this.hardDelete(id)
  }
}