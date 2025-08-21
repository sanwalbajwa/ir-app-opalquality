import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Generate random security code
function generateSecurityCode(role) {
  const prefix = 'IR'
  const rolePart = role.substring(0, 3).toUpperCase() // First 3 chars of role
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const specialChars = '#@'
  
  return `${prefix}${rolePart}${randomNum}${specialChars}`
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { role } = await request.json()
    
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    const userRoles = db.collection('user_roles')
    
    // Validate role - check if it's management or a valid dynamic role
    let validRole = false
    let roleDisplayName = role

    if (role === 'management') {
      validRole = true
      roleDisplayName = 'Management'
    } else {
      // Check if it's a valid dynamic role
      const dynamicRole = await userRoles.findOne({ 
        name: role.toLowerCase(),
        isActive: true 
      })
      
      if (dynamicRole) {
        validRole = true
        roleDisplayName = dynamicRole.displayName
      }
    }

    if (!validRole) {
      return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 })
    }
    
    // Generate unique code
    let code
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      code = generateSecurityCode(role)
      const existingCode = await securityCodes.findOne({ code })
      if (!existingCode) {
        isUnique = true
      }
      attempts++
    }
    
    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
    }

    // Save the code
    const securityCode = {
      code,
      role,
      roleDisplayName, // Store display name for easier reference
      isUsed: false,
      usedBy: null,
      createdBy: new ObjectId(session.user.id),
      createdAt: new Date(),
      usedAt: null
    }
    
    const result = await securityCodes.insertOne(securityCode)

    return NextResponse.json({ 
      message: 'Security code generated successfully',
      code: { _id: result.insertedId, ...securityCode }
    })
  } catch (error) {
    console.error('Error generating security code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}