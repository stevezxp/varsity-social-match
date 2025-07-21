import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoCarouselProps {
  photos: string[];
  className?: string;
  showDots?: boolean;
}

const PhotoCarousel = ({ photos, className = '', showDots = true }: PhotoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📸</div>
          <p>No photos</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main Image */}
      <img
        src={photos[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/20 border-white/30 text-white hover:bg-black/40"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={goToNext}
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/20 border-white/30 text-white hover:bg-black/40"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo Counter */}
      {photos.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};

export default PhotoCarousel;