
// Generate realistic historical EV charging station data with dynamic temporal patterns
export interface HistoricalDataPoint {
  timestamp: number;
  stationId: number;
  hour: number;
  dayOfWeek: number;
  isWeekend: boolean;
  weatherTemp: number;
  weatherCondition: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
  trafficLevel: number; // 0-1
  nearbyEvents: number; // number of events nearby
  holidayFactor: number; // 0-1
  actualUsage: number; // 0-1 (target variable)
  availableSlots: number;
  waitTime: number;
}

export interface StationFeatures {
  id: number;
  popularityScore: number;
  maintenanceLevel: number;
  priceLevel: number;
  areaType: 'residential' | 'commercial' | 'tech' | 'entertainment';
  capacity: number;
  distanceFromCityCenter: number; // km from city center
  isHighwayStation: boolean;
  hasAmenities: boolean; // restaurants, shops nearby
  parkingAvailability: number; // 0-1
  locationDensity: 'urban' | 'suburban' | 'rural';
  // New dynamic pattern properties
  peakHours: number[]; // Array of peak hours for this station
  baseOccupancy: number; // Base occupancy level (0-1)
  volatility: number; // How much usage varies (0-1)
}

// Enhanced station data with realistic dynamic patterns
export const enhancedBangaloreStations: StationFeatures[] = [
  {
    id: 1, // Koramangala Hub - City center, high variability
    popularityScore: 0.95,
    maintenanceLevel: 0.1,
    priceLevel: 0.75,
    areaType: "commercial",
    capacity: 8,
    distanceFromCityCenter: 2.1,
    isHighwayStation: false,
    hasAmenities: true,
    parkingAvailability: 0.4,
    locationDensity: 'urban',
    peakHours: [8, 9, 13, 18, 19, 20],
    baseOccupancy: 0.45,
    volatility: 0.4
  },
  {
    id: 2, // Electronic City Express - Tech corridor, work patterns
    popularityScore: 0.85,
    maintenanceLevel: 0.05,
    priceLevel: 0.6,
    areaType: "tech",
    capacity: 12,
    distanceFromCityCenter: 8.5,
    isHighwayStation: true,
    hasAmenities: true,
    parkingAvailability: 0.8,
    locationDensity: 'suburban',
    peakHours: [8, 9, 18, 19],
    baseOccupancy: 0.35,
    volatility: 0.35
  },
  {
    id: 3, // Whitefield Tech Park - Strong office patterns
    popularityScore: 0.9,
    maintenanceLevel: 0.15,
    priceLevel: 0.9,
    areaType: "tech",
    capacity: 10,
    distanceFromCityCenter: 15.2,
    isHighwayStation: false,
    hasAmenities: true,
    parkingAvailability: 0.7,
    locationDensity: 'suburban',
    peakHours: [9, 10, 18, 19, 20],
    baseOccupancy: 0.4,
    volatility: 0.45
  },
  {
    id: 4, // Indiranagar Central - Residential, evening peaks
    popularityScore: 0.75,
    maintenanceLevel: 0.25,
    priceLevel: 0.5,
    areaType: "residential",
    capacity: 6,
    distanceFromCityCenter: 4.8,
    isHighwayStation: false,
    hasAmenities: false,
    parkingAvailability: 0.6,
    locationDensity: 'urban',
    peakHours: [19, 20, 21],
    baseOccupancy: 0.25,
    volatility: 0.25
  },
  {
    id: 5, // JP Nagar Station - Residential, moderate patterns
    popularityScore: 0.7,
    maintenanceLevel: 0.08,
    priceLevel: 0.7,
    areaType: "residential",
    capacity: 8,
    distanceFromCityCenter: 3.2,
    isHighwayStation: false,
    hasAmenities: false,
    parkingAvailability: 0.5,
    locationDensity: 'urban',
    peakHours: [18, 19, 20],
    baseOccupancy: 0.3,
    volatility: 0.3
  },
  {
    id: 6, // Hebbal Flyover Point - Highway, consistent but low
    popularityScore: 0.6,
    maintenanceLevel: 0.3,
    priceLevel: 0.55,
    areaType: "commercial",
    capacity: 6,
    distanceFromCityCenter: 12.1,
    isHighwayStation: true,
    hasAmenities: false,
    parkingAvailability: 0.9,
    locationDensity: 'suburban',
    peakHours: [12, 13, 17, 18],
    baseOccupancy: 0.2,
    volatility: 0.15
  },
  {
    id: 7, // Marathahalli Bridge - Tech area, office patterns
    popularityScore: 0.8,
    maintenanceLevel: 0.12,
    priceLevel: 0.8,
    areaType: "tech",
    capacity: 10,
    distanceFromCityCenter: 11.8,
    isHighwayStation: false,
    hasAmenities: true,
    parkingAvailability: 0.6,
    locationDensity: 'suburban',
    peakHours: [8, 9, 18, 19],
    baseOccupancy: 0.35,
    volatility: 0.35
  },
  {
    id: 8, // Jayanagar Shopping Hub - Weekend busy
    popularityScore: 0.65,
    maintenanceLevel: 0.4,
    priceLevel: 0.45,
    areaType: "commercial",
    capacity: 4,
    distanceFromCityCenter: 2.8,
    isHighwayStation: false,
    hasAmenities: true,
    parkingAvailability: 0.3,
    locationDensity: 'urban',
    peakHours: [11, 12, 15, 16, 19],
    baseOccupancy: 0.4,
    volatility: 0.35
  },
  {
    id: 9, // Banashankari Terminal - Residential suburb
    popularityScore: 0.7,
    maintenanceLevel: 0.18,
    priceLevel: 0.65,
    areaType: "residential",
    capacity: 8,
    distanceFromCityCenter: 5.1,
    isHighwayStation: false,
    hasAmenities: false,
    parkingAvailability: 0.7,
    locationDensity: 'suburban',
    peakHours: [19, 20],
    baseOccupancy: 0.25,
    volatility: 0.2
  },
  {
    id: 10, // Bellandur Lake View - Tech residential mix
    popularityScore: 0.75,
    maintenanceLevel: 0.2,
    priceLevel: 0.6,
    areaType: "residential",
    capacity: 6,
    distanceFromCityCenter: 9.4,
    isHighwayStation: false,
    hasAmenities: false,
    parkingAvailability: 0.8,
    locationDensity: 'suburban',
    peakHours: [18, 19, 20],
    baseOccupancy: 0.3,
    volatility: 0.25
  },
  {
    id: 11, // MG Road Premium - Entertainment, evening peaks
    popularityScore: 0.95,
    maintenanceLevel: 0.05,
    priceLevel: 1.0,
    areaType: "entertainment",
    capacity: 6,
    distanceFromCityCenter: 1.2,
    isHighwayStation: false,
    hasAmenities: true,
    parkingAvailability: 0.2,
    locationDensity: 'urban',
    peakHours: [19, 20, 21, 22],
    baseOccupancy: 0.5,
    volatility: 0.4
  },
  {
    id: 12, // HSR Layout Corner - Residential, low key
    popularityScore: 0.68,
    maintenanceLevel: 0.22,
    priceLevel: 0.55,
    areaType: "residential",
    capacity: 5,
    distanceFromCityCenter: 6.3,
    isHighwayStation: false,
    hasAmenities: false,
    parkingAvailability: 0.6,
    locationDensity: 'suburban',
    peakHours: [19, 20],
    baseOccupancy: 0.22,
    volatility: 0.18
  }
];

