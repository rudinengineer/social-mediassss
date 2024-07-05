import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { statusPost } from "@prisma/client";
import { uploadToCloudinary } from '@/lib/cloudinary'
import { shuffleData } from '@/lib/lib'

export async function GET() {
    const postCount = await prisma.post.count()
    const data = await prisma.post.findMany({
        where: {
            status: 'public'
        },
        // skip: Math.floor(Math.random() * postCount),
        take: 15,
        include: {
            author: true,
            likes: {
                select: {
                    id: true,
                    userId: true,
                    type: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    return NextResponse.json({
        data: shuffleData(data)
    }, { status: 200 })
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const formData = await req.formData()

    const file = formData.get("image") as File
    const fileBuffer = await file.arrayBuffer()

    const mimeType = file.type
    const encoding = "base64"
    const base64Data = Buffer.from(fileBuffer).toString("base64")

    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data

    if ( session?.user?.id ) {
        const user: any = session.user

        const res = await uploadToCloudinary(fileUri)

        if (res.success && res.result) {
            const response = await prisma.post.create({
                data: {
                    caption: formData.get('caption') as string,
                    image: res.result.secure_url,
                    publicImageId: res.result.public_id,
                    status: 'public',
                    userId: Number(user?.id)
                }
            })

            return NextResponse.json(response, { status: 200 })
        } else {
            return NextResponse.json({
                message: 'Failed to upload image'
            }, { status: 500 })
        }
    }
    return NextResponse.json({
        message: 'Unauthorized'
    }, { status: 401 })
}
