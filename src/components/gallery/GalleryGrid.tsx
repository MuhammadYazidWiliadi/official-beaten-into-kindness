
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

type GalleryCategory = 'character' | 'scene' | 'abstract';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: GalleryCategory;
  likes_count: number;
  chapters?: {
    chapter_number: number;
    title: string;
  };
}

interface GalleryGridProps {
  images: GalleryImage[];
  userLikes: string[];
  onImageClick: (image: GalleryImage) => void;
  onLike: (imageId: string) => void;
  isLiking: boolean;
}

const GalleryGrid = ({ images, userLikes, onImageClick, onLike, isLiking }: GalleryGridProps) => {
  const categories = [
    { id: 'character', name: 'Karakter' },
    { id: 'scene', name: 'Adegan' },
    { id: 'abstract', name: 'Abstrak' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card 
          key={image.id} 
          className="bg-purple-100/10 border-purple-300/20 overflow-hidden hover:border-purple-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
          onClick={() => onImageClick(image)}
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {image.chapters && (
              <div className="absolute top-4 right-4">
                <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                  Bab {image.chapters.chapter_number}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {image.title}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              {image.description}
            </p>
            
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(image.id);
                }}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikes.includes(image.id) 
                    ? 'text-red-400' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
                disabled={isLiking}
              >
                <Heart className={`w-4 h-4 ${userLikes.includes(image.id) ? 'fill-current' : ''}`} />
                <span className="text-sm">
                  {image.likes_count || 0}
                </span>
              </button>
              
              <span className="text-amber-400 text-sm font-medium capitalize">
                {categories.find(cat => cat.id === image.category)?.name}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GalleryGrid;
