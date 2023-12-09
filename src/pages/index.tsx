import Head from "next/head";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Comment } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, Flex, Inset, Text, TextField } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from "react";
import useDebouncedValue from "~/hooks/useDebouncedValue";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdClear } from "react-icons/md";
import Rating from '@mui/material/Rating';
import { FaRecordVinyl } from "react-icons/fa6";
import StarIcon from '@mui/icons-material/Star';

export const getServerSideProps = (async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
    },
  });
  const { access_token } = await response.json();
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
  // const { data } = api.comments.getAll.useQuery();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500)
  const {
    data: albumData,
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
    refetch: refetchAlbums
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
      slidesToSlide: 1 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    }
  };
  
  return (
    <>
      <Head>
        <title>Renaissance</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center flex-col bg-slate-950">
        <Box className='flex flex-row justify-between p-6 w-full items-end'>
          <div className='text-4xl flex flex-row gap-2'>Vinyl <FaRecordVinyl /></div>
          <TextField.Root variant='soft' radius='full' color='gray' className='w-[480px]' size='3'>
            <TextField.Slot><FaMagnifyingGlass size='16' /></TextField.Slot>
            <TextField.Input placeholder="Search album art..." onChange={handleChange} value={search} />
            {!!search && <TextField.Slot className='cursor-pointer' onClick={handleClear}><MdClear size='20' /></TextField.Slot>}
          </TextField.Root>
          <Box>
            <UserButton afterSignOutUrl='/' />
          </Box>
        </Box>
        <div className='justify-center items-center w-full m-auto'>
          <Carousel responsive={responsive}>
            {albumData?.albums?.items?.map((album: any) => (
              <AlbumCard key={album.id} album={album} />
            )) ?? []}
          </Carousel>
        </div>
      </main>
    </>
  );
}

const AlbumCard = ({ album }: { album: any }) => {
  const [rating, setRating] = useState(0);
  return (
    <Card className='flex flex-col items-center justify-center w-[480px] m-auto bg-slate-900'>
      <Inset>
        <a href={album.external_urls.spotify} target='_blank'>
          <img className='object-cover min-h-[480px]' src={album?.images[0].url} />
        </a>
      </Inset>
      <div className="flex flex-row justify-between w-full p-2 gap-4 items-start mt-4">
        <div className='flex flex-col items-start gap-2'>
          <h1 className='text-[#EDEEF0] text-2xl'>{album.name}</h1>
          <h2 className='text-[#EDEEF0] text-xl'>{album.artists[0].name}</h2>
        </div>
        <div>
          <Rating emptyIcon={<StarIcon color='primary' style={{ opacity: 0.40 }} fontSize="inherit" />} size='large' value={rating} onChange={(event, newValue: number) => {
            setRating(newValue);
          }} />
        </div>
      </div>
    </Card>
  )
}
