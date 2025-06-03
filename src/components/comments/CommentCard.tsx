
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Heart, Pin, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CommentCardProps {
  comment: any;
  userProfile: any;
  onLike: (commentId: string) => void;
  onPin: (commentId: string, isPinned: boolean) => void;
}

const CommentCard = ({ comment, userProfile, onLike, onPin }: CommentCardProps) => {
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

  // Determine the primary badge to show (only one per card)
  const getPrimaryBadge = () => {
    if (comment.is_pinned) {
      return { type: 'pinned', text: 'Disematkan', className: 'bg-amber-500 text-black' };
    }
    if (comment.profiles?.role === 'admin') {
      return { type: 'admin', text: 'Admin', className: 'bg-red-500 text-white' };
    }
    return null;
  };

  const primaryBadge = getPrimaryBadge();

  return (
    <Card className={`bg-purple-100/10 border-purple-300/20 hover:border-purple-300/40 transition-all duration-300 p-4 sm:p-6 ${comment.is_pinned ? 'ring-1 ring-amber-400/30' : ''}`}>
      {comment.is_pinned && (
        <div className="flex items-center gap-2 mb-4">
          <Pin className="w-4 h-4 text-amber-400" />
          <Badge className="bg-amber-500 text-black text-xs px-2 py-1">
            Komentar Disematkan
          </Badge>
        </div>
      )}

      <div className="flex items-start space-x-3 sm:space-x-4">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold">
          {(comment.profiles?.full_name || comment.profiles?.username || 'A')[0].toUpperCase()}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm sm:text-base">
                {comment.profiles?.full_name || comment.profiles?.username || 'User'}
              </span>
              {primaryBadge && (
                <Badge className={`${primaryBadge.className} text-xs px-2 py-1`}>
                  {primaryBadge.text}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
              <Calendar className="w-3 h-3" />
              <span>{formatTimeAgo(comment.created_at)}</span>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base break-words">
            {comment.content}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-amber-400 text-xs sm:text-sm font-medium">
                {comment.chapters ? 
                  `Bab ${comment.chapters.chapter_number}: ${comment.chapters.title}` :
                  'Bab tidak ditemukan'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => onLike(comment.id)}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-xs sm:text-sm transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{comment.likes_count || 0}</span>
              </button>
              
              {userProfile?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPin(comment.id, comment.is_pinned || false)}
                  className="text-amber-400 hover:text-black hover:bg-amber-400 text-xs sm:text-sm px-2 py-1"
                >
                  <Pin className="w-3 h-3 mr-1" />
                  {comment.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CommentCard;
