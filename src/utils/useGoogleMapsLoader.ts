import { useState, useEffect } from "react";
import { Config } from "./Config";
import { GOOGLE_MAPS_LIBRARIES } from "./GoogleMapsConfig";

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  loadError: Error | null;
}

// Global state to track if Google Maps is already loaded
let isGoogleMapsLoaded = false;
let loadPromise: Promise<void> | null = null;
let currentLoadedApiKey: string | null = null;

export const useGoogleMapsLoader = (): GoogleMapsLoaderState => {
  const [state, setState] = useState<GoogleMapsLoaderState>({
    isLoaded: false,
    loadError: null,
  });

  useEffect(() => {
    const apiKey = Config.getInstance().getMapKeyConfig();

    // If Google Maps is already loaded with the same API key, mark as loaded
    if (isGoogleMapsLoaded && currentLoadedApiKey === apiKey && window.google) {
      setState({ isLoaded: true, loadError: null });
      return;
    }

    // If Google Maps is loaded with a different API key, we need to reload the page
    if (isGoogleMapsLoaded && currentLoadedApiKey !== apiKey) {
      console.warn("Google Maps API key changed. Page reload required.");
      setState({
        isLoaded: false,
        loadError: new Error("API key changed. Please reload the page."),
      });
      return;
    }

    // If already loading, wait for the existing promise
    if (loadPromise) {
      loadPromise
        .then(() => setState({ isLoaded: true, loadError: null }))
        .catch((error) => setState({ isLoaded: false, loadError: error }));
      return;
    }

    // Load Google Maps API
    loadPromise = loadGoogleMapsAPI(apiKey);
    loadPromise
      .then(() => {
        isGoogleMapsLoaded = true;
        currentLoadedApiKey = apiKey;
        setState({ isLoaded: true, loadError: null });
      })
      .catch((error) => {
        setState({ isLoaded: false, loadError: error });
        loadPromise = null; // Reset so we can try again
      });
  }, []);

  return state;
};

const loadGoogleMapsAPI = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${GOOGLE_MAPS_LIBRARIES.join(
      ","
    )}&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        reject(new Error("Google Maps API failed to load"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps API script"));
    };

    // Add script to document
    document.head.appendChild(script);
  });
};
