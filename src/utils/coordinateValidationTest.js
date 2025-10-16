// Test script to validate coordinate filtering logic
// Run this in browser console to test

const isValidGPSCoordinate = (lat, lng) => {
  // Check if coordinates are within valid GPS ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return false;
  }

  // Filter out coordinates that are very close to 0,0 (likely invalid/relative coordinates)
  // Increased threshold to catch coordinates like 0.24, 0.48, etc. that are still invalid
  const MIN_COORDINATE_THRESHOLD = 5.0;

  // If both coordinates are very small, it's likely invalid
  if (
    Math.abs(lat) < MIN_COORDINATE_THRESHOLD &&
    Math.abs(lng) < MIN_COORDINATE_THRESHOLD
  ) {
    return false;
  }

  // Additional check: if coordinates are in the middle of the ocean near 0,0
  // (Gulf of Guinea, off the coast of Africa), they're likely invalid for Indian shipments
  if (Math.abs(lat) < 5 && Math.abs(lng) < 5) {
    return false;
  }

  return true;
};

// Test with your actual coordinates
const testCoordinates = [
  { lat: 7.707e-5, lng: 2.9607e-4, description: "Timeline 1" },
  { lat: 0.24101296, lng: 0.92590432, description: "Timeline 2" },
  { lat: 0.48197396, lng: 1.85160901, description: "Timeline 3" },
  { lat: 18.9581934, lng: 72.8320729, description: "Mumbai (SOURCE)" },
  {
    lat: 28.7040592,
    lng: 77.10249019999999,
    description: "Delhi (DESTINATION)",
  },
];

console.log("Coordinate Validation Test Results:");
console.log("=====================================");

testCoordinates.forEach((coord) => {
  const isValid = isValidGPSCoordinate(coord.lat, coord.lng);
  console.log(
    `${coord.description}: lat=${coord.lat}, lng=${coord.lng} -> ${
      isValid ? "VALID" : "INVALID"
    }`
  );
});

console.log("\nExpected results:");
console.log("Timeline 1, 2, 3 should be INVALID");
console.log("Mumbai and Delhi should be VALID");
