
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent mb-2">
          Beaten Into Kindness
        </h1>
        <p className="text-gray-300">Masuk atau daftar untuk melanjutkan</p>
      </div>
      
      <div className="mt-6 text-center">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-amber-400 hover:text-black hover:bg-amber-400"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </>
  );
};

export default AuthHeader;
