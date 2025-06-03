
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Share, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ChapterComments from '@/components/ChapterComments';
import ShareModal from '@/components/ShareModal';
import ChapterNavigation from '@/components/chapter/ChapterNavigation';

const ChapterReader = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Fetch chapter data
  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('chapter_number', parseInt(id || '1'))
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Increment views count when chapter loads
  useEffect(() => {
    if (chapter && user) {
      const incrementViews = async () => {
        const { error } = await supabase.rpc('increment_chapter_views', { 
          chapter_id: chapter.id 
        });
        if (error) console.error('Error incrementing views:', error);
      };
      incrementViews();
    }
  }, [chapter, user]);

  // Check if user has liked this chapter
  const { data: isLiked } = useQuery({
    queryKey: ['chapter-like', chapter?.id, user?.id],
    queryFn: async () => {
      if (!user || !chapter) return false;
      
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('chapter_id', chapter.id)
        .single();
      
      return !!data;
    },
    enabled: !!user && !!chapter,
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !chapter) return;

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('chapter_id', chapter.id);
          
        // Decrease likes count
        const { error } = await supabase.rpc('increment_chapter_likes', { 
          chapter_id: chapter.id, 
          increment_by: -1 
        });
        if (error) console.error('Error decrementing likes:', error);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, chapter_id: chapter.id });
          
        // Increase likes count
        const { error } = await supabase.rpc('increment_chapter_likes', { 
          chapter_id: chapter.id, 
          increment_by: 1 
        });
        if (error) console.error('Error incrementing likes:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-like', chapter?.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['chapter', id] });
      toast.success('Status suka berhasil diupdate');
    },
    onError: (error) => {
      toast.error('Gagal menyimpan status suka');
      console.error(error);
    },
  });

  // Update reading progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progressPercent: number) => {
      if (!user || !chapter) return;

      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          chapter_id: chapter.id,
          progress_percentage: progressPercent,
          completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
        });
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.pageYOffset;
      const scrollProgress = (currentScroll / totalHeight) * 100;
      setProgress(scrollProgress);

      // Update reading progress in database
      if (user && chapter) {
        updateProgressMutation.mutate(scrollProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, chapter]);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const handleLike = () => {
    if (!user) {
      toast.error('Silakan masuk untuk menyukai bab ini');
      return;
    }
    likeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Memuat...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-purple-100/10 border-purple-300/20 p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-400 mb-4">Bab Tidak Ditemukan</h1>
          <p className="text-gray-300 mb-6">Bab yang Anda cari tidak dapat ditemukan.</p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold"
          >
            Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  const currentChapterNumber = Number(chapter.chapter_number);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 bg-gray-800 rounded-none" />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Card className="bg-purple-100/10 border-purple-300/20 p-6 sm:p-8 md:p-12">
          <header className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-4">
              {chapter.title}
            </h1>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-gray-400 text-xs sm:text-sm mb-6">
              <span>{chapter.word_count} kata</span>
              <span>•</span>
              <span>{chapter.read_time_minutes} menit</span>
              <span>•</span>
              <span>Bab {currentChapterNumber}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleLike}
                variant="ghost"
                className={`${isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400 text-sm sm:text-base px-3 py-2`}
                disabled={likeMutation.isPending}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                {chapter.likes_count || 0}
              </Button>
              <Button
                onClick={() => setShowShareModal(true)}
                variant="ghost"
                className="text-amber-400 hover:text-black hover:bg-amber-400 text-sm sm:text-base px-3 py-2"
              >
                <Share className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
            </div>
          </header>

          <div className="prose prose-lg prose-invert prose-amber max-w-none">
            {chapter.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 leading-relaxed text-gray-300 text-base sm:text-lg">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* Quote Section - Display at the end if quote exists */}
          {chapter.quote && (
            <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-l-4 border-amber-400 rounded-r-lg">
              <blockquote className="text-amber-200 italic text-lg sm:text-xl font-medium text-center">
                "{chapter.quote}"
              </blockquote>
              <div className="text-center mt-4">
                <div className="w-16 h-0.5 bg-amber-400 mx-auto"></div>
              </div>
            </div>
          )}

          {/* Chapter Navigation */}
          <ChapterNavigation currentChapterNumber={currentChapterNumber} />
        </Card>

        {/* Selected Text Share */}
        {selectedText && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="bg-gray-800 border-amber-400/20 p-3">
              <Button
                onClick={() => setShowShareModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-black text-sm"
              >
                Bagikan Kutipan
              </Button>
            </Card>
          </div>
        )}

        {/* Comments Section */}
        <ChapterComments chapterId={chapter.id} />
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        selectedText={selectedText}
        chapterTitle={chapter.title}
        chapterId={String(currentChapterNumber)}
      />
    </div>
  );
};

export default ChapterReader;
