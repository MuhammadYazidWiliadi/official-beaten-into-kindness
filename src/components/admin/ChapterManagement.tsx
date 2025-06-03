
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
import { Edit, Trash2 } from 'lucide-react';

const ChapterManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
    quote: '',
    chapter_number: 1,
    status: 'draft' as 'draft' | 'published'
  });
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    quote: '',
    chapter_number: 1,
    status: 'draft' as 'draft' | 'published'
  });

  // Fetch chapters
  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['admin-chapters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Add chapter mutation
  const addChapterMutation = useMutation({
    mutationFn: async (chapterData: typeof newChapter) => {
      if (!user) throw new Error('User not authenticated');

      const wordCount = chapterData.content.split(' ').length;
      const readTimeMinutes = Math.ceil(wordCount / 200);

      const { data, error } = await supabase
        .from('chapters')
        .insert({
          title: chapterData.title,
          content: chapterData.content,
          quote: chapterData.quote || null,
          chapter_number: chapterData.chapter_number,
          status: chapterData.status,
          word_count: wordCount,
          read_time_minutes: readTimeMinutes,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      setNewChapter({ title: '', content: '', quote: '', chapter_number: chapters.length + 1, status: 'draft' });
      toast.success('Bab berhasil ditambahkan!');
    },
    onError: (error) => {
      toast.error('Gagal menambah bab: ' + error.message);
    },
  });

  // Update chapter mutation
  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, chapterData }: { id: string, chapterData: typeof editForm }) => {
      const wordCount = chapterData.content.split(' ').length;
      const readTimeMinutes = Math.ceil(wordCount / 200);

      const { data, error } = await supabase
        .from('chapters')
        .update({
          title: chapterData.title,
          content: chapterData.content,
          quote: chapterData.quote || null,
          chapter_number: chapterData.chapter_number,
          status: chapterData.status,
          word_count: wordCount,
          read_time_minutes: readTimeMinutes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      setEditingChapter(null);
      toast.success('Bab berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui bab: ' + error.message);
    },
  });

  // Delete chapter mutation
  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      // First, update gallery_images that reference this chapter to set chapter_id to null
      await supabase
        .from('gallery_images')
        .update({ chapter_id: null })
        .eq('chapter_id', chapterId);

      // Then delete the chapter
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      toast.success('Bab berhasil dihapus!');
    },
    onError: (error) => {
      toast.error('Gagal menghapus bab: ' + error.message);
    },
  });

  const handleAddChapter = () => {
    if (!newChapter.title || !newChapter.content) {
      toast.error('Judul dan konten harus diisi');
      return;
    }
    addChapterMutation.mutate(newChapter);
  };

  const handleEditChapter = (chapter: any) => {
    setEditingChapter(chapter);
    setEditForm({
      title: chapter.title,
      content: chapter.content,
      quote: chapter.quote || '',
      chapter_number: chapter.chapter_number,
      status: chapter.status
    });
  };

  const handleUpdateChapter = () => {
    if (!editForm.title || !editForm.content) {
      toast.error('Judul dan konten harus diisi');
      return;
    }
    updateChapterMutation.mutate({ id: editingChapter.id, chapterData: editForm });
  };

  if (isLoading) {
    return <div className="text-amber-400">Memuat...</div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="bg-purple-100/10 border-purple-300/20 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-6">
          {editingChapter ? 'Edit Bab' : 'Tambah Bab Baru'}
        </h3>
        <div className="space-y-4">
          <Input
            value={editingChapter ? editForm.title : newChapter.title}
            onChange={(e) => editingChapter ? 
              setEditForm(prev => ({ ...prev, title: e.target.value })) :
              setNewChapter(prev => ({ ...prev, title: e.target.value }))
            }
            placeholder="Judul Bab"
            className="bg-gray-800 border-amber-400/20 text-white"
          />
          <Input
            type="number"
            value={editingChapter ? editForm.chapter_number : newChapter.chapter_number}
            onChange={(e) => editingChapter ?
              setEditForm(prev => ({ ...prev, chapter_number: parseInt(e.target.value) })) :
              setNewChapter(prev => ({ ...prev, chapter_number: parseInt(e.target.value) }))
            }
            placeholder="Nomor Bab"
            className="bg-gray-800 border-amber-400/20 text-white"
          />
          <Textarea
            value={editingChapter ? editForm.content : newChapter.content}
            onChange={(e) => editingChapter ?
              setEditForm(prev => ({ ...prev, content: e.target.value })) :
              setNewChapter(prev => ({ ...prev, content: e.target.value }))
            }
            placeholder="Konten Bab"
            className="bg-gray-800 border-amber-400/20 text-white"
            rows={8}
          />
          <Textarea
            value={editingChapter ? editForm.quote : newChapter.quote}
            onChange={(e) => editingChapter ?
              setEditForm(prev => ({ ...prev, quote: e.target.value })) :
              setNewChapter(prev => ({ ...prev, quote: e.target.value }))
            }
            placeholder="Quote untuk akhir bab (opsional)"
            className="bg-gray-800 border-amber-400/20 text-white"
            rows={3}
          />
          <select
            value={editingChapter ? editForm.status : newChapter.status}
            onChange={(e) => editingChapter ?
              setEditForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' })) :
              setNewChapter(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))
            }
            className="w-full bg-gray-800 border border-amber-400/20 text-white p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Terbitkan</option>
          </select>
          <div className="flex space-x-2">
            <Button
              onClick={editingChapter ? handleUpdateChapter : handleAddChapter}
              disabled={editingChapter ? updateChapterMutation.isPending : addChapterMutation.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
            >
              {editingChapter ? 
                (updateChapterMutation.isPending ? 'Memperbarui...' : 'Perbarui Bab') :
                (addChapterMutation.isPending ? 'Memproses...' : 'Tambah Bab')
              }
            </Button>
            {editingChapter && (
              <Button
                onClick={() => setEditingChapter(null)}
                variant="outline"
                className="border-amber-400 text-amber-400"
              >
                Batal
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-purple-100/10 border-purple-300/20 p-6">
        <h3 className="text-xl font-bold text-amber-400 mb-6">Daftar Bab</h3>
        <CustomScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{chapter.title}</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      chapter.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                      {chapter.status === 'published' ? 'Terbit' : 'Draft'}
                    </span>
                    <span className="text-gray-400">Bab {chapter.chapter_number}</span>
                    <span className="text-gray-400">{chapter.views_count || 0} views</span>
                    <span className="text-gray-400">{chapter.likes_count || 0} suka</span>
                    {chapter.quote && (
                      <span className="text-amber-400 text-xs">📝 Quote</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEditChapter(chapter)}
                    variant="outline"
                    size="sm"
                    className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteChapterMutation.mutate(chapter.id)}
                    disabled={deleteChapterMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CustomScrollArea>
      </Card>
    </div>
  );
};

export default ChapterManagement;
