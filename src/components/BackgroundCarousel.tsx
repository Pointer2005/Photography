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

const images = [
  {
    desktop: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=70&w=1200&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=70&w=640&h=1138&auto=format&fit=crop',
    alt: 'Wedding Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=70&w=1200&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=70&w=640&h=1138&auto=format&fit=crop',
    alt: 'Couple Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=70&w=1200&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=70&w=640&h=1138&auto=format&fit=crop',
    alt: 'Event Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=70&w=1200&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=70&w=640&h=1138&auto=format&fit=crop',
    alt: 'Pre-wedding Photography'
  }
];

export default function BackgroundCarousel() {
  const plugins = React.useMemo(() => [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
    Fade()
  ], []);

  return (
    <div className="absolute inset-0 bg-[#09090b] z-0 overflow-hidden">
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
            <CarouselItem key={image.desktop} className="p-0 pl-0 relative w-full h-full">
              {/* Mobile Image */}
              <Image
                src={image.mobile}
                alt={image.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover object-[center_20%] md:hidden"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={70}
              />
              {/* Desktop Image */}
              <Image
                src={image.desktop}
                alt={image.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="hidden md:block object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={70}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Overlays - Lighter for vibrant theme, fading to black on the right (desktop) and bottom (mobile) */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#09090b] z-10 pointer-events-none"></div>
    </div>
  );
}
