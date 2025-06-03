
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const UserComments = () => {
  const { user } = useAuth();

  const { data: userComments = [], isLoading } = useQuery({
    queryKey: ['user-comments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          chapters!comments_chapter_id_fkey(title, chapter_number)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-amber-400">Memuat komentar...</div>;
  }

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 p-6">
      <h3 className="text-xl font-bold text-amber-400 mb-6">Komentar Saya</h3>
      <div className="space-y-6">
        {userComments.map((comment) => (
          <div key={comment.id} className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-medium text-sm">
                {comment.chapters ? `Bab ${comment.chapters.chapter_number}: ${comment.chapters.title}` : 'Bab tidak ditemukan'}
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(comment.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
            <p className="text-gray-300 mb-3 leading-relaxed">
              {comment.content}
            </p>
            <div className="text-red-400 text-sm">
              ♥ {comment.likes_count || 0} suka
            </div>
          </div>
        ))}
        {userComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Belum ada komentar yang dibuat.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserComments;
