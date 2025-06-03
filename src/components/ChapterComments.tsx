
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ChapterCommentForm from '@/components/comments/chapter/ChapterCommentForm';
import ChapterCommentItem from '@/components/comments/chapter/ChapterCommentItem';

interface ChapterCommentsProps {
  chapterId: string;
}

const ChapterComments = ({ chapterId }: ChapterCommentsProps) => {
  const { user } = useAuth();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['chapter-comments', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name, role)
        `)
        .eq('chapter_id', chapterId)
        .is('parent_id', null)
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch replies for each comment
  const { data: replies = [] } = useQuery({
    queryKey: ['comment-replies', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name, role)
        `)
        .eq('chapter_id', chapterId)
        .not('parent_id', 'is', null)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Get user likes
  const { data: userLikes = [] } = useQuery({
    queryKey: ['user-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .not('comment_id', 'is', null);
      
      if (error) throw error;
      return data.map(like => like.comment_id);
    },
    enabled: !!user,
  });

  const getRepliesForComment = (commentId: string) => {
    return replies.filter(reply => reply.parent_id === commentId);
  };

  if (isLoading) {
    return <div className="text-amber-400 text-sm">Memuat komentar...</div>;
  }

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-bold text-amber-400 mb-4 sm:mb-6">
        Komentar ({comments.length})
      </h2>

      <ChapterCommentForm chapterId={chapterId} />

      {/* Comments List */}
      <div className="space-y-4 sm:space-y-6">
        {comments.map(comment => (
          <div key={comment.id}>
            <ChapterCommentItem 
              comment={comment} 
              chapterId={chapterId}
              userLikes={userLikes}
            />
            {getRepliesForComment(comment.id).map(reply => (
              <ChapterCommentItem 
                key={reply.id}
                comment={reply} 
                chapterId={chapterId}
                userLikes={userLikes}
                isReply={true}
              />
            ))}
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm sm:text-base">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapterComments;
