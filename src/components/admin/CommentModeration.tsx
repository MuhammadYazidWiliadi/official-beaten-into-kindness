
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CommentModeration = () => {
  const queryClient = useQueryClient();

  // Fetch comments with user and chapter info
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name),
          chapters!comments_chapter_id_fkey(title, chapter_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Moderate comment mutation
  const moderateCommentMutation = useMutation({
    mutationFn: async ({ commentId, status }: { commentId: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success(`Komentar telah ${status === 'approved' ? 'disetujui' : 'ditolak'}!`);
    },
    onError: (error) => {
      toast.error('Gagal memperbarui status komentar: ' + error.message);
    },
  });

  if (isLoading) {
    return <div className="text-amber-400">Memuat...</div>;
  }

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 p-6">
      <h3 className="text-xl font-bold text-amber-400 mb-6">Moderasi Komentar</h3>
      <CustomScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">
                      {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                    </span>
                    <span className="text-amber-400 text-sm">
                      {comment.chapters ? `Bab ${comment.chapters.chapter_number}: ${comment.chapters.title}` : 'Bab tidak ditemukan'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      comment.status === 'approved' ? 'bg-green-500 text-white' :
                      comment.status === 'pending' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {comment.status === 'approved' ? 'Disetujui' :
                       comment.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(comment.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
                {comment.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => moderateCommentMutation.mutate({ commentId: comment.id, status: 'approved' })}
                      disabled={moderateCommentMutation.isPending}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Setujui
                    </Button>
                    <Button
                      onClick={() => moderateCommentMutation.mutate({ commentId: comment.id, status: 'rejected' })}
                      disabled={moderateCommentMutation.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Tidak ada komentar untuk dimoderasi.</p>
            </div>
          )}
        </div>
      </CustomScrollArea>
    </Card>
  );
};

export default CommentModeration;
