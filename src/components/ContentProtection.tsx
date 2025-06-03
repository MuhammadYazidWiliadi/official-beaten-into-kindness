
import { useEffect } from 'react';

interface ContentProtectionProps {
  children: React.ReactNode;
}

const ContentProtection = ({ children }: ContentProtectionProps) => {
  useEffect(() => {
    // Disable right-click context menu
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const disableTextSelection = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.setProperty('-ms-user-select', 'none');
      document.body.style.setProperty('-moz-user-select', 'none');
    };

    // Disable keyboard shortcuts
    const disableKeyboard = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect DevTools
    const detectDevTools = () => {
      const threshold = 160;
      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          console.clear();
          console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis is a browser feature intended for developers. Content is protected.', 'color: red; font-size: 16px;');
        }
      }, 500);
    };

    // Apply protections
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeyboard);
    disableTextSelection();
    detectDevTools();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeyboard);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.setProperty('-ms-user-select', '');
      document.body.style.setProperty('-moz-user-select', '');
    };
  }, []);

  return <>{children}</>;
};

export default ContentProtection;
