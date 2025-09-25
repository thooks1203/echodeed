import { Plus, Heart } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="fixed bg-gradient-to-r from-red-400 to-yellow-400 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 px-4 py-3 gap-2 font-semibold text-sm animate-pulse"
      data-testid="button-post-deed"
      style={{
        right: '16px', 
        bottom: '75px', // Closer to feed content, just above bottom nav
        zIndex: 1000, 
        minWidth: 'auto',
        height: 'auto',
      }}
    >
      <Heart size={18} className="fill-current" />
      <span>Share Kindness</span>
    </button>
  );
}
