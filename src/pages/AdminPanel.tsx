
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminHeader from '@/components/admin/AdminHeader';
import ChapterManagement from '@/components/admin/ChapterManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import CommentModeration from '@/components/admin/CommentModeration';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-amber-400/20">
            <TabsTrigger value="chapters" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Bab
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Galeri
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Komentar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters">
            <ChapterManagement />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="comments">
            <CommentModeration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