// Generate realistic temporal patterns with proper hour-by-hour variation
function getTemporalPattern(hour: number, isWeekend: boolean): number {
  // Create realistic hourly patterns
  let pattern = 0;
  
  if (isWeekend) {
    // Weekend patterns - later starts, evening activity
    if (hour >= 0 && hour <= 5) pattern = 0.05; // Very low night
    else if (hour >= 6 && hour <= 8) pattern = 0.1; // Early morning
    else if (hour >= 9 && hour <= 11) pattern = 0.25; // Late morning pickup
    else if (hour >= 12 && hour <= 14) pattern = 0.35; // Lunch time
    else if (hour >= 15 && hour <= 17) pattern = 0.4; // Afternoon
    else if (hour >= 18 && hour <= 20) pattern = 0.45; // Evening peak
    else if (hour >= 21 && hour <= 22) pattern = 0.3; // Night activity
    else pattern = 0.15; // Late night
  } else {
    // Weekday patterns - clear commute peaks
    if (hour >= 0 && hour <= 5) pattern = 0.03; // Very low night
    else if (hour >= 6 && hour <= 7) pattern = 0.15; // Early commute start
    else if (hour >= 8 && hour <= 9) pattern = 0.6; // Morning peak
    else if (hour >= 10 && hour <= 11) pattern = 0.35; // Post-morning
    else if (hour >= 12 && hour <= 14) pattern = 0.4; // Lunch peak
    else if (hour >= 15 && hour <= 16) pattern = 0.35; // Afternoon
    else if (hour >= 17 && hour <= 19) pattern = 0.65; // Evening peak (highest)
    else if (hour >= 20 && hour <= 21) pattern = 0.4; // Post-work
    else if (hour >= 22 && hour <= 23) pattern = 0.2; // Late evening
    else pattern = 0.1; // Other times
  }
  
  return pattern;
}

