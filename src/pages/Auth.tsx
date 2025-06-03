
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import AuthContainer from '@/components/auth/AuthContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <AuthContainer>
      <AuthHeader />
      
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-amber-400/20 mb-6">
          <TabsTrigger value="signin" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            Masuk
          </TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            Daftar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <SignInForm />
          <div className="mt-4">
            <GoogleSignInButton />
          </div>
        </TabsContent>

        <TabsContent value="signup">
          <SignUpForm />
          <div className="mt-4">
            <GoogleSignInButton />
          </div>
        </TabsContent>
      </Tabs>
    </AuthContainer>
  );
};

export default Auth;
