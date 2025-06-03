
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AuthContainerProps {
  children: ReactNode;
}

const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-purple-100/10 border-purple-300/20 p-8">
        {children}
      </Card>
    </div>
  );
};

export default AuthContainer;
