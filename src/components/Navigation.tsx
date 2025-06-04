import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const NavItem = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className="relative group text-gray-300 transition-all duration-300 ease-out hover:text-amber-400 hover:scale-105"
  >
    {label}
    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
  </Button>
);

const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: isAdmin = false } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (error) return false;
      return data?.role === 'admin';
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1
            onClick={() => navigate('/')}
            className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent cursor-pointer"
          >
            Beaten Into Kindness
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavItem label="Beranda" onClick={() => navigate('/')} />
            <NavItem label="Galeri" onClick={() => navigate('/gallery')} />
            <NavItem label="Chapters" onClick={() => navigate('/chapters')} />

            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="ghost"
                    className="text-amber-400 hover:text-black hover:bg-amber-400"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <NavItem label="Profil" onClick={() => navigate('/profile')} />
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold"
              >
                Masuk
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            className="md:hidden text-amber-400"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-amber-400/20 pt-4">
            <div className="flex flex-col space-y-3">
              <NavItem label="Beranda" onClick={() => { navigate('/'); setIsMenuOpen(false); }} />
              <NavItem label="Galeri" onClick={() => { navigate('/gallery'); setIsMenuOpen(false); }} />
              <NavItem label="Chapters" onClick={() => { navigate('/chapters'); setIsMenuOpen(false); }} />

              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                      variant="ghost"
                      className="text-amber-400 hover:text-black hover:bg-amber-400 justify-start"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <NavItem label="Profil" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} />
                  <Button
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    variant="outline"
                    className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold justify-start"
                >
                  Masuk
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
