
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  chapterTitle: string;
  chapterId: string;
}

const ShareModal = ({ isOpen, onClose, selectedText, chapterTitle, chapterId }: ShareModalProps) => {
  const [customMessage, setCustomMessage] = useState('');

  const shareText = selectedText || `Baca "${chapterTitle}" di Beaten Into Kindness`;
  const shareUrl = `${window.location.origin}/chapter/${chapterId}`;

  const handleShare = (platform: string) => {
    const message = customMessage || shareText;
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${message} ${shareUrl}`);
        toast({
          title: "Berhasil!",
          description: "Link telah disalin ke clipboard",
        });
        onClose();
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-amber-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-amber-400">Bagikan Konten</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedText && (
            <div className="p-4 bg-gray-800 rounded-lg border border-amber-400/20">
              <p className="text-sm text-gray-300 italic">"{selectedText}"</p>
              <p className="text-xs text-amber-400 mt-2">- {chapterTitle}</p>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Pesan Kustom (Opsional)
            </label>
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Tambahkan pesan Anda..."
              className="bg-gray-800 border-amber-400/20 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Twitter/X
            </Button>
            <Button
              onClick={() => handleShare('whatsapp')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Facebook
            </Button>
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
            >
              Salin Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
