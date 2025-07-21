import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center relative ${className}`}>
        <Image className="w-16 h-16 text-muted-foreground" />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 bg-black/20 rounded-full px-2 py-1 backdrop-blur-sm">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ImageCarousel;