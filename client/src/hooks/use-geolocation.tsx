import { useState, useEffect } from 'react';
import { LocationData } from '@/lib/types';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>({
    city: 'Burlington',
    state: 'North Carolina', 
    country: 'United States',
    fullLocation: 'Burlington, North Carolina'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsLoading(false);
      return;
    }

    const success = async (position: GeolocationPosition) => {
      try {
        const { latitude, longitude } = position.coords;
        
        // Use a reverse geocoding service (for demo, we'll use a mock response)
        // In production, you would use a real service like Google Maps API
        const mockLocation: LocationData = {
          city: 'Burlington',
          state: 'North Carolina', 
          country: 'United States',
          fullLocation: 'Burlington, North Carolina'
        };
        
        setLocation(mockLocation);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to get location details');
        setIsLoading(false);
      }
    };

    const errorCallback = (err: GeolocationPositionError) => {
      setError(err.message);
      setIsLoading(false);
      
      // Fallback to a default location
      setLocation({
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown', 
        fullLocation: 'Location not available'
      });
    };

    navigator.geolocation.getCurrentPosition(success, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000 // 10 minutes
    });
  }, []);

  return { location, isLoading, error };
}
