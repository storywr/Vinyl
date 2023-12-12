import { api } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Inset, TextField } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from "react";
import useDebouncedValue from "~/hooks/useDebouncedValue";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdClear } from "react-icons/md";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import Skeleton from '@mui/material/Skeleton';
import SkeletonCarousel from "~/components/SkeletonCarousel";
import { Nav } from "~/components/Nav";
import { getAccessToken } from "~/utils/getAccessToken";
import { Rating as RatingType } from "@prisma/client";

export const getStaticProps = (async () => {
  const { access_token } = await getAccessToken();
  return { props: { access_token } }
})

const fetchAlbums = async (search: string, access_token: string) => {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${search}&type=album`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  return response.json();
};

interface HomeProps {
  access_token: string
}

export default function Home({ access_token }: HomeProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500)
  const {
    data: albumData,
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
  } = useQuery({
    queryKey: ['albums', debouncedSearch.trim()],
    queryFn: () => fetchAlbums(debouncedSearch, access_token),
    enabled: !!debouncedSearch,
  })

  const handleClear = () => {
    setSearch('')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setSearch(e.target.value)
  }

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  const SearchBar = (
    <TextField.Root variant='soft' radius='full' color='gray' className='w-full md:w-[480px] flex-[0-0-100%] order-2' size='3'>
      <TextField.Slot><FaMagnifyingGlass size='16' /></TextField.Slot>
      <TextField.Input placeholder="Search album art..." onChange={handleChange} value={search} />
      {!!search && <TextField.Slot className='cursor-pointer' onClick={handleClear}><MdClear size='20' /></TextField.Slot>}
    </TextField.Root> 
  )
  
  return (
    <Nav searchBar={SearchBar}>
      <div className='justify-center items-center w-full m-auto'>
        {(isLoadingAlbums && search) ? <SkeletonCarousel /> :
          <Carousel responsive={responsive}>
            {albumData?.albums?.items?.map((album: any) => (
              <AlbumCard key={album.id} album={album} />
            )) ?? []}
          </Carousel>
        }
      </div>
    </Nav>
  );
}

const AlbumCard = ({ album }: { album: any }) => {
  const { data, isLoading } = api.ratings.get.useQuery({ id: album.id });
  const [rating, setRating] = useState<RatingType | null>(null);

  useEffect(() => {
    if (!data?.value) return
    setRating(data);
  }, [data?.value]);

  const { mutate: create } = api.ratings.create.useMutation({
    onSuccess: () => {
      console.log('success');
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const { mutate: update } = api.ratings.update.useMutation({
    onSuccess: () => {
      console.log('success');
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const handleSetRating = (_e: ChangeEvent, newValue: number) => {
    // @ts-ignore it is mad about null
    setRating((prevState: RatingType) => ({ ...prevState, value: newValue }))
    if (!rating) {
      create({ albumId: album.id, value: newValue });
    } else {
      update({ id: rating.id, albumId: album.id, value: newValue })
    }
  }

  return (
    <Card className='flex flex-col items-center justify-center bg-slate-900 my-auto mx-8 md:hover:mx-6'>
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
                value={rating?.value ?? 0}
                // @ts-ignore newValue exists
                onChange={handleSetRating}
              />
          }
        </div>
      </div>
    </Card>
  )
}
