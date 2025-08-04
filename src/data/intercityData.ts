// Intercity destinations and highway charging stations

export interface IntercityDestination {
  id: string;
  name: string;
  city: string;
  coordinates: [number, number];
  distanceFromBangalore: number; // km
  estimatedDriveTime: number; // hours
  description: string;
  highways: string[];
}

export interface HighwayChargingStation {
  id: string;
  name: string;
  location: string;
  highway: string;
  coordinates: [number, number];
  distanceFromBangalore: number; // km
  type: 'fast-charging' | 'battery-swap' | 'ultra-fast';
  chargingPower: number; // kW
  connectorTypes: string[];
  amenities: string[];
  price: number; // ₹ per kWh
  operatingHours: string;
  safetyRating: number; // 1-5
}

// Major intercity destinations
export const INTERCITY_DESTINATIONS: IntercityDestination[] = [
  {
    id: 'hyderabad-hitec',
    name: 'HITEC City',
    city: 'Hyderabad',
    coordinates: [17.4485, 78.3908],
    distanceFromBangalore: 569,
    estimatedDriveTime: 8.5,
    description: 'IT and business hub of Hyderabad',
    highways: ['NH44', 'Outer Ring Road']
  },
  {
    id: 'hyderabad-charminar',
    name: 'Charminar',
    city: 'Hyderabad',
    coordinates: [17.3616, 78.4747],
    distanceFromBangalore: 574,
    estimatedDriveTime: 8.7,
    description: 'Historic monument and cultural center',
    highways: ['NH44', 'Inner Ring Road']
  },
  {
    id: 'mumbai-bkc',
    name: 'Bandra Kurla Complex',
    city: 'Mumbai',
    coordinates: [19.0607, 72.8697],
    distanceFromBangalore: 987,
    estimatedDriveTime: 14.5,
    description: 'Financial and business district',
    highways: ['NH48', 'Western Express Highway']
  },
  {
    id: 'mumbai-gateway',
    name: 'Gateway of India',
    city: 'Mumbai',
    coordinates: [18.9220, 72.8347],
    distanceFromBangalore: 994,
    estimatedDriveTime: 14.8,
    description: 'Iconic monument and tourist attraction',
    highways: ['NH48', 'Marine Drive']
  },
  {
    id: 'chennai-it-corridor',
    name: 'IT Corridor (OMR)',
    city: 'Chennai',
    coordinates: [12.8406, 80.1534],
    distanceFromBangalore: 346,
    estimatedDriveTime: 5.2,
    description: 'Information Technology corridor',
    highways: ['NH48', 'OMR']
  },
  {
    id: 'chennai-marina',
    name: 'Marina Beach',
    city: 'Chennai',
    coordinates: [13.0475, 80.2824],
    distanceFromBangalore: 352,
    estimatedDriveTime: 5.5,
    description: 'World\'s second longest urban beach',
    highways: ['NH48', 'ECR']
  }
];

