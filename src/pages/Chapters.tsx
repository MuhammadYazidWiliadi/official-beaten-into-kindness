
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ChaptersBanner from '@/components/chapters/ChaptersBanner';
import ChapterHorizontalCard from '@/components/chapters/ChapterHorizontalCard';

const Chapters = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['all-chapters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          profiles!chapters_created_by_fkey(username, full_name, role)
        `)
        .eq('status', 'published')
        .order('chapter_number', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total views for banner
  const totalViews = chapters.reduce((sum, chapter) => sum + (chapter.views_count || 0), 0);

  // Track page views
  useEffect(() => {
    const trackPageView = async () => {
      const { error } = await supabase.rpc('increment_chapters_page_views');
      if (error) console.error('Error tracking page view:', error);
    };
    trackPageView();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-amber-400 text-xl">Memuat chapters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Banner with novel info */}
        <ChaptersBanner 
          totalChapters={chapters.length}
          totalViews={totalViews}
        />

        {/* Live Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="text"
            placeholder="Cari chapter berdasarkan judul atau konten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 sm:pl-12 bg-gray-800 border-amber-400/20 text-white placeholder-gray-400 text-sm sm:text-base py-3 sm:py-4"
          />
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              Menampilkan {filteredChapters.length} dari {chapters.length} chapter
              {searchTerm && ` untuk "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Chapters List - Horizontal Cards */}
        <div className="space-y-4 sm:space-y-6">
          {filteredChapters.map((chapter) => (
            <ChapterHorizontalCard key={chapter.id} chapter={chapter} />
          ))}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Tidak ada chapter yang ditemukan.' : 'Belum ada chapter yang tersedia.'}
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Coba gunakan kata kunci yang berbeda atau hapus filter pencarian.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapters;
