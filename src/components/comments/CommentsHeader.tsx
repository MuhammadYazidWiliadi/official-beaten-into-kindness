
import { MessageCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommentsHeaderProps {
  commentsCount: number;
  sortBy: 'newest' | 'popular';
  onSortChange: (value: 'newest' | 'popular') => void;
}

const CommentsHeader = ({ commentsCount, sortBy, onSortChange }: CommentsHeaderProps) => {
  return (
    <>
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4">
          Semua Komentar
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto">
          Lihat apa yang dikatakan pembaca tentang novel ini
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-400" />
          <span className="text-gray-300 text-sm sm:text-base">
            {commentsCount} komentar
          </span>
        </div>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-amber-400/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-amber-400/20">
            <SelectItem value="newest" className="text-white">Terbaru</SelectItem>
            <SelectItem value="popular" className="text-white">Populer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CommentsHeader;
