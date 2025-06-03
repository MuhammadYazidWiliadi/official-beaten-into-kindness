
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import UserProfileHeader from '@/components/user/UserProfileHeader';
import ReadingActivity from '@/components/user/ReadingActivity';
import UserComments from '@/components/user/UserComments';
import LikedComments from '@/components/user/LikedComments';

const UserProfile = () => {
  const { user } = useAuth();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return { chaptersRead: 0, totalComments: 0, totalLikes: 0 };

      // Get completed chapters count
      const { data: completedChapters } = await supabase
        .from('reading_progress')
        .select('id')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

      // Get total comments count
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      // Get total likes received on user's comments
      const { data: likes } = await supabase
        .from('comments')
        .select('likes_count')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      const totalLikes = likes?.reduce((sum, comment) => sum + (comment.likes_count || 0), 0) || 0;

      return {
        chaptersRead: completedChapters?.length || 0,
        totalComments: comments?.length || 0,
        totalLikes
      };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Silakan masuk untuk melihat profil</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <UserProfileHeader 
        profile={profile}
        stats={stats || { chaptersRead: 0, totalComments: 0, totalLikes: 0 }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-amber-400/20">
            <TabsTrigger value="activity" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Aktivitas
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Komentar Saya
            </TabsTrigger>
            <TabsTrigger value="liked" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Disukai
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <ReadingActivity />
          </TabsContent>

          <TabsContent value="comments">
            <UserComments />
          </TabsContent>

          <TabsContent value="liked">
            <LikedComments />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
