
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChapterCardProps {
  chapter: any;
}

const ChapterCard = ({ chapter }: ChapterCardProps) => {
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

  // Determine primary badge (only one per card)
  const getPrimaryBadge = () => {
    if (isNewChapter(chapter.created_at)) {
      return { text: 'NEW', className: 'bg-red-500 text-white' };
    }
    if (chapter.views_count > 100) {
      return { text: 'Populer', className: 'bg-blue-500 text-white' };
    }
    return null;
  };

  const primaryBadge = getPrimaryBadge();

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 hover:border-purple-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden">
      {/* Chapter Image */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-r from-purple-900 to-amber-900">
        <img
          src="https://plus.unsplash.com/premium_photo-1688429242589-7a0b8e7349a4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={chapter.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Single Badge */}
        <div className="absolute top-3 right-3">
          {primaryBadge ? (
            <Badge className={`${primaryBadge.className} text-xs px-2 py-1`}>
              {primaryBadge.text}
            </Badge>
          ) : (
            <Badge className="bg-amber-500 text-black text-xs px-2 py-1">
              Bab {chapter.chapter_number}
            </Badge>
          )}
        </div>

        {/* Views Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs">
          <Eye className="w-3 h-3" />
          <span>{chapter.views_count || 0}</span>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
          {chapter.title}
        </h3>
        
        <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
          {chapter.content.substring(0, 120)}...
        </p>

        {/* Chapter Stats */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <span>{chapter.read_time_minutes} min</span>
            <span>♥ {chapter.likes_count || 0}</span>
          </div>
        </div>

        {/* Admin Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>
              {chapter.profiles?.full_name || chapter.profiles?.username || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatTimeAgo(chapter.created_at)}</span>
          </div>
        </div>

        {/* Read Button */}
        <Button 
          onClick={() => navigate(`/chapter/${chapter.chapter_number}`)}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold text-sm sm:text-base py-2"
        >
          Baca Chapter
        </Button>
      </div>
    </Card>
  );
};

export default ChapterCard;
