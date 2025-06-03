
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const NovelStats = () => {
  const [animatedStats, setAnimatedStats] = useState({
    chapters: 0,
    readers: 0,
    comments: 0,
    likes: 0
  });

  // Fetch actual stats from Supabase
  const { data: stats } = useQuery({
    queryKey: ['novel-stats'],
    queryFn: async () => {
      // Get chapters count
      const { count: chaptersCount } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get total views (readers)
      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('views_count')
        .eq('status', 'published');
      
      const totalReaders = chaptersData?.reduce((sum, chapter) => sum + (chapter.views_count || 0), 0) || 0;

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

      return {
        chapters: chaptersCount || 0,
        readers: totalReaders,
        comments: commentsCount || 0,
        likes: likesCount || 0
      };
    },
  });

  useEffect(() => {
    if (!stats) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        chapters: Math.floor(stats.chapters * progress),
        readers: Math.floor(stats.readers * progress),
        comments: Math.floor(stats.comments * progress),
        likes: Math.floor(stats.likes * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="py-20 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-amber-400 mb-12">
          Statistik Novel
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-purple-100/10 border-purple-300/20 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {animatedStats.chapters}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Bab Tersedia
            </div>
          </Card>

          <Card className="bg-purple-100/10 border-purple-300/20 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {formatNumber(animatedStats.readers)}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Total Views
            </div>
          </Card>

          <Card className="bg-purple-100/10 border-purple-300/20 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {formatNumber(animatedStats.comments)}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Komentar
            </div>
          </Card>

          <Card className="bg-purple-100/10 border-purple-300/20 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {formatNumber(animatedStats.likes)}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Suka
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NovelStats;
