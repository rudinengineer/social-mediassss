import { User } from "../user"

export type PostType = {
    id: number,
    userId: number
    caption: string,
    image: string,
    status: string,
    author: User,
    likes: Array<any>,
    _count: {
        comments: number,
    },
    createdAt: string,
    updatedAt: string
}