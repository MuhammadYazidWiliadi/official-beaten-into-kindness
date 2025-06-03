
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <Card className="bg-purple-100/10 border-purple-300/20 p-8 md:p-12 text-center max-w-md w-full animate-fade-in">
        <div className="mb-8">
          <div className="text-8xl font-bold text-amber-400 mb-4 animate-scale-in">
            404
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau dihapus.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Halaman Sebelumnya
          </Button>
          
          <Button
            onClick={() => navigate('/gallery')}
            variant="ghost"
            className="text-gray-400 hover:text-amber-400 w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Jelajahi Galeri
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-amber-400/20">
          <p className="text-gray-500 text-sm">
            Kode Error: {location.pathname}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
