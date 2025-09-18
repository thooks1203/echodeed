import { Plus, Heart } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110 px-4 py-3 gap-2 font-semibold text-sm animate-pulse"
      data-testid="button-post-deed"
      style={{
        minWidth: 'auto',
        height: 'auto',
      }}
    >
      <Heart size={18} className="fill-current" />
      <span>Share Kindness</span>
    </button>
  );
}
