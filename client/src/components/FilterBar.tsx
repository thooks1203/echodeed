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
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide" style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex space-x-2 w-max pb-1">
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
          
          <button 
            className={`filter-chip ${activeFilter === 'positivity' ? 'active' : ''}`}
            onClick={() => handleFilterClick('positivity', { category: 'Spreading Positivity' })}
            data-testid="filter-positivity"
          >
            <Smile size={12} className="mr-1" />
            Positivity
          </button>
          
          <button 
            className={`filter-chip ${activeFilter === 'environmental' ? 'active' : ''}`}
            onClick={() => handleFilterClick('environmental', { category: 'Environmental' })}
            data-testid="filter-environmental"
          >
            <TreePine size={12} className="mr-1" />
            Environmental
          </button>
          
          <button 
            className={`filter-chip ${activeFilter === 'random' ? 'active' : ''}`}
            onClick={() => handleFilterClick('random', { category: 'Random Acts' })}
            data-testid="filter-random"
          >
            <Coffee size={12} className="mr-1" />
            Random Acts
          </button>
        </div>
      </div>
    </div>
  );
}
