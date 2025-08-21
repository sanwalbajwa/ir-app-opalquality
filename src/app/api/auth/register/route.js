import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { User } from '@/models/User'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, email, password, role, securityCode } = body

    console.log('Registration attempt:', { email, role, securityCode })

    // Validate required fields
    if (!fullName || !email || !password || !role || !securityCode) {
      return NextResponse.json(
        { 
          error: 'All fields are required',
          errorType: 'MISSING_FIELDS'
        },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    const userRoles = db.collection('user_roles')

    // Validate role - check if it's management or a valid dynamic role
    let validRole = false
    let roleDisplayName = role

    if (role === 'management') {
      // Management role is always valid
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
      return NextResponse.json(
        { 
          error: 'Invalid role selected',
          errorType: 'INVALID_ROLE'
        },
        { status: 400 }
      )
    }

    // Validate security code
    const codeDoc = await securityCodes.findOne({ 
      code: securityCode,
      isUsed: false 
    })

    console.log('Security code lookup:', { securityCode, found: !!codeDoc })

    if (!codeDoc) {
      return NextResponse.json(
        { 
          error: 'Invalid or already used security code',
          errorType: 'INVALID_SECURITY_CODE'
        },
        { status: 400 }
      )
    }

    // Validate that security code role matches selected role
    if (codeDoc.role !== role) {
      return NextResponse.json(
        { 
          error: `This security code is for ${codeDoc.role} role, but you selected ${role}`,
          errorType: 'ROLE_MISMATCH'
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Email address is already registered',
          errorType: 'EMAIL_EXISTS'
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role
    })

    console.log('User created:', newUser._id)

    // Mark security code as used
    const updateResult = await securityCodes.updateOne(
      { _id: codeDoc._id },
      {
        $set: {
          isUsed: true,
          usedBy: newUser._id,
          usedAt: new Date()
        }
      }
    )

    console.log('Security code marked as used:', updateResult.modifiedCount)

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        userId: newUser._id,
        roleDisplayName: roleDisplayName
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific User model errors
    if (error.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { 
          error: 'Email address is already registered',
          errorType: 'EMAIL_EXISTS'
        },
        { status: 400 }
      )
    }

    if (error.message === 'EMPLOYEE_ID_EXISTS') {
      return NextResponse.json(
        { 
          error: 'Employee ID is already in use',
          errorType: 'EMPLOYEE_ID_EXISTS'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}