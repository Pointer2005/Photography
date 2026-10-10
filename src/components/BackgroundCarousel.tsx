'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const images = [
  {
    desktop: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&h=1422&auto=format&fit=crop',
    alt: 'Wedding Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&h=1422&auto=format&fit=crop',
    alt: 'Couple Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&h=1422&auto=format&fit=crop',
    alt: 'Event Photography'
  },
  {
    desktop: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&h=1422&auto=format&fit=crop',
    alt: 'Pre-wedding Photography'
  }
];

export default function BackgroundCarousel() {
  const plugins = React.useMemo(() => [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
    Fade()
  ], []);

  return (
    <div className="fixed inset-0 bg-[#0C0B09] -z-10">
      <Carousel
        plugins={plugins}
        opts={{
          loop: true,
          duration: 40, // slow down the transition
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-screen m-0 -ml-0">
          {images.map((image) => (
            <CarouselItem key={image.desktop} className="p-0 pl-0 relative w-full h-full">
              <picture>
                <source media="(max-width: 767px)" srcSet={image.mobile} />
                <source media="(min-width: 768px)" srcSet={image.desktop} />
                <img
                  src={image.desktop}
                  alt={image.alt}
                  aria-hidden="true"
                  className="w-full h-full object-cover object-[center_20%] md:object-center"
                />
              </picture>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0B09]/60 via-[#0C0B09]/70 to-[#0C0B09]/90 z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[#0C0B09]/20 mix-blend-multiply z-10 pointer-events-none"></div>
    </div>
  );
}
