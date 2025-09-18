import { Globe, MapPin, HandHeart, Users, Smile, TreePine, Coffee } from 'lucide-react';
import { PostFilters } from '@/lib/types';
import { LocationData } from '@/lib/types';

interface FilterBarProps {
  activeFilter: string;
  location: LocationData | null;
  onFilterChange: (filter: string, filters: PostFilters) => void;
}

export function FilterBar({ activeFilter, location, onFilterChange }: FilterBarProps) {
  const handleFilterClick = (filter: string, filters: PostFilters = {}) => {
    onFilterChange(filter, filters);
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="py-3 overflow-x-auto scrollbar-hide" style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex space-x-2 w-max pb-1 pl-4 pr-4">
          <button 
          className={`filter-chip ${activeFilter === 'global' ? 'active' : ''}`}
          onClick={() => handleFilterClick('global')}
          data-testid="filter-global"
        >
          <Globe size={12} className="mr-1" />
          Global
        </button>
        
          {location && (
            <button 
              className={`filter-chip ${activeFilter === 'local' ? 'active' : ''}`}
              onClick={() => handleFilterClick('local', { city: location.city })}
              data-testid="filter-local"
            >
              <MapPin size={12} className="mr-1" />
              {location.city}
            </button>
          )}
          
          <button 
            className={`filter-chip ${activeFilter === 'helping' ? 'active' : ''}`}
            onClick={() => handleFilterClick('helping', { category: 'Helping Others' })}
            data-testid="filter-helping"
          >
            <HandHeart size={12} className="mr-1" />
            Helping Others
          </button>
          
          <button 
            className={`filter-chip ${activeFilter === 'community' ? 'active' : ''}`}
            onClick={() => handleFilterClick('community', { category: 'Community Action' })}
            data-testid="filter-community"
          >
            <Users size={12} className="mr-1" />
            Community
          </button>
          
        </div>
      </div>
    </div>
  );
}
