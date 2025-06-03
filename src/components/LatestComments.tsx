
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const LatestComments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch latest comments from Supabase
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['latest-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name, role),
          chapters!comments_chapter_id_fkey(title, chapter_number)
        `)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Check if user has liked each comment
  const { data: userLikes = [] } = useQuery({
    queryKey: ['user-comment-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', comments.map(c => c.id));
      
      if (error) throw error;
      return data.map(like => like.comment_id);
    },
    enabled: !!user && comments.length > 0,
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
          
        // Decrease likes count
        const { error } = await supabase.rpc('increment_comment_likes', { 
          comment_id: commentId, 
          increment_by: -1 
        });
        if (error) console.error('Error decrementing comment likes:', error);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, comment_id: commentId });
          
        // Increase likes count
        const { error } = await supabase.rpc('increment_comment_likes', { 
          comment_id: commentId, 
          increment_by: 1 
        });
        if (error) console.error('Error incrementing comment likes:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-comments'] });
      queryClient.invalidateQueries({ queryKey: ['user-comment-likes', user?.id] });
      toast.success('Status suka berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate status suka');
    },
  });

  const handleLike = (commentId: string) => {
    if (!user) {
      toast.error('Silakan masuk untuk menyukai komentar');
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-amber-400 text-lg sm:text-xl">Memuat komentar terbaru...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-amber-400 mb-4">
            Komentar Terbaru
          </h2>
          <p className="text-gray-300 text-sm sm:text-lg">
            Lihat apa yang dikatakan pembaca tentang novel ini
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {comments.map((comment) => {
            const isLiked = userLikes.includes(comment.id);
            const displayName = comment.profiles?.full_name || comment.profiles?.username || 'Pembaca Anonim';
            
            return (
              <Card key={comment.id} className="bg-gradient-to-r from-purple-950 to-gray-700/90 border-amber-400/20 p-4 sm:p-6 hover:border-amber-400/40 transition-all duration-300">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold">
                    {displayName[0].toUpperCase()}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm sm:text-base">
                          {displayName}
                        </span>
                        {comment.profiles?.role === 'admin' && (
                          <Badge className="bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {new Date(comment.created_at).toLocaleDateString('id-ID')}
                      </span>
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
                        <button 
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1 text-xs sm:text-sm transition-colors ${
                            isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                          }`}
                          disabled={likeCommentMutation.isPending}
                        >
                          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                          {comment.likes_count || 0}
                        </button>
                      </div>
                      {comment.chapters && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-amber-400 hover:text-black hover:bg-amber-400 text-xs sm:text-sm px-3 py-1 w-full sm:w-auto"
                          onClick={() => navigate(`/chapter/${comment.chapters.chapter_number}`)}
                        >
                          Baca Bab
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Belum ada komentar.</p>
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Button 
            onClick={() => navigate('/comments')}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base"
          >
            Lihat Semua Komentar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestComments;