// Strategic highway charging stations
export const HIGHWAY_CHARGING_STATIONS: HighwayChargingStation[] = [
  // Bangalore to Hyderabad (NH44)
  {
    id: 'nh44-kolar',
    name: 'Kolar Gold Fields Charging Hub',
    location: 'Kolar, Karnataka',
    highway: 'NH44',
    coordinates: [13.1367, 78.1297],
    distanceFromBangalore: 68,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Restaurant', 'Restroom', 'WiFi', 'Parking'],
    price: 12,
    operatingHours: '24/7',
    safetyRating: 4.5
  },
  {
    id: 'nh44-anantapur',
    name: 'Anantapur Highway Station',
    location: 'Anantapur, Andhra Pradesh',
    highway: 'NH44',
    coordinates: [14.6819, 77.6006],
    distanceFromBangalore: 208,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Food Court', 'Hotel', 'Fuel Station', 'ATM'],
    price: 15,
    operatingHours: '24/7',
    safetyRating: 4.8
  },
  {
    id: 'nh44-kurnool',
    name: 'Kurnool Express Charging',
    location: 'Kurnool, Andhra Pradesh', 
    highway: 'NH44',
    coordinates: [15.8281, 78.0373],
    distanceFromBangalore: 286,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Restaurant', 'Restroom', 'Shopping'],
    price: 13,
    operatingHours: '6:00 AM - 11:00 PM',
    safetyRating: 4.2
  },
  {
    id: 'nh44-mahabubnagar',
    name: 'Mahabubnagar Power Hub',
    location: 'Mahabubnagar, Telangana',
    highway: 'NH44',
    coordinates: [16.7460, 77.9982],
    distanceFromBangalore: 376,
    type: 'battery-swap',
    chargingPower: 22,
    connectorTypes: ['Battery Swap', 'Type 2'],
    amenities: ['Mechanic', 'Restroom', 'Snacks'],
    price: 10,
    operatingHours: '24/7',
    safetyRating: 4.0
  },
  {
    id: 'nh44-shamshabad',
    name: 'Shamshabad Airport Charging',
    location: 'Shamshabad, Telangana',
    highway: 'NH44',
    coordinates: [17.2403, 78.4294],
    distanceFromBangalore: 502,
    type: 'ultra-fast',
    chargingPower: 180,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Airport Access', 'Hotel', 'Restaurant', 'WiFi'],
    price: 18,
    operatingHours: '24/7',
    safetyRating: 4.9
  },

  // Bangalore to Chennai (NH48)
  {
    id: 'nh48-hosur',
    name: 'Hosur Border Charging Point',
    location: 'Hosur, Tamil Nadu',
    highway: 'NH48',
    coordinates: [12.7409, 77.8253],
    distanceFromBangalore: 39,
    type: 'fast-charging',
    chargingPower: 50,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Restaurant', 'Restroom', 'Parking'],
    price: 11,
    operatingHours: '24/7',
    safetyRating: 4.3
  },
  {
    id: 'nh48-krishnagiri',
    name: 'Krishnagiri Hills Charging Station',
    location: 'Krishnagiri, Tamil Nadu',
    highway: 'NH48',
    coordinates: [12.5186, 78.2137],
    distanceFromBangalore: 89,
    type: 'ultra-fast',
    chargingPower: 120,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Hill View Restaurant', 'Resort', 'Fuel Station'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.6
  },
  {
    id: 'nh48-vellore',
    name: 'Vellore Fort Charging Hub',
    location: 'Vellore, Tamil Nadu',
    highway: 'NH48',
    coordinates: [12.9184, 79.1325],
    distanceFromBangalore: 142,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Historical Site', 'Restaurant', 'Hospital'],
    price: 12,
    operatingHours: '6:00 AM - 10:00 PM',
    safetyRating: 4.1
  },
  {
    id: 'nh48-kanchipuram',
    name: 'Kanchipuram Temple Charging',
    location: 'Kanchipuram, Tamil Nadu',
    highway: 'NH48',
    coordinates: [12.8342, 79.7036],
    distanceFromBangalore: 229,
    type: 'battery-swap',
    chargingPower: 22,
    connectorTypes: ['Battery Swap', 'Type 2'],
    amenities: ['Temple Visit', 'Local Food', 'Handicrafts'],
    price: 9,
    operatingHours: '5:00 AM - 10:00 PM',
    safetyRating: 4.0
  },
  {
    id: 'nh48-tambaram',
    name: 'Tambaram Junction Charging',
    location: 'Tambaram, Chennai',
    highway: 'NH48',
    coordinates: [12.9249, 80.1000],
    distanceFromBangalore: 318,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Railway Station', 'Shopping Mall', 'Food Court'],
    price: 16,
    operatingHours: '24/7',
    safetyRating: 4.7
  },

  // Bangalore to Mumbai (NH48 - Western Route)
  {
    id: 'nh48-tumkur',
    name: 'Tumkur University Charging',
    location: 'Tumkur, Karnataka',
    highway: 'NH48',
    coordinates: [13.3379, 77.1186],
    distanceFromBangalore: 70,
    type: 'fast-charging',
    chargingPower: 50,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['University Campus', 'Restaurant', 'Library'],
    price: 11,
    operatingHours: '6:00 AM - 11:00 PM',
    safetyRating: 4.2
  },
  {
    id: 'nh48-chitradurga',
    name: 'Chitradurga Fort Charging Hub',
    location: 'Chitradurga, Karnataka',
    highway: 'NH48',
    coordinates: [14.2251, 76.3980],
    distanceFromBangalore: 202,
    type: 'ultra-fast',
    chargingPower: 120,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Historical Fort', 'Museum', 'Restaurant'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.4
  },
  {
    id: 'nh48-davangere',
    name: 'Davangere Express Charging',
    location: 'Davangere, Karnataka',
    highway: 'NH48',
    coordinates: [14.4644, 75.9218],
    distanceFromBangalore: 264,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Cotton Market', 'Local Food', 'Parking'],
    price: 12,
    operatingHours: '24/7',
    safetyRating: 4.1
  },
  {
    id: 'nh48-hubli',
    name: 'Hubli Junction Power Station',
    location: 'Hubli, Karnataka',
    highway: 'NH48',
    coordinates: [15.3647, 75.1240],
    distanceFromBangalore: 410,
    type: 'ultra-fast',
    chargingPower: 180,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Railway Junction', 'Hotel', 'Shopping'],
    price: 15,
    operatingHours: '24/7',
    safetyRating: 4.6
  },
  {
    id: 'nh48-belagavi',
    name: 'Belagavi Border Charging',
    location: 'Belagavi, Karnataka',
    highway: 'NH48',
    coordinates: [15.8497, 74.4977],
    distanceFromBangalore: 502,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['State Border', 'Restaurant', 'Fuel Station'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.3
  },
  {
    id: 'nh48-kolhapur',
    name: 'Kolhapur Mahalaxmi Charging',
    location: 'Kolhapur, Maharashtra',
    highway: 'NH48',
    coordinates: [16.7050, 74.2433],
    distanceFromBangalore: 592,
    type: 'battery-swap',
    chargingPower: 22,
    connectorTypes: ['Battery Swap', 'Type 2'],
    amenities: ['Temple', 'Local Food', 'Wrestling Arena'],
    price: 10,
    operatingHours: '5:00 AM - 11:00 PM',
    safetyRating: 4.2
  },
  {
    id: 'nh48-satara',
    name: 'Satara Hill Station Charging',
    location: 'Satara, Maharashtra',
    highway: 'NH48',
    coordinates: [17.6805, 74.0183],
    distanceFromBangalore: 694,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Hill Station', 'Resort', 'Nature Walks'],
    price: 16,
    operatingHours: '24/7',
    safetyRating: 4.5
  },
  {
    id: 'nh48-pune',
    name: 'Pune IT Park Charging Complex',
    location: 'Pune, Maharashtra',
    highway: 'NH48',
    coordinates: [18.5204, 73.8567],
    distanceFromBangalore: 844,
    type: 'ultra-fast',
    chargingPower: 200,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['IT Parks', 'Hotels', 'Shopping Malls', 'Airport'],
    price: 17,
    operatingHours: '24/7',
    safetyRating: 4.8
  },
  {
    id: 'nh48-lonavala',
    name: 'Lonavala Ghat Charging Point',
    location: 'Lonavala, Maharashtra',
    highway: 'NH48',
    coordinates: [18.7537, 73.4068],
    distanceFromBangalore: 912,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Hill Station', 'Caves', 'Restaurants'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.4
  },
  
  // Additional strategic stations along NH44 (Bangalore to Hyderabad route)
  {
    id: 'nh44-doddaballapur',
    name: 'Doddaballapur Highway Charging',
    location: 'Doddaballapur, Karnataka',
    highway: 'NH44',
    coordinates: [13.2271, 77.5344],
    distanceFromBangalore: 45,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Restaurant', 'Restroom', 'Parking'],
    price: 11,
    operatingHours: '24/7',
    safetyRating: 4.2
  },
  {
    id: 'nh44-chintamani',
    name: 'Chintamani Route Charging Hub',
    location: 'Chintamani, Karnataka',
    highway: 'NH44',
    coordinates: [13.4000, 78.0500],
    distanceFromBangalore: 110,
    type: 'ultra-fast',
    chargingPower: 120,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Food Court', 'Restroom', 'Fuel Station'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.5
  },
  {
    id: 'nh44-kadiri',
    name: 'Kadiri Express Charging Point',
    location: 'Kadiri, Andhra Pradesh',
    highway: 'NH44',
    coordinates: [14.1167, 78.1500],
    distanceFromBangalore: 160,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Restaurant', 'Hotel', 'ATM'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.3
  },
  {
    id: 'nh44-gooty',
    name: 'Gooty Junction Charging Station',
    location: 'Gooty, Andhra Pradesh',
    highway: 'NH44',
    coordinates: [15.1167, 77.6333],
    distanceFromBangalore: 320,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Railway Station', 'Restaurant', 'Medical'],
    price: 15,
    operatingHours: '24/7',
    safetyRating: 4.6
  },
  {
    id: 'nh44-nandyal',
    name: 'Nandyal Highway Power Hub',
    location: 'Nandyal, Andhra Pradesh',
    highway: 'NH44',
    coordinates: [15.4833, 78.4833],
    distanceFromBangalore: 410,
    type: 'battery-swap',
    chargingPower: 25,
    connectorTypes: ['Battery Swap', 'Type 2'],
    amenities: ['Quick Swap', 'Snacks', 'Restroom'],
    price: 10,
    operatingHours: '24/7',
    safetyRating: 4.1
  },

  // Additional strategic stations along NH48 (Bangalore to Chennai route)
  {
    id: 'nh48-anekal',
    name: 'Anekal Border Charging Point',
    location: 'Anekal, Karnataka',
    highway: 'NH48',
    coordinates: [12.7083, 77.6958],
    distanceFromBangalore: 28,
    type: 'fast-charging',
    chargingPower: 50,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Border Check', 'Restaurant', 'Parking'],
    price: 11,
    operatingHours: '24/7',
    safetyRating: 4.0
  },
  {
    id: 'nh48-dharmapuri',
    name: 'Dharmapuri Highway Charging',
    location: 'Dharmapuri, Tamil Nadu',
    highway: 'NH48',
    coordinates: [12.1211, 78.1583],
    distanceFromBangalore: 125,
    type: 'ultra-fast',
    chargingPower: 100,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Highway Plaza', 'Restaurant', 'Fuel'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.4
  },
  {
    id: 'nh48-salem',
    name: 'Salem Junction Power Station',
    location: 'Salem, Tamil Nadu',
    highway: 'NH48',
    coordinates: [11.6643, 78.1460],
    distanceFromBangalore: 185,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Major Junction', 'Shopping', 'Hospital'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.7
  },
  {
    id: 'nh48-namakkal',
    name: 'Namakkal Route Charging Hub',
    location: 'Namakkal, Tamil Nadu',
    highway: 'NH48',
    coordinates: [11.2189, 78.1677],
    distanceFromBangalore: 260,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Tourist Stop', 'Restaurant', 'Restroom'],
    price: 12,
    operatingHours: '24/7',
    safetyRating: 4.2
  },

  // Additional strategic stations along NH48 (Western Route to Mumbai)
  {
    id: 'nh48-nelamangala',
    name: 'Nelamangala Gateway Charging',
    location: 'Nelamangala, Karnataka',
    highway: 'NH48',
    coordinates: [13.0999, 77.3915],
    distanceFromBangalore: 35,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Gateway Point', 'Restaurant', 'Fuel'],
    price: 11,
    operatingHours: '24/7',
    safetyRating: 4.3
  },
  {
    id: 'nh48-sira',
    name: 'Sira Highway Charging Point',
    location: 'Sira, Karnataka',
    highway: 'NH48',
    coordinates: [13.7406, 76.9058],
    distanceFromBangalore: 125,
    type: 'ultra-fast',
    chargingPower: 120,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Historic Town', 'Local Food', 'Parking'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.1
  },
  {
    id: 'nh48-ranebennur',
    name: 'Ranebennur Express Charging',
    location: 'Ranebennur, Karnataka',
    highway: 'NH48',
    coordinates: [14.6167, 75.6333],
    distanceFromBangalore: 320,
    type: 'fast-charging',
    chargingPower: 80,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Express Point', 'Restaurant', 'Medical'],
    price: 12,
    operatingHours: '24/7',
    safetyRating: 4.4
  },
  {
    id: 'nh48-gadag',
    name: 'Gadag Junction Power Hub',
    location: 'Gadag, Karnataka',
    highway: 'NH48',
    coordinates: [15.4167, 75.6333],
    distanceFromBangalore: 385,
    type: 'ultra-fast',
    chargingPower: 150,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Railway Junction', 'Hotel', 'Shopping'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.5
  },
  {
    id: 'nh48-bagalkot',
    name: 'Bagalkot Highway Charging',
    location: 'Bagalkot, Karnataka',
    highway: 'NH48',
    coordinates: [16.1833, 75.7000],
    distanceFromBangalore: 465,
    type: 'fast-charging',
    chargingPower: 75,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Historic City', 'Restaurant', 'Fuel'],
    price: 13,
    operatingHours: '24/7',
    safetyRating: 4.2
  },
  {
    id: 'nh48-miraj',
    name: 'Miraj Route Power Station',
    location: 'Miraj, Maharashtra',
    highway: 'NH48',
    coordinates: [16.8267, 74.6500],
    distanceFromBangalore: 645,
    type: 'ultra-fast',
    chargingPower: 180,
    connectorTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    amenities: ['Major Hub', 'Railway Station', 'Hotel'],
    price: 16,
    operatingHours: '24/7',
    safetyRating: 4.6
  },
  {
    id: 'nh48-karad',
    name: 'Karad Express Charging Hub',
    location: 'Karad, Maharashtra',
    highway: 'NH48',
    coordinates: [17.2900, 74.1817],
    distanceFromBangalore: 725,
    type: 'fast-charging',
    chargingPower: 100,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['River Town', 'Restaurant', 'Scenic View'],
    price: 15,
    operatingHours: '24/7',
    safetyRating: 4.3
  },
  
  // Emergency and safety stations at critical points
  {
    id: 'emergency-ghat-1',
    name: 'Ghat Section Emergency Charging',
    location: 'Western Ghats, Karnataka-Maharashtra Border',
    highway: 'NH48',
    coordinates: [15.8000, 74.2000],
    distanceFromBangalore: 530,
    type: 'fast-charging',
    chargingPower: 60,
    connectorTypes: ['CCS2', 'Type 2'],
    amenities: ['Emergency Services', 'Mechanic', 'Medical'],
    price: 14,
    operatingHours: '24/7',
    safetyRating: 4.8
  },
  {
    id: 'emergency-midway-hyd',
    name: 'Midway Emergency Charging Point',
    location: 'Highway Rest Area, AP-Telangana Border',
    highway: 'NH44',
    coordinates: [16.2000, 78.2000],
    distanceFromBangalore: 450,
    type: 'ultra-fast',
    chargingPower: 120,
    connectorTypes: ['CCS2', 'CHAdeMO'],
    amenities: ['Emergency Stop', 'Medical', 'Mechanic', 'Restroom'],
    price: 15,
    operatingHours: '24/7',
    safetyRating: 4.9
  }
];

// Combine all stations for easy access
export const ALL_INTERCITY_STATIONS = [
  ...HIGHWAY_CHARGING_STATIONS
];