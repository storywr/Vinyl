import Skeleton from '@mui/material/Skeleton';
import { Card } from '@radix-ui/themes';
import Carousel from "react-multi-carousel"

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

const SkeletonCarousel = () => {
  return (
    <Carousel responsive={responsive}>
      {Array.from({ length: 20 }).map((u, i) => (
        <div key={i} className='flex flex-col bg-transparent max-w-[640px] max-h-[460px] md:max-h-none md:w-[440px] mx-auto'>
          <Skeleton height={560} width={440} variant='rounded' key={i} sx={{ backgroundColor: '#0f172a' }}>
            <img className='object-cover' height={640} width={640} />
          </Skeleton>
        </div>
      ))}
    </Carousel>
  )
}

export default SkeletonCarousel
