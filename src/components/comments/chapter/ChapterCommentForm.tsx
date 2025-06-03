
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChapterCommentFormProps {
  chapterId: string;
}

const ChapterCommentForm = ({ chapterId }: ChapterCommentFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          content,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-comments', chapterId] });
      setNewComment('');
      toast.success('Komentar berhasil ditambahkan dan sedang menunggu moderasi');
    },
    onError: (error) => {
      toast.error('Gagal menambah komentar: ' + error.message);
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }
    if (!user) {
      toast.error('Silakan masuk untuk berkomentar');
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  if (!user) {
    return (
      <Card className="bg-gradient-to-r from-purple-900 to-gray-700/90 border-amber-400/20 p-4 sm:p-6 mb-6 sm:mb-8 text-center">
        <p className="text-gray-300 mb-4 text-sm sm:text-base">Silakan masuk untuk berkomentar</p>
        <Button
          onClick={() => window.location.href = '/auth'}
          className="bg-amber-500 hover:bg-amber-600 text-black text-sm sm:text-base px-4 sm:px-6"
        >
          Masuk
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-900 to-gray-700/90 border-amber-400/20 p-4 sm:p-6 mb-6 sm:mb-8">
      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Bagikan pendapat Anda tentang bab ini..."
        className="bg-gray-800 border-amber-400/20 text-white placeholder-gray-400 mb-4 text-sm sm:text-base"
        rows={4}
      />
      <Button
        onClick={handleSubmitComment}
        disabled={addCommentMutation.isPending}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold text-sm sm:text-base px-4 sm:px-6"
      >
        {addCommentMutation.isPending ? 'Mengirim...' : 'Kirim Komentar'}
      </Button>
    </Card>
  );
};

export default ChapterCommentForm;
