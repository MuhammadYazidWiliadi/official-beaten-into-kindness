
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-amber-400/20 px-6 py-6">
      <div className="max-w-6xl mx-auto">
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
            Panel Admin
          </h1>
          <p className="text-gray-300 mt-2">Kelola konten dan pengaturan website</p>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
