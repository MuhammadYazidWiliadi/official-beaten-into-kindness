import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import GalleryFilters from '@/components/gallery/GalleryFilters';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';

type GalleryCategory = 'character' | 'scene' | 'abstract';

const Gallery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all');

  // Fetch gallery images
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images', filter],
    queryFn: async () => {
      let query = supabase
        .from('gallery_images')
        .select(`
          *,
          chapters(title, chapter_number)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter as GalleryCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch user likes for gallery images
  const { data: userLikes = [] } = useQuery({
    queryKey: ['gallery-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('likes')
        .select('gallery_image_id')
        .eq('user_id', user.id)
        .not('gallery_image_id', 'is', null);
      
      if (error) throw error;
      return data.map(like => like.gallery_image_id);
    },
    enabled: !!user,
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user) throw new Error('User not authenticated');

      const isLiked = userLikes.includes(imageId);

      if (isLiked) {
        // Remove like
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('gallery_image_id', imageId);
          
        // Get current count and decrease it
        const { data: currentImage } = await supabase
          .from('gallery_images')
          .select('likes_count')
          .eq('id', imageId)
          .single();
          
        if (currentImage) {
          await supabase
            .from('gallery_images')
            .update({ likes_count: Math.max(0, (currentImage.likes_count || 0) - 1) })
            .eq('id', imageId);
        }
      } else {
        // Add like
        await supabase
          .from('likes')
          .insert({ user_id: user.id, gallery_image_id: imageId });
          
        // Get current count and increase it
        const { data: currentImage } = await supabase
          .from('gallery_images')
          .select('likes_count')
          .eq('id', imageId)
          .single();
          
        if (currentImage) {
          await supabase
            .from('gallery_images')
            .update({ likes_count: (currentImage.likes_count || 0) + 1 })
            .eq('id', imageId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-likes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Status suka berhasil diupdate');
    },
    onError: (error) => {
      toast.error('Gagal menyimpan status suka');
      console.error(error);
    },
  });

  const handleLike = (imageId: string) => {
    if (!user) {
      toast.error('Silakan masuk untuk menyukai gambar');
      return;
    }
    likeMutation.mutate(imageId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Memuat galeri...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GalleryHeader />

      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <GalleryFilters filter={filter} setFilter={setFilter} />

          <GalleryGrid
            images={images}
            userLikes={userLikes}
            onImageClick={setSelectedImage}
            onLike={handleLike}
            isLiking={likeMutation.isPending}
          />

          {images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Tidak ada gambar dalam kategori ini.</p>
            </div>
          )}
        </div>
      </section>

      <GalleryLightbox
        selectedImage={selectedImage}
        userLikes={userLikes}
        onClose={() => setSelectedImage(null)}
        onLike={handleLike}
        isLiking={likeMutation.isPending}
      />
    </div>
  );
};

export default Gallery;
