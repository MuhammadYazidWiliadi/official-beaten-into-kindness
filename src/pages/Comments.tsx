
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import CommentsHeader from '@/components/comments/CommentsHeader';
import CommentCard from '@/components/comments/CommentCard';

const Comments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['all-comments', sortBy],
    queryFn: async () => {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name, role),
          chapters!comments_chapter_id_fkey(title, chapter_number)
        `)
        .eq('status', 'approved')
        .is('parent_id', null);

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('likes_count', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      toast.success('Status suka berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate status suka');
    },
  });

  // Pin comment mutation (admin only)
  const pinCommentMutation = useMutation({
    mutationFn: async ({ commentId, isPinned }: { commentId: string, isPinned: boolean }) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_pinned: !isPinned })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      toast.success('Status pin komentar berhasil diupdate');
    },
    onError: () => {
      toast.error('Gagal mengupdate status pin');
    },
  });

  const handleLike = (commentId: string) => {
    if (!user) {
      toast.error('Silakan masuk untuk menyukai komentar');
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const handlePin = (commentId: string, isPinned: boolean) => {
    pinCommentMutation.mutate({ commentId, isPinned });
  };

  // Sort comments: pinned first, then by selected criteria
  const sortedComments = [...comments].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-amber-400 text-xl">Memuat komentar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <CommentsHeader 
          commentsCount={comments.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              userProfile={userProfile}
              onLike={handleLike}
              onPin={handlePin}
            />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Belum ada komentar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
