import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { AlbumCard } from "~/components/AlbumCard";
import { Nav } from "~/components/Nav";
import { getAccessToken } from "~/utils/getAccessToken";

export const getServerSideProps = (async () => {
  const { access_token } = await getAccessToken();
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