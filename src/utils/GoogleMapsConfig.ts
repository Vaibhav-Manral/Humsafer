/**
 * Centralized Google Maps configuration to ensure consistency across all components
 * and prevent conflicts when loading the Google Maps API with different library configurations.
 */

// All Google Maps libraries used across the application
export const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = [
  "places",
  "geometry",
];

// Standard Google Maps loader configuration
export const GOOGLE_MAPS_LOADER_ID = "google-map-script";

// Simple approach: use a consistent loader ID
export const getGoogleMapsLoaderId = () => {
  return GOOGLE_MAPS_LOADER_ID;
};
