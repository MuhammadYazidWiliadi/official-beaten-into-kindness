
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserProfileHeaderProps {
  profile: any;
  stats: {
    chaptersRead: number;
    totalComments: number;
    totalLikes: number;
  };
}

const UserProfileHeader = ({ profile, stats }: UserProfileHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    username: profile?.username || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof editProfile) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          username: profileData.username
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui profil: ' + error.message);
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editProfile);
  };

  return (
    <>
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-amber-400/20 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-amber-400 hover:text-black hover:bg-amber-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent">
              Profil Pengguna
            </h1>
          </div>
        </div>
      </header>

      <Card className="bg-purple-100/10 border-purple-300/20 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <Avatar className="w-24 h-24 bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold text-3xl">
            {(profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()}
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editProfile.full_name}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-gray-800 border-amber-400/20 text-white"
                  placeholder="Nama Lengkap"
                />
                <Input
                  value={editProfile.username}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-gray-800 border-amber-400/20 text-white"
                  placeholder="Username"
                />
                <Textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-gray-800 border-amber-400/20 text-white"
                  placeholder="Bio"
                  rows={3}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-amber-400 mb-2">
                  {profile?.full_name || profile?.username || 'Pengguna'}
                </h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {profile?.bio || 'Belum ada bio.'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Bergabung sejak {new Date(profile?.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                >
                  Edit Profil
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-amber-400/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.chaptersRead}
            </div>
            <div className="text-gray-300 text-sm">Bab Dibaca</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.totalComments}
            </div>
            <div className="text-gray-300 text-sm">Komentar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.totalLikes}
            </div>
            <div className="text-gray-300 text-sm">Suka Diterima</div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default UserProfileHeader;
