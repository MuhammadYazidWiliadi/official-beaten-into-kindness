
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const LikedComments = () => {
  const { user } = useAuth();

  const { data: likedComments = [], isLoading } = useQuery({
    queryKey: ['liked-comments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('likes')
        .select(`
          *,
          comments!likes_comment_id_fkey(
            content,
            created_at,
            likes_count,
            profiles!comments_user_id_fkey(username, full_name),
            chapters!comments_chapter_id_fkey(title, chapter_number)
          )
        `)
        .eq('user_id', user.id)
        .not('comment_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data.filter(like => like.comments);
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-amber-400">Memuat komentar yang disukai...</div>;
  }

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 p-6">
      <h3 className="text-xl font-bold text-amber-400 mb-6">Komentar yang Disukai</h3>
      <div className="space-y-6">
        {likedComments.map((like) => (
          <div key={like.id} className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-medium text-sm">
                {like.comments.chapters ? 
                  `Bab ${like.comments.chapters.chapter_number}: ${like.comments.chapters.title}` : 
                  'Bab tidak ditemukan'
                }
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(like.comments.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
            <p className="text-gray-300 mb-3 leading-relaxed">
              {like.comments.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                oleh {like.comments.profiles?.full_name || like.comments.profiles?.username || 'Pengguna'}
              </span>
              <div className="text-red-400 text-sm">
                ♥ {like.comments.likes_count || 0} suka
              </div>
            </div>
          </div>
        ))}
        {likedComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Belum ada komentar yang disukai.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LikedComments;
