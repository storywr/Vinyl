import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Favorite, FavoriteCard } from "~/components/FavoriteCard";
import { Nav } from "~/components/Nav";
import { getAccessToken } from "~/utils/getAccessToken";
import { Skeleton } from "@mui/material";

export const getServerSideProps = async () => {
  const access_token = await getAccessToken();
  return { props: { access_token } };
};

interface FavoritesProps {
  access_token: string;
}

const Favorites = ({ access_token }: FavoritesProps) => {
  const { user } = useUser();
  const { data, isLoading } = api.ratings.getRatingsByUserId.useQuery({
    access_token,
    // @ts-ignore user exists
    userId: user?.id,
  });

  return (
    <Nav>
      <div className="flex w-full flex-row flex-wrap justify-center gap-8 p-6 md:mt-12 md:gap-20 md:p-0">
        {isLoading
          ? Array.from({ length: 4 }).map((u, i) => (
              <div className="h-[400px] w-full md:h-[640px] md:w-[640px]">
                <Skeleton
                  variant="rectangular"
                  key={i}
                  sx={{ backgroundColor: "#0f172a" }}
                  height="100%"
                />
              </div>
            ))
          : data?.map((favorite: Favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
      </div>
    </Nav>
  );
};

export default Favorites;
