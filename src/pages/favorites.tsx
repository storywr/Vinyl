import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { AlbumCard } from "~/components/AlbumCard";
import { Nav } from "~/components/Nav";

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

interface FavoritesProps {
  access_token: string
}

const Favorites = ({ access_token }: FavoritesProps) => {
  const { user } = useUser();
  const { data } = api.ratings.getRatingsByUserId.useQuery({
    // @ts-ignore user exists
    userId: user?.id,
    enabled: !!user?.id,
  });

  return (
    <Nav>
      <div className="flex flex-row flex-wrap justify-center items-center w-full gap-12 md:gap-20 p-6">
        {data?.map((favorite: any) => (
          <AlbumCard key={favorite.id} albumId={favorite.albumId} access_token={access_token} id={favorite.id}  />
        ))}
      </div>
    </Nav>
  )
}

export default Favorites;