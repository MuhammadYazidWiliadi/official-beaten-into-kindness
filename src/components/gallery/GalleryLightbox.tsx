
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

interface GalleryLightboxProps {
  selectedImage: GalleryImage | null;
  userLikes: string[];
  onClose: () => void;
  onLike: (imageId: string) => void;
  isLiking: boolean;
}

const GalleryLightbox = ({ selectedImage, userLikes, onClose, onLike, isLiking }: GalleryLightboxProps) => {
  const categories = [
    { id: 'character', name: 'Karakter' },
    { id: 'scene', name: 'Adegan' },
    { id: 'abstract', name: 'Abstrak' }
  ];

  return (
    <Dialog open={!!selectedImage} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-amber-400/20 p-0">
        {selectedImage && (
          <div className="relative">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-amber-400">
                  {selectedImage.title}
                </h3>
                {selectedImage.chapters && (
                  <span className="bg-amber-500 text-black text-sm px-3 py-1 rounded-full font-semibold">
                    Bab {selectedImage.chapters.chapter_number}
                  </span>
                )}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {selectedImage.description}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onLike(selectedImage.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    userLikes.includes(selectedImage.id) 
                      ? 'text-red-400' 
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                  disabled={isLiking}
                >
                  <Heart className={`w-5 h-5 ${userLikes.includes(selectedImage.id) ? 'fill-current' : ''}`} />
                  <span>
                    {selectedImage.likes_count || 0} suka
                  </span>
                </button>
                <span className="text-amber-400 font-medium capitalize">
                  {categories.find(cat => cat.id === selectedImage.category)?.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
