
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ReadingActivity = () => {
  const { user } = useAuth();

  const { data: readingActivity = [], isLoading } = useQuery({
    queryKey: ['reading-activity', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reading_progress')
        .select(`
          *,
          chapters!reading_progress_chapter_id_fkey(title, chapter_number)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-amber-400">Memuat aktivitas...</div>;
  }

  return (
    <Card className="bg-purple-100/10 border-purple-300/20 p-6">
      <h3 className="text-xl font-bold text-amber-400 mb-6">Aktivitas Membaca</h3>
      <div className="space-y-4">
        {readingActivity.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">
                {activity.chapters ? `Bab ${activity.chapters.chapter_number}: ${activity.chapters.title}` : 'Bab tidak ditemukan'}
              </h4>
              <p className="text-gray-400 text-sm">
                {new Date(activity.updated_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="text-amber-400 font-semibold">
              {Math.round(activity.progress_percentage)}%
              {activity.completed_at && ' ✓'}
            </div>
          </div>
        ))}
        {readingActivity.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Belum ada aktivitas membaca.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReadingActivity;
