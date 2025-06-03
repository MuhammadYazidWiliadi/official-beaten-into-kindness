
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Book, User, Palette } from 'lucide-react';

interface ChaptersBannerProps {
  totalChapters: number;
  totalViews: number;
}

const ChaptersBanner = ({ totalChapters, totalViews }: ChaptersBannerProps) => {
  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Background Image */}
      <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden">
        <img
          src="https://plus.unsplash.com/premium_photo-1688429242589-7a0b8e7349a4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Novel Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <div className="max-w-4xl">
          {/* Genre Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-purple-600 text-white text-xs px-3 py-1">
              Drama
            </Badge>
            <Badge className="bg-amber-600 text-white text-xs px-3 py-1">
              Transformasi
            </Badge>
            <Badge className="bg-blue-600 text-white text-xs px-3 py-1">
              Psikologi
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Perjalanan Maya
          </h1>

          {/* Synopsis */}
          <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
            Ikuti perjalanan transformasi Maya, seorang wanita muda yang menemukan kekuatan dalam dirinya 
            melalui berbagai tantangan hidup. Sebuah cerita tentang pertumbuhan, keberanian, dan penemuan jati diri.
          </p>

          {/* Stats and Credits */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-amber-400">
              <Book className="w-4 h-4" />
              <span>{totalChapters} Chapter</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Eye className="w-4 h-4" />
              <span>{totalViews.toLocaleString()} Views</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <User className="w-4 h-4" />
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Palette className="w-4 h-4" />
              <span>Illustrated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersBanner;
