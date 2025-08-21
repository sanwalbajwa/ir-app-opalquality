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
  
  static async delete(id) {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const userRoles = db.collection('user_roles')
    
    // Soft delete
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
}