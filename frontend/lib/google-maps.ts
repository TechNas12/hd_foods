import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let isConfigured = false;

/**
 * Loads the necessary Google Maps libraries using the new functional API.
 * Safe for SSR (only executes on the client).
 */
export const loadGoogleMaps = async () => {
  if (typeof window === 'undefined') return null;

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API Key is missing! Check your .env.local file.');
    throw new Error('Google Maps API Key is missing.');
  }

  if (!isConfigured) {
    setOptions({
      key: GOOGLE_MAPS_API_KEY,
      v: 'weekly',
    });
    isConfigured = true;
  }

  // Load the libraries and return them
  const [maps, places, geocoding] = await Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('geocoding'),
  ]) as [google.maps.MapsLibrary, google.maps.PlacesLibrary, google.maps.GeocodingLibrary];

  return { maps, places, geocoding };
};
