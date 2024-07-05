import { User } from "../user"

export type CommentType = {
    id: number,
    userId: number,
    postId: number,
    replayId: number | null,
    image: string | null,
    publicId: string | null,
    comment: string,
    user: User
    createdAt: string,
    updatedAt: string
}