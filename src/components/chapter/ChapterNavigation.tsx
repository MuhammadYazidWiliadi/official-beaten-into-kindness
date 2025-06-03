
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChapterNavigationProps {
  currentChapterNumber: number;
}

const ChapterNavigation = ({ currentChapterNumber }: ChapterNavigationProps) => {
  const navigate = useNavigate();
  const prevChapterNumber = currentChapterNumber - 1;
  const nextChapterNumber = currentChapterNumber + 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-amber-400/20 gap-4">
      <Button
        onClick={() => navigate(`/chapter/${prevChapterNumber}`)}
        disabled={currentChapterNumber <= 1}
        variant="outline"
        className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base px-4 py-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Bab Sebelumnya
      </Button>

      <Button
        onClick={() => navigate(`/chapter/${nextChapterNumber}`)}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold w-full sm:w-auto text-sm sm:text-base px-4 py-2"
      >
        Bab Selanjutnya
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default ChapterNavigation;
