import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'management') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')

    // Check if code exists and is not used
    const codeDoc = await securityCodes.findOne({ _id: new ObjectId(id) })
    
    if (!codeDoc) {
      return NextResponse.json({ error: 'Security code not found' }, { status: 404 })
    }

    if (codeDoc.isUsed) {
      return NextResponse.json({ error: 'Cannot delete used security code' }, { status: 400 })
    }

    // Delete the code
    const result = await securityCodes.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete security code' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Security code deleted successfully' })
  } catch (error) {
    console.error('Error deleting security code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}