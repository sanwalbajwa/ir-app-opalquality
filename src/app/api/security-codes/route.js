import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'  // CHANGED: Use clientPromise instead
import SecurityCode from '@/models/SecurityCode'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const client = await clientPromise  // CHANGED: Use clientPromise
    const db = client.db('incident-reporting-db')
    const securityCodes = db.collection('security_codes')
    
    const codes = await securityCodes
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Error fetching security codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}