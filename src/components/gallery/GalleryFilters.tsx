
import { Button } from '@/components/ui/button';

type GalleryCategory = 'character' | 'scene' | 'abstract';

interface GalleryFiltersProps {
  filter: 'all' | GalleryCategory;
  setFilter: (filter: 'all' | GalleryCategory) => void;
}

const GalleryFilters = ({ filter, setFilter }: GalleryFiltersProps) => {
  const categories = [
    { id: 'all' as const, name: 'Semua' },
    { id: 'character' as const, name: 'Karakter' },
    { id: 'scene' as const, name: 'Adegan' },
    { id: 'abstract' as const, name: 'Abstrak' }
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => setFilter(category.id)}
          variant={filter === category.id ? "default" : "outline"}
          className={filter === category.id 
            ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold"
            : "border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default GalleryFilters;
