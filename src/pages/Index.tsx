
import HeroSection from '@/components/home/HeroSection';
import FeaturedChaptersSection from '@/components/home/FeaturedChaptersSection';
import StatisticNovel from '@/components/home/StatisticNovel';
import LatestCommentsSection from '@/components/home/LatestCommentsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <HeroSection />
      <StatisticNovel />
      <FeaturedChaptersSection />
      <LatestCommentsSection />
    </div>
  );
};

export default Index;
