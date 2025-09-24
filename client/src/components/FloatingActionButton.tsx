import { Plus, Heart } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="fixed bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 px-4 py-3 gap-2 font-semibold text-sm animate-pulse"
      data-testid="button-post-deed"
      style={{
        right: '50%', // Center horizontally 
        transform: 'translateX(50%)', // Adjust for centering
        bottom: '140px', // Position above bottom navigation
        zIndex: 1000, // Higher than other elements
        minWidth: 'auto',
        height: 'auto',
      }}
    >
      <Heart size={18} className="fill-current" />
      <span>Share Kindness</span>
    </button>
  );
}
