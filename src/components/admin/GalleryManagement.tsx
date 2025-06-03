
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type GalleryCategory = 'character' | 'scene' | 'abstract';

const GalleryManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    category: 'character' as GalleryCategory,
    image_url: '',
    chapter_id: ''
  });

  // Fetch gallery images
  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch chapters for dropdown
  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters-for-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, chapter_number')
        .order('chapter_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Add image mutation
  const addImageMutation = useMutation({
    mutationFn: async (imageData: typeof newImage) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          title: imageData.title,
          description: imageData.description,
          category: imageData.category,
          image_url: imageData.image_url,
          chapter_id: imageData.chapter_id || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      setNewImage({ title: '', description: '', category: 'character', image_url: '', chapter_id: '' });
      toast.success('Gambar berhasil ditambahkan!');
    },
    onError: (error) => {
      toast.error('Gagal menambah gambar: ' + error.message);
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast.success('Gambar berhasil dihapus!');
    },
    onError: (error) => {
      toast.error('Gagal menghapus gambar: ' + error.message);
    },
  });

  const handleAddImage = () => {
    if (!newImage.title || !newImage.image_url) {
      toast.error('Judul dan URL gambar harus diisi');
      return;
    }
    addImageMutation.mutate(newImage);
  };

  if (isLoading) {
    return <div className="text-amber-400">Memuat...</div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="bg-purple-100/10 border-purple-300/20 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-6">Tambah Gambar</h3>
        <div className="space-y-4">
          <Input
            value={newImage.title}
            onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Judul Gambar"
            className="bg-gray-800 border-amber-400/20 text-white"
          />
          <Input
            value={newImage.image_url}
            onChange={(e) => setNewImage(prev => ({ ...prev, image_url: e.target.value }))}
            placeholder="URL Gambar"
            className="bg-gray-800 border-amber-400/20 text-white"
          />
          <Textarea
            value={newImage.description}
            onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Deskripsi Gambar"
            className="bg-gray-800 border-amber-400/20 text-white"
            rows={4}
          />
          <select
            value={newImage.category}
            onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value as GalleryCategory }))}
            className="w-full bg-gray-800 border border-amber-400/20 text-white p-2 rounded"
          >
            <option value="character">Karakter</option>
            <option value="scene">Adegan</option>
            <option value="abstract">Abstrak</option>
          </select>
          <select
            value={newImage.chapter_id}
            onChange={(e) => setNewImage(prev => ({ ...prev, chapter_id: e.target.value }))}
            className="w-full bg-gray-800 border border-amber-400/20 text-white p-2 rounded"
          >
            <option value="">Pilih Bab (Opsional)</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Bab {chapter.chapter_number}: {chapter.title}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddImage}
            disabled={addImageMutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          >
            {addImageMutation.isPending ? 'Memproses...' : 'Tambah ke Galeri'}
          </Button>
        </div>
      </Card>

      <Card className="bg-purple-100/10 border-purple-300/20 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-6">Galeri Gambar</h3>
        <CustomScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{image.title}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-amber-400 capitalize">{image.category}</span>
                      <span className="text-gray-400">{image.likes_count || 0} suka</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => deleteImageMutation.mutate(image.id)}
                  disabled={deleteImageMutation.isPending}
                  variant="destructive"
                  size="sm"
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </CustomScrollArea>
      </Card>
    </div>
  );
};

export default GalleryManagement;
