export interface TrainInfo {
  type: string;
  route: string;
  frequency: string;
  locomotive: string;
  consist: string;
  typicalCars: string;
  estimatedWeight: string;
  maxSpeed: string;
  estimatedLength: string;
  funFact: string;
  // Wikipedia article title — used to fetch thumbnail from the REST API at hover time
  wikiTitle: string;
  wikiUrl: string;
}

const TRAIN_DB: Record<string, TrainInfo> = {
  "California Zephyr": {
    type: "Long-Distance",
    route: "Chicago → Denver → Salt Lake City → Reno → Emeryville, CA",
    frequency: "Daily · 2,438 miles",
    locomotive: "Siemens SC-44 Charger / EMD P42DC Genesis",
    consist: "Superliner II double-deck (sleeper, diner, sightseer lounge, coach)",
    typicalCars: "12–16 cars",
    estimatedWeight: "4,500–5,500 tons",
    maxSpeed: "79 mph",
    estimatedLength: "~900–1,100 ft",
    funFact:
      "Passes through 10 states and 3 time zones. The Moffat Tunnel segment through the Rockies and the Sierra Nevada crossing are among the most scenic rail routes in the US.",
    wikiTitle: "California Zephyr",
    wikiUrl: "https://en.wikipedia.org/wiki/California_Zephyr",
  },
  "Empire Builder": {
    type: "Long-Distance",
    route: "Chicago → Milwaukee → St. Paul → Havre, MT → Spokane → Seattle / Portland",
    frequency: "Daily · 2,206–2,258 miles",
    locomotive: "Siemens SC-44 Charger / EMD P42DC Genesis",
    consist: "Superliner II double-deck (sleeper, diner, sightseer lounge, coach)",
    typicalCars: "12–14 cars",
    estimatedWeight: "4,000–5,000 tons",
    maxSpeed: "79 mph",
    estimatedLength: "~800–1,000 ft",
    funFact:
      "America's most-ridden long-distance train. Splits at Spokane — one section goes to Seattle, the other to Portland. Named after railway magnate James J. Hill.",
    wikiTitle: "Empire Builder",
    wikiUrl: "https://en.wikipedia.org/wiki/Empire_Builder",
  },
  "Southwest Chief": {
    type: "Long-Distance",
    route: "Chicago → Kansas City → Albuquerque → Los Angeles",
    frequency: "Daily · 2,265 miles",
    locomotive: "Siemens SC-44 Charger / EMD P42DC Genesis",
    consist: "Superliner II double-deck (sleeper, diner, sightseer lounge, coach)",
    typicalCars: "12–16 cars",
    estimatedWeight: "4,500–5,500 tons",
    maxSpeed: "90 mph (some segments)",
    estimatedLength: "~900–1,100 ft",
    funFact:
      "Successor to the iconic Super Chief. Passes through the Raton Pass (elevation 7,588 ft) and the Cajon Pass in Southern California.",
    wikiTitle: "Southwest Chief",
    wikiUrl: "https://en.wikipedia.org/wiki/Southwest_Chief",
  },
  "Lake Shore Limited": {
    type: "Long-Distance",
    route: "Chicago → Toledo → Cleveland → Buffalo → Albany → New York / Boston",
    frequency: "Daily · 959–1,017 miles",
    locomotive: "Siemens SC-44 Charger / EMD P42DC Genesis",
    consist: "Superliner II double-deck (sleeper, diner, coach) — splits at Albany",
    typicalCars: "12–16 cars",
    estimatedWeight: "3,500–5,000 tons",
    maxSpeed: "79–110 mph (NEC segments)",
    estimatedLength: "~800–1,000 ft",
    funFact:
      "The only train that directly connects the Chicago rail hub to New York City. Splits into a New York section and a Boston section at Albany.",
    wikiTitle: "Lake Shore Limited",
    wikiUrl: "https://en.wikipedia.org/wiki/Lake_Shore_Limited",
  },
  "Capitol Limited": {
    type: "Long-Distance",
    route: "Chicago → Toledo → Pittsburgh → Cumberland → Washington, D.C.",
    frequency: "Daily · 764 miles",
    locomotive: "Siemens SC-44 Charger / EMD P42DC Genesis",
    consist: "Superliner II double-deck (sleeper, diner, coach)",
    typicalCars: "8–12 cars",
    estimatedWeight: "3,000–4,000 tons",
    maxSpeed: "79 mph",
    estimatedLength: "~650–850 ft",
    funFact:
      "Passes through the Allegheny Mountains via the famous Horseshoe Curve near Altoona — a National Historic Landmark and one of the most storied rail curves in America.",
    wikiTitle: "Capitol Limited",
    wikiUrl: "https://en.wikipedia.org/wiki/Capitol_Limited_(Amtrak)",
  },
};

// Illinois Service train number ranges
const ILLINOIS_SERVICE_NUMBERS = new Set([
  "300","301","302","303","304","305","306","307","308","309",
  "350","351","352","353","354","355","356","357","358","359",
  "380","381","382","383","384","385","386","387","388","389",
  "390","391","392","393","394","395","396","397","398","399",
  "21","22",   // Illinois Zephyr / Carl Sandburg
  "58","59",   // City of New Orleans
]);

const ILLINOIS_SERVICE: TrainInfo = {
  type: "State-Supported (Illinois DOT)",
  route: "Chicago hub — Quincy / St. Louis / Carbondale / Milwaukee corridors",
  frequency: "Multiple daily departures",
  locomotive: "Siemens SC-44 Charger",
  consist: "Horizon Fleet — single-level coach and café cars",
  typicalCars: "4–6 cars",
  estimatedWeight: "800–1,200 tons",
  maxSpeed: "110 mph (upgraded segments)",
  estimatedLength: "~350–550 ft",
  funFact:
    "One of the most successful state-funded rail corridors in the US. Illinois DOT invested heavily in track upgrades between Chicago and St. Louis to support 110 mph service.",
  wikiTitle: "Amtrak Illinois Service",
  wikiUrl: "https://en.wikipedia.org/wiki/Amtrak_Illinois_Service",
};

export function getTrainInfo(trainNumber: string, trainName: string): TrainInfo | null {
  if (ILLINOIS_SERVICE_NUMBERS.has(trainNumber)) return ILLINOIS_SERVICE;
  return TRAIN_DB[trainName] ?? null;
}
