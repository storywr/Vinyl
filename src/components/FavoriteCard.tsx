import { Rating } from "@mui/material";
import { Card, Inset } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from "react";
import { api } from "~/utils/api";
import StarIcon from '@mui/icons-material/Star';

export type Favorite = {
  id: string
  albumId: string
  value: number
  createdAt: Date
  updatedAt: Date
  album: {
    id: string
    name: string
    artists: {
      name: string
    }[]
    images: {
      url: string
    }[]
    external_urls: {
      spotify: string
    }
  }
}

export const FavoriteCard = ({ favorite }: { favorite: Favorite }) => {
  const [rating, setRating] = useState(favorite?.value);

  const { mutate } = api.ratings.update.useMutation({
    onSuccess: () => {
      console.log('success');
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const handleSetRating = (_e: ChangeEvent, newValue: number) => {
    setRating(newValue);
    mutate({ id: favorite.id, albumId: favorite.albumId, value: newValue });
  }

  const { album } = favorite

  return (
    <Card className='flex flex-col items-center justify-center bg-slate-900 my-auto max-w-[640px]'>
      <Inset className='rounded-b-none'>
        <a href={album.external_urls.spotify} target='_blank'>
          <img className='object-cover' src={album?.images[0]?.url} />
        </a>
      </Inset>
      <div className="flex flex-row justify-between w-full p-2 gap-4 items-start mt-4">
        <div className='flex flex-col items-start gap-1'>
          <h1 className='text-[#EDEEF0] text-md md:text-lg font-extrabold'>{album.name}</h1>
          <h2 className='text-[#EDEEF0] text-md md:text-lg font-extralight'>{album.artists[0]?.name}</h2>
        </div>
        <div>
          <Rating
            emptyIcon={<StarIcon color='primary' style={{ opacity: 0.40 }}
            fontSize="inherit" />}
            size='large'
            value={rating}
            // @ts-ignore newValue exists
            onChange={handleSetRating}
          />
        </div>
      </div>
    </Card>
  )
}
