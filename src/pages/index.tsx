import { api } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Inset,
  TextArea,
  TextField,
  Dialog,
  Avatar,
} from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from "react";
import useDebouncedValue from "~/hooks/useDebouncedValue";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdClear } from "react-icons/md";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Skeleton from "@mui/material/Skeleton";
import SkeletonCarousel from "~/components/SkeletonCarousel";
import { Nav } from "~/components/Nav";
import { getAccessToken } from "~/utils/getAccessToken";
import { Rating as RatingType } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

export const getServerSideProps = async () => {
  const access_token = await getAccessToken();
  return { props: { access_token } };
};

const fetchAlbums = async (search: string, access_token: string) => {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${search}&type=album`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + access_token },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch albums");
  }
  return response.json();
};

interface HomeProps {
  access_token: string;
}

export default function Home({ access_token }: HomeProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const {
    data: albumData,
    isLoading: isLoadingAlbums,
    isError: isErrorAlbums,
  } = useQuery({
    queryKey: ["albums", debouncedSearch.trim()],
    queryFn: () => fetchAlbums(debouncedSearch, access_token),
    enabled: !!debouncedSearch,
  });

  const handleClear = () => {
    setSearch("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const SearchBar = (
    <TextField.Root
      variant="soft"
      radius="full"
      color="gray"
      className="order-2 w-full flex-[0-0-100%] md:w-[480px]"
      size="3"
    >
      <TextField.Slot>
        <FaMagnifyingGlass size="16" />
      </TextField.Slot>
      <TextField.Input
        placeholder="Search artist or album..."
        onChange={handleChange}
        value={search}
      />
      {!!search && (
        <TextField.Slot className="cursor-pointer" onClick={handleClear}>
          <MdClear size="20" />
        </TextField.Slot>
      )}
    </TextField.Root>
  );

  return (
    <Nav searchBar={SearchBar}>
      <div className="mt-0 h-full w-full items-center justify-center p-6 md:mt-12 md:p-0">
        {isLoadingAlbums && search ? (
          <SkeletonCarousel />
        ) : (
          <Carousel responsive={responsive}>
            {albumData?.albums?.items?.map((album: any) => (
              <AlbumCard key={album.id} album={album} />
            )) ?? []}
          </Carousel>
        )}
      </div>
    </Nav>
  );
}

const AlbumCard = ({ album }: { album: any }) => {
  const { data: ratingData, isLoading: isLoadingRating } =
    api.ratings.get.useQuery({ id: album.id });
  const [rating, setRating] = useState<RatingType | null>(null);
  const [comment, setComment] = useState("");
  const {
    data: commentData,
    isLoading: isLoadingComments,
    refetch,
  } = api.comments.getCommentsByAlbumId.useQuery({ albumId: album.id });
  const { user } = useUser();

  useEffect(() => {
    if (!ratingData?.value) return;
    setRating(ratingData);
  }, [ratingData?.value]);

  const { mutate: createComment } = api.comments.create.useMutation({
    onSuccess: () => {
      refetch();
      console.log("success");
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const { mutate: createRating } = api.ratings.create.useMutation({
    onSuccess: () => {
      console.log("success");
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const { mutate: update } = api.ratings.update.useMutation({
    onSuccess: () => {
      console.log("success");
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const handleSetRating = (_e: ChangeEvent, newValue: number) => {
    // @ts-ignore it is mad about null
    setRating((prevState: RatingType) => ({ ...prevState, value: newValue }));
    if (!rating) {
      createRating({ albumId: album.id, value: newValue });
    } else {
      update({ id: rating.id, albumId: album.id, value: newValue });
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    createComment({ albumId: album.id, content: comment });
    setComment("");
  };

  return (
    <Dialog.Root>
      <Dialog.Content
        className="bg-slate-900"
        style={{ maxWidth: "600px", maxHeight: "700px" }}
      >
        <Dialog.Title size="8">
          <div className="flex flex-col gap-0">
            <div className="text-3xl font-extrabold">{album.name}</div>
            <div className="text-xl">{album.artists[0].name}</div>
          </div>
        </Dialog.Title>
        <div className="my-6 flex w-full flex-col gap-4">
          <label hidden className="Label" htmlFor="comment">
            Name
          </label>
          <div className="flex flex-row items-center justify-center gap-3">
            <Avatar size="5" radius="full" src={user?.imageUrl} fallback="" />
            <TextArea
              className="h-[80px] w-full"
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              placeholder="comment..."
              name="comment"
            />
          </div>
          <Button
            className="ml-auto w-20 cursor-pointer"
            size="4"
            onClick={handleComment}
            variant="soft"
          >
            Post
          </Button>
        </div>

        <div className="my-4 flex flex-col">
          {isLoadingComments ? (
            <Skeleton
              sx={{ backgroundColor: "#2c387e" }}
              width={175}
              height={50}
            />
          ) : (
            commentData?.map((comment) => (
              <div
                key={comment.comment.id}
                className="flex flex-row items-center gap-4 border border-b-0 border-solid border-slate-500 p-4 text-sm last:border"
              >
                <Avatar
                  size="2"
                  radius="full"
                  src={comment.author.profileImageUrl}
                  fallback=""
                />
                <div className="flex flex-col justify-start gap-1">
                  <div className="text-md font-bold underline">
                    {comment.author.username}
                  </div>
                  {comment.comment.content}
                </div>
              </div>
            ))
          )}
        </div>
      </Dialog.Content>
      <Card className="mx-auto flex w-auto max-w-[640px] flex-col bg-slate-900 md:w-[440px] md:hover:w-[460px]">
        <Inset className="rounded-b-none">
          <a href={album.external_urls.spotify} target="_blank">
            <img className="object-cover" src={album?.images[0].url} />
          </a>
        </Inset>
        <div className="mt-4 flex w-full flex-row items-start justify-between gap-4 p-2">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-md font-extrabold text-[#EDEEF0] md:text-lg">
              {album.name}
            </h1>
            <h2 className="text-md font-extralight text-[#EDEEF0] md:text-lg">
              {album.artists[0].name}
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-4">
            {isLoadingRating ? (
              <Skeleton
                sx={{ backgroundColor: "#2c387e" }}
                width={175}
                height={50}
              />
            ) : (
              <Rating
                emptyIcon={
                  <StarIcon
                    color="primary"
                    style={{ opacity: 0.4 }}
                    fontSize="inherit"
                  />
                }
                size="large"
                value={rating?.value ?? 0}
                // @ts-ignore newValue exists
                onChange={handleSetRating}
              />
            )}
            <Dialog.Trigger>
              <div>
                <Button
                  size="3"
                  variant="soft"
                  className="w-full cursor-pointer"
                >
                  Comment
                </Button>
              </div>
            </Dialog.Trigger>
          </div>
        </div>
      </Card>
    </Dialog.Root>
  );
};
