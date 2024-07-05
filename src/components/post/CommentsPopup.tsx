import React from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Axios, axiosData } from '@/lib/axios'
import { useStore } from '@/lib/store'
import Image from 'next/image'
import Spinner from '../loading/Spinner'
import { ToastErr } from '@/lib/alert'
import UserProfile from '../puzzle/UserProfile'
import { CommentType } from '@/app/types/comment'

type Props = {
    postId: number | null,
    setShowComment: React.Dispatch<React.SetStateAction<number | null>>
}

export default function CommentsPopup({postId, setShowComment}: Props) {
  const { setBottombar } = useStore()
  const [comments, setComments] = React.useState<Array<CommentType>>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [loadingBtn, setLoadingBtn] = React.useState<boolean>(false)
  const [imgPrev, setImgPrev] = React.useState<Blob|null>(null)

  React.useEffect(() => {
    async function fetch() {
        try {
            const response = await Axios.get('/post/comment?id=' + postId)
            const data = await response.data
            if ( data?.data ) {
                setComments(data?.data)
            }
        } finally {
            setLoading(false)
        }
    }
    fetch()
  }, [postId])

  const handleImageComment = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setImgPrev(e.target.files[0]);
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoadingBtn(true)

    const formData = new FormData(e.target)
    formData.set('postId', String(postId))
    
    try {
        const response = await axiosData.post('/post/comment', formData)
        const data = await response.data
        if ( data?.success ) {
            setComments(state => [data?.data, ...state])
        } else {
            ToastErr('Gagal mengirim komentar')
        }
    } catch {
        ToastErr('Gagal mengirim komentar')
    } finally {
        setLoadingBtn(false)
    }
  }

  return (
    <div className="w-full h-full sm:p-4 sm:pb-0 absolute top-0 left-0 z-[45] overflow-hidden">
        <div className="w-full h-full sticky">
            <div className="w-full h-[90%] border-t-[1px] border-slate-300 absolute bottom-0 left-0 rounded-tl-2xl rounded-tr-2xl bg-light dark:bg-dark">
                <div className="w-full h-full sm:h-[87%] sticky p-4">
                    <div className="w-full mb-4 flex-center">
                        <h1 className='font-semibold sm:text-base'>{loading ? 0 : comments?.length} Komentar</h1>
                    </div>
                    {
                        loading ? (
                            <div className="flex-center">
                                <h1>Loading...</h1>
                            </div>
                        ) : (
                            <div className='hidden-scrollbar w-full h-full pb-8 overflow-y-auto'>
                                {
                                    comments?.length ? (
                                        <div className="w-full">
                                            {
                                                comments?.map((value, index: number) => (
                                                    <div key={index} className='mb-4 flex gap-2'>
                                                        <div className="w-10 h-10"><UserProfile image={value?.user.image} /></div>
                                                        <div>
                                                            <div className="flex gap-1">
                                                                <h1 className='text-base text-limit-1 font-semibold'>{ value?.user.username }</h1>
                                                                <span className="text-xs"></span>
                                                            </div>
                                                            <pre className="sm:text-base font-['Poppins'] whitespace-pre-wrap">{ value.comment }</pre>
                                                            {
                                                                value.image && (
                                                                    <Image src={value.image} alt='Image' width={100} height={100} className='my-0.5 aspect-square object-cover object-center rounded-md' />
                                                                )
                                                            }
                                                            <div className='flex gap-2 items-center'>
                                                                <button type='button'>Balas</button>
                                                                <button type='button'>1 <span className='text-xss'>balasan</span></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <div className='flex-center'>
                                            <h1>Belum ada yang berkomentar</h1>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                    <button className='absolute right-3 top-3' onClick={() => {setBottombar(true);setShowComment(null)}}><XMarkIcon className='icon-size icon' /></button>
                </div>
                <form onSubmit={handleSubmit} className="w-full bg-light dark:bg-dark sm:h-[13%] fixed sm:relative bottom-0 left-0 z-[46] border-t-[1px] border-slate-300">
                    <div className='w-full h-full flex-between-center gap-1 p-2 sticky'>
                        {
                            imgPrev && (
                                <div className="absolute -top-[165%] bg-light dark:bg-dark border-[1px] border-slate-300 p-1 rounded-md">
                                    <div className="w-full h-full sticky">
                                        <button type='button' className='absolute -top-3 -right-3' onClick={() => {setImgPrev(null)}}><XMarkIcon className='bg-primary bg-opacity-80 p-1 rounded-full text-light size-6' title='hapus' /></button>
                                        <Image src={URL.createObjectURL(imgPrev)} alt='Preview' width={100} height={100} className='w-20 h-20 aspect-square' />
                                    </div>
                                </div>
                            )
                        }
                        <div className='w-full sticky flex items-center'>
                            <textarea name='comment' className='hidden-scrollbar input-default resize-none w-full px-2 py-2.5 rounded-md' rows={1} placeholder='Tulis komentar'></textarea>
                            <div className='absolute right-2 z-[20]'>
                                <label htmlFor='imagePreviewComment'><PhotoIcon className='icon-size icon cursor-pointer' /></label>
                                <input type='file' name='image' accept='image/*' hidden id='imagePreviewComment' onChange={handleImageComment} />
                            </div>
                        </div>
                        <button type='submit' className='flex-center px-4 py-2.5 button border-[1px] border-primary rounded-md'>{ loadingBtn ? (<Spinner />) : 'Kirim' }</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}