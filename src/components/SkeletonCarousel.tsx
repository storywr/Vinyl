import Skeleton from '@mui/material/Skeleton';
import { Box } from '@radix-ui/themes';
import Carousel from "react-multi-carousel"

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
}

const SkeletonCarousel = () => {
  return (
    <Carousel responsive={responsive}>
      {Array.from({ length: 4 }).map((u, i) => (
        <Skeleton className='bg-slate-900 max-w-[640px] md:w-[440px] mx-auto h-[800px] min-h-[800px]' key={i} sx={{ backgroundColor: '#0f172a' }} />
      ))}
    </Carousel>
  )
}

export default SkeletonCarousel