// Generate station-specific occupancy with realistic temporal dynamics
function generateStationOccupancy(
  station: StationFeatures, 
  hour: number, 
  dayOfWeek: number, 
  weatherCondition: string,
  trafficLevel: number,
  randomSeed: number
): number {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Start with base temporal pattern
  let occupancy = getTemporalPattern(hour, isWeekend);
  
  // Apply station's base occupancy level
  occupancy = occupancy * 0.7 + station.baseOccupancy * 0.3;
  
  // Peak hour multipliers for this specific station
  const isPeakHour = station.peakHours.includes(hour);
  if (isPeakHour) {
    occupancy *= 1.4; // Boost during station's peak hours
  }
  
  // Area type specific patterns
  switch (station.areaType) {
    case 'tech':
      if (!isWeekend) {
        if (hour >= 9 && hour <= 10) occupancy *= 1.3; // Tech workers arrive later
        if (hour >= 18 && hour <= 20) occupancy *= 1.4; // Stay late
        if (hour >= 12 && hour <= 14) occupancy *= 1.1; // Lunch charging
      } else {
        occupancy *= 0.4; // Much lower on weekends
      }
      break;
      
    case 'commercial':
      if (hour >= 10 && hour <= 21) occupancy *= 1.2; // Business hours
      if (isWeekend && hour >= 11 && hour <= 19) occupancy *= 1.3; // Weekend shopping
      break;
      
    case 'entertainment':
      if (hour >= 18 && hour <= 23) occupancy *= 1.5; // Evening entertainment
      if (isWeekend) occupancy *= 1.2; // Weekend boost
      if (hour >= 0 && hour <= 6) occupancy *= 0.3; // Very low at night
      break;
      
    case 'residential':
      if (hour >= 18 && hour <= 22) occupancy *= 1.3; // Evening home charging
      if (hour >= 7 && hour <= 9 && !isWeekend) occupancy *= 1.2; // Morning commute
      if (hour >= 0 && hour <= 6) occupancy *= 0.2; // Very low at night
      break;
  }
  
  // Location effects
  if (station.locationDensity === 'urban') {
    occupancy *= 1.1; // Urban stations slightly busier
    if (hour >= 22 || hour <= 6) occupancy *= 1.2; // Some night activity in urban areas
  } else if (station.locationDensity === 'rural') {
    occupancy *= 0.8; // Rural stations less busy
    if (hour >= 22 || hour <= 6) occupancy *= 0.5; // Very quiet at night
  }
  
  // Highway stations have different patterns
  if (station.isHighwayStation) {
    occupancy *= 0.9; // Generally lower but more consistent
    if (hour >= 6 && hour <= 22) occupancy *= 1.1; // Slight boost during travel hours
  }
  
  // Distance from city center effect
  const distanceEffect = 1.0 - (station.distanceFromCityCenter / 20) * 0.3;
  occupancy *= distanceEffect;
  
  // External factors
  occupancy += trafficLevel * 0.1; // Higher traffic = slightly more usage
  
  // Weather effects
  if (weatherCondition === 'rainy' || weatherCondition === 'stormy') {
    occupancy *= 1.1; // People avoid walking in bad weather
  }
  
  // Station specific factors
  occupancy *= (0.8 + station.popularityScore * 0.4); // Popular stations busier
  occupancy *= (1.0 - station.maintenanceLevel * 0.3); // Maintenance reduces usage
  occupancy *= (1.1 - station.priceLevel * 0.2); // Higher prices reduce usage
  
  // Add realistic randomness based on station volatility
  const randomFactor = 1.0 + (randomSeed - 0.5) * 2 * station.volatility;
  occupancy *= randomFactor;
  
  // Ensure realistic bounds and account for capacity
  occupancy = Math.max(0.01, Math.min(0.95, occupancy));
  
  return occupancy;
}

