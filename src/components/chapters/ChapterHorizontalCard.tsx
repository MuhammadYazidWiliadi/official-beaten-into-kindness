
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChapterHorizontalCardProps {
  chapter: any;
}

const ChapterHorizontalCard = ({ chapter }: ChapterHorizontalCardProps) => {
  const navigate = useNavigate();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  const isNewChapter = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3;
  };

  // Determine single badge with minimalist styling
  const getSingleBadge = () => {
    if (isNewChapter(chapter.created_at)) {
      return { text: 'NEW', className: 'bg-red-500/90 text-white' };
    }
    if (chapter.views_count > 100) {
      return { text: 'Populer', className: 'bg-blue-500/90 text-white' };
    }
    if (chapter.profiles?.role === 'admin') {
      return { text: 'Admin', className: 'bg-purple-500/90 text-white' };
    }
    return null;
  };

  const singleBadge = getSingleBadge();

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 hover:border-purple-300/40 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-auto flex-shrink-0">
          <img
            src="https://plus.unsplash.com/premium_photo-1688429242589-7a0b8e7349a4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt={chapter.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Single Minimalist Badge */}
          {singleBadge && (
            <div className="absolute top-2 right-2">
              <Badge className={`${singleBadge.className} text-xs px-2 py-0.5 rounded-md font-medium`}>
                {singleBadge.text}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-amber-400 text-sm font-semibold mb-1">
                  Chapter {chapter.chapter_number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">
                  {chapter.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm line-clamp-2 mb-4 flex-grow">
              {chapter.content.substring(0, 150)}...
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{chapter.read_time_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{chapter.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(chapter.created_at)}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => navigate(`/chapter/${chapter.chapter_number}`)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold text-sm"
            >
              Baca Chapter
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChapterHorizontalCard;
