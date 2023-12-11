import { Rating, Skeleton } from "@mui/material";
import { Card, Inset } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from "react";
import { api } from "~/utils/api";
import StarIcon from '@mui/icons-material/Star';
import { useQuery } from "@tanstack/react-query";
import SkeletonCarousel from "./SkeletonCarousel";

const fetchAlbum = async (albumId: string, access_token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch album');
  }
  return response.json();
};

export const FavoriteCard = ({ access_token, albumId, id }: { access_token: string, albumId: string, id: string }) => {
  const { data, isLoading } = api.ratings.get.useQuery({ id: albumId });
  const [rating, setRating] = useState(0);
  const {
    data: album,
    isLoading: isLoadingAlbum,
    isError: isErrorAlbum,
  } = useQuery({
    queryKey: ['album', albumId],
    queryFn: () => fetchAlbum(albumId, access_token),
  })

  useEffect(() => {
    if (!data?.value) return
    setRating(data?.value);
  }, [data?.value]);

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
    mutate({ id, albumId: albumId, value: newValue });
  }

  if (!album) return null

  return (
    isLoadingAlbum ? <SkeletonCarousel /> :
    <Card className='flex flex-col items-center justify-center bg-slate-900 my-auto max-w-[640px]'>
      <Inset className='rounded-b-none'>
        <a href={album.external_urls.spotify} target='_blank'>
          <img className='object-cover' src={album?.images[0].url} />
        </a>
      </Inset>
      <div className="flex flex-row justify-between w-full p-2 gap-4 items-start mt-4">
        <div className='flex flex-col items-start gap-1'>
          <h1 className='text-[#EDEEF0] text-md md:text-lg font-extrabold'>{album.name}</h1>
          <h2 className='text-[#EDEEF0] text-md md:text-lg font-extralight'>{album.artists[0].name}</h2>
        </div>
        <div>
          {isLoading
            ? <Skeleton sx={{ backgroundColor: '#2c387e' }} width={175} height={50} />
            : <Rating
                emptyIcon={<StarIcon color='primary' style={{ opacity: 0.40 }}
                fontSize="inherit" />}
                size='large'
                value={rating}
                // @ts-ignore newValue exists
                onChange={handleSetRating}
              />
          }
        </div>
      </div>
    </Card>
  )
}