// Generate historical data with realistic temporal patterns
export function generateHistoricalData(stations: StationFeatures[]): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const days = 90;
  const hoursPerDay = 24;
  
  console.log('🎯 Generating realistic temporal patterns...');
  
  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - day));
    
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const timestamp = date.getTime() + (hour * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Generate weather with seasonal patterns
      const seasonalTemp = 25 + Math.sin((day / 365) * 2 * Math.PI) * 8;
      const weatherTemp = seasonalTemp + (Math.random() - 0.5) * 6;
      const weatherConditions: ('sunny' | 'rainy' | 'cloudy' | 'stormy')[] = ['sunny', 'rainy', 'cloudy', 'stormy'];
      const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      // Realistic traffic patterns
      let trafficLevel = 0.15; // Base traffic
      if (!isWeekend) {
        if (hour >= 8 && hour <= 9) trafficLevel += 0.5; // Morning rush
        if (hour >= 17 && hour <= 19) trafficLevel += 0.6; // Evening rush
        if (hour >= 12 && hour <= 14) trafficLevel += 0.2; // Lunch traffic
      } else {
        if (hour >= 10 && hour <= 20) trafficLevel += 0.2; // Weekend activity
      }
      trafficLevel = Math.min(1, trafficLevel + (Math.random() - 0.5) * 0.1);
      
      const nearbyEvents = Math.random() < 0.05 ? Math.floor(Math.random() * 2) : 0;
      const holidayFactor = Math.random() < 0.02 ? Math.random() * 0.3 : 0;
      
      stations.forEach(station => {
        // Generate unique random seed for this station/time combination
        const randomSeed = Math.sin(station.id * 1000 + day * 24 + hour) * 0.5 + 0.5;
        
        const actualUsage = generateStationOccupancy(
          station,
          hour,
          dayOfWeek,
          weatherCondition,
          trafficLevel,
          randomSeed
        );
        
        const availableSlots = Math.max(0, Math.floor(station.capacity * (1 - actualUsage)));
        const waitTime = actualUsage > 0.8 ? Math.floor((actualUsage - 0.8) * 60) : 0;
        
        data.push({
          timestamp,
          stationId: station.id,
          hour,
          dayOfWeek,
          isWeekend,
          weatherTemp,
          weatherCondition,
          trafficLevel,
          nearbyEvents,
          holidayFactor,
          actualUsage,
          availableSlots,
          waitTime
        });
      });
    }
  }
  
  console.log(`📊 Generated ${data.length} data points with realistic temporal patterns`);
  return data;
}

// Enhanced weather simulation with realistic patterns
export function getCurrentWeather() {
  const hour = new Date().getHours();
  const season = Math.floor((new Date().getMonth() + 1) / 3);
  
  let baseTemp = 25;
  if (season === 0 || season === 3) baseTemp = 22;
  if (season === 1) baseTemp = 30;
  if (season === 2) baseTemp = 26;
  
  const dailyVariation = Math.sin((hour / 24) * 2 * Math.PI) * 5;
  const temperature = baseTemp + dailyVariation + (Math.random() - 0.5) * 3;
  
  const conditions = ['sunny', 'cloudy', 'rainy'];
  const conditionWeights = season === 2 ? [0.3, 0.4, 0.3] : [0.6, 0.3, 0.1];
  
  const rand = Math.random();
  let condition = 'sunny';
  let cumulative = 0;
  for (let i = 0; i < conditions.length; i++) {
    cumulative += conditionWeights[i];
    if (rand <= cumulative) {
      condition = conditions[i];
      break;
    }
  }
  
  return {
    temperature,
    condition: condition as 'sunny' | 'cloudy' | 'rainy',
    humidity: season === 2 ? 0.7 + Math.random() * 0.2 : 0.4 + Math.random() * 0.3
  };
}

// Enhanced traffic simulation with realistic temporal patterns
export function getCurrentTraffic() {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const isWeekend = [0, 6].includes(dayOfWeek);
  
  let trafficLevel = 0.15; // Base traffic
  
  if (!isWeekend) {
    if (hour >= 8 && hour <= 9) trafficLevel += 0.5;
    if (hour >= 17 && hour <= 19) trafficLevel += 0.6;
    if (hour >= 12 && hour <= 14) trafficLevel += 0.2;
  } else {
    if (hour >= 10 && hour <= 20) trafficLevel += 0.2;
  }
  
  trafficLevel += (Math.random() - 0.5) * 0.1;
  return Math.max(0.1, Math.min(1, trafficLevel));
}
