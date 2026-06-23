// Fork this file to configure ClearPath for your town.
// Add your grade crossings with FRA crossing IDs and coordinates.

export interface Crossing {
  id: string;         // FRA crossing ID
  name: string;       // Human-readable name
  lat: number;
  lng: number;
  street: string;
  alternateRouteNote?: string;
}

export interface TownConfig {
  name: string;
  state: string;
  lat: number;        // Map center
  lng: number;
  zoom: number;
  crossings: Crossing[];
  // Amtrak train numbers that pass through this town
  watchTrains: string[];
  viaductNote?: string;
}

const config: TownConfig = {
  name: "Mendota",
  state: "IL",
  lat: 41.5514,
  lng: -89.1234,
  zoom: 14,
  // California Zephyr (5/6), Empire Builder, and Illinois Service trains on the Chicago corridor
  // Illinois Zephyr/Carl Sandburg (300–303, 381, 383, 390, 391) added for full local coverage
  watchTrains: ["7", "8", "5", "6", "300", "301", "302", "303", "381", "383", "390", "391"],
  viaductNote: "Fourth Ave Viaduct (13′2″ clearance) — NOT suitable for aerial/ladder trucks or heavy apparatus",
  crossings: [
    {
      id: "077482T",
      name: "Illinois Rte 51 / Meriden-Mendota Rd",
      lat: 41.5497,
      lng: -89.1178,
      street: "IL-51",
    },
    {
      id: "077483Z",
      name: "Main St",
      lat: 41.5511,
      lng: -89.1220,
      street: "Main St",
      alternateRouteNote: "Blocked? Use 4th Ave Viaduct — 13′2″ max height",
    },
    {
      id: "077484F",
      name: "Sixth Ave",
      lat: 41.5518,
      lng: -89.1255,
      street: "Sixth Ave",
    },
    {
      id: "077485L",
      name: "Washington St / IL-251",
      lat: 41.5526,
      lng: -89.1298,
      street: "IL-251",
    },
  ],
};

export default config;
