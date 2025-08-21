import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    
    const codes = await securityCodes
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Get role display names for codes that don't have them
    const userRoles = db.collection('user_roles')
    const dynamicRoles = await userRoles.find({ isActive: true }).toArray()
    
    // Enhance codes with display names if missing
    const enhancedCodes = codes.map(code => {
      if (!code.roleDisplayName) {
        if (code.role === 'management') {
          code.roleDisplayName = 'Management'
        } else {
          const dynamicRole = dynamicRoles.find(r => r.name === code.role)
          code.roleDisplayName = dynamicRole ? dynamicRole.displayName : code.role
        }
      }
      return code
    })

    return NextResponse.json({ codes: enhancedCodes })
  } catch (error) {
    console.error('Error fetching security codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}