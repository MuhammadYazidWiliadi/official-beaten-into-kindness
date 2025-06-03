
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChapterCommentItemProps {
  comment: any;
  chapterId: string;
  userLikes: string[];
  isReply?: boolean;
}

const ChapterCommentItem = ({ comment, chapterId, userLikes, isReply = false }: ChapterCommentItemProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string, parentId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          content,
          parent_id: parentId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-replies', chapterId] });
      setReplyText('');
      setReplyTo(null);
      toast.success('Balasan berhasil ditambahkan dan sedang menunggu moderasi');
    },
    onError: (error) => {
      toast.error('Gagal menambah balasan: ' + error.message);
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('User not authenticated');

      const isLiked = userLikes.includes(commentId);

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, comment_id: commentId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-comments', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['user-likes', user?.id] });
    },
    onError: (error) => {
      toast.error('Gagal menyimpan status suka');
    },
  });

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) {
      toast.error('Balasan tidak boleh kosong');
      return;
    }
    if (!user) {
      toast.error('Silakan masuk untuk membalas');
      return;
    }
    addReplyMutation.mutate({ content: replyText, parentId });
  };

  return (
    <Card className={`bg-gradient-to-r from-purple-900/90 to-gray-700/100 border-amber-400/20 p-3 sm:p-4 ${isReply ? 'ml-4 sm:ml-8 mt-4' : ''} ${comment.is_pinned ? 'ring-1 ring-amber-400/30' : ''}`}>
      {comment.is_pinned && !isReply && (
        <div className="flex items-center gap-2 mb-3">
          <Pin className="w-3 h-3 text-amber-400" />
          <Badge className="bg-amber-500 text-black text-xs px-2 py-1">
            Disematkan
          </Badge>
        </div>
      )}

      <div className="flex items-start space-x-2 sm:space-x-3">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold text-xs sm:text-sm">
          {(comment.profiles?.full_name || comment.profiles?.username || 'A')[0].toUpperCase()}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-white text-xs sm:text-sm">
              {comment.profiles?.full_name || comment.profiles?.username || 'Anonim'}
            </span>
            {comment.profiles?.role === 'admin' && (
              <Badge className="bg-red-500 text-white text-xs px-1 py-0.5">
                Admin
              </Badge>
            )}
            <span className="text-gray-400 text-xs">
              {new Date(comment.created_at).toLocaleDateString('id-ID')}
            </span>
          </div>
          
          <p className="text-gray-300 mb-3 text-xs sm:text-sm leading-relaxed break-words">
            {comment.content}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => likeCommentMutation.mutate(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                userLikes.includes(comment.id) 
                  ? 'text-red-400' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
              disabled={!user}
            >
              <Heart className={`w-3 h-3 ${userLikes.includes(comment.id) ? 'fill-current' : ''}`} />
              <span>{comment.likes_count || 0}</span>
            </button>
            
            {!isReply && user && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-amber-400 hover:text-amber-300 text-xs transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Balas
              </button>
            )}
          </div>

          {replyTo === comment.id && (
            <div className="mt-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan..."
                className="bg-gray-800 border-amber-400/20 text-white placeholder-gray-400 text-xs sm:text-sm"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={addReplyMutation.isPending}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs px-3 py-1"
                >
                  {addReplyMutation.isPending ? 'Mengirim...' : 'Kirim'}
                </Button>
                <Button
                  onClick={() => setReplyTo(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white text-xs px-3 py-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChapterCommentItem;
