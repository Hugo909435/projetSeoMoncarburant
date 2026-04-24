import Image from 'next/image'
import type { Author } from '@/types'
import { getStrapiMediaUrl } from '@/lib/strapi'

interface Props {
  author: Author
}

export default function AuthorBlock({ author }: Props) {
  const { name, bio, avatar } = author.attributes
  const avatarUrl = avatar?.data?.attributes?.url
    ? getStrapiMediaUrl(avatar.data.attributes.url)
    : null

  return (
    <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-6">
      {avatarUrl ? (
        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <span className="text-gray-500 text-xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          À propos de l'auteur
        </p>
        <p className="font-semibold text-gray-900">{name}</p>
        {bio && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{bio}</p>}
      </div>
    </div>
  )
}
