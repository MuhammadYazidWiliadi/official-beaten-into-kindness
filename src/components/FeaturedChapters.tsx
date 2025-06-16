
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const FeaturedChapters = () => {
  const navigate = useNavigate();

  // Fetch featured chapters from Supabase
  const { data: featuredChapters = [], isLoading } = useQuery({
    queryKey: ['featured-chapters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('status', 'published')
        .order('views_count', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  const isNewChapter = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3; // Chapter is "new" for 3 days
  };

  // Get single badge per chapter
  const getSingleBadge = (chapter: any, index: number) => {
    if (isNewChapter(chapter.created_at)) {
      return { text: 'NEW', className: 'bg-red-500 text-white' };
    }
    if (index === 0) {
      return { text: 'Populer', className: 'bg-blue-500 text-white' };
    }
    if (chapter.views_count > 100) {
      return { text: 'Trending', className: 'bg-green-500 text-white' };
    }
    return null;
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-amber-400 text-lg sm:text-xl">Memuat bab pilihan...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-amber-400 mb-4">
            Bab Pilihan
          </h2>
          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto">
            Temukan momen-momen penting dalam perjalanan transformasi Yuwan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {featuredChapters.map((chapter, index) => {
            const singleBadge = getSingleBadge(chapter, index);
            
            return (
              <Card key={chapter.id} className="bg-gradient-to-br from-purple-950 to-gray-800/30 border-amber-400/20 p-4 sm:p-6 hover:border-amber-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-semibold text-xs sm:text-sm">
                      Bab {chapter.chapter_number}
                    </span>
                    {singleBadge && (
                      <Badge className={`${singleBadge.className} text-xs px-2 py-1`}>
                        {singleBadge.text}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    {chapter.title}
                  </h3>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                  {chapter.content.substring(0, 150)}...
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-400">
                    <span>{chapter.read_time_minutes} min baca</span>
                    <span>{chapter.views_count || 0} views</span>
                    <span>{chapter.likes_count || 0} suka</span>
                  </div>
                  <Button 
                    onClick={() => navigate(`/chapter/${chapter.chapter_number}`)}
                    variant="ghost" 
                    className="text-amber-400 hover:text-black hover:bg-amber-400 p-2 w-full sm:w-auto"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span className="sm:hidden ml-2">Baca</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Button 
            onClick={() => navigate('/chapters')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            Lihat Semua Bab
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedChapters;
