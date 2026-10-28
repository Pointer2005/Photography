'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Landscape photography carousel images
// To add more images in the future, simply add them to this array!
export const CAROUSEL_IMAGES = [
  {
    src: '/images/image1.jpeg',
    alt: 'the_Cinemoy - Photography & Cinematography',
  },
  // Example for future additions:
  // {
  //   src: '/images/image2.jpeg',
  //   alt: 'Wedding Moments',
  // },
];

export default function BackgroundCarousel({
  images = CAROUSEL_IMAGES,
}: {
  images?: typeof CAROUSEL_IMAGES;
}) {
  const isMulti = images.length > 1;

  const plugins = React.useMemo(() => {
    if (!isMulti) return [];
    return [
      Autoplay({ delay: 5000, stopOnInteraction: false }),
      Fade(),
    ];
  }, [isMulti]);

  return (
    <div className="absolute inset-0 bg-[#09090b] z-0 overflow-hidden">
      {isMulti ? (
        <Carousel
          plugins={plugins}
          opts={{
            loop: true,
            duration: 30,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full m-0 -ml-0">
            {images.map((image, index) => (
              <CarouselItem key={`${image.src}-${index}`} className="p-0 pl-0 relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={75}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={75}
          />
        </div>
      )}

      {/* Overlays - Soft cinematic darkening and gradient fading to ensure contrast */}
      <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#09090b]/30 lg:to-[#09090b] z-10 pointer-events-none" />
    </div>
  );
}
