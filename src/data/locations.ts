// World locations the player can travel to and enter.
// Coordinates are world-space [x, y, z] in metres (1 unit = 1 m).

export type LocationKey = "home" | "school" | "market" | "cafe" | "pagoda" | "ricefield" | "hotel" | "townhall" | "stadium" | "volleyball";

// Preset locations in the Kampong Cham miniature world & Sports City
export const LOCATION_COORDINATES: Record<LocationKey, [number, number, number]> = {
  home: [-14, 0, -20],
  school: [0, 0, -2],
  market: [13, 0, -12],
  cafe: [-6, 0, -12],
  pagoda: [-11, 0, 18], // Pagoda main entrance gate
  ricefield: [-34, 0, 18],
  hotel: [18, 0, -22],
  townhall: [-42, 0, -10],
  stadium: [-26, 0, 95], // Olympic Football Stadium center spot
  volleyball: [26, 0, 92], // Sports City Volleyball Court center
};
