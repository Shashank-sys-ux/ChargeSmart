
// Lightweight prediction engine without heavy ML processing
export class SimplePredictionEngine {
  private basePatterns: Map<number, any> = new Map();
  private isReady = false;

  async initialize() {
    // Simple initialization without heavy computation
    this.generateBasePatterns();
    this.isReady = true;
    console.log('✅ Simple prediction engine ready');
  }

  private generateBasePatterns() {
    // Generate lightweight base patterns for each station
    const stationIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    
    stationIds.forEach(id => {
      this.basePatterns.set(id, {
        peakHours: [8, 9, 17, 18, 19], // Rush hours
        baseOccupancy: 0.2 + (id % 3) * 0.15, // Varied base levels
        locationMultiplier: this.getLocationMultiplier(id),
        capacity: 8
      });
    });
  }

  private getLocationMultiplier(stationId: number): number {
    // Different multipliers based on station location
    const cityCenter = [1, 4, 11]; // High usage stations
    const highway = [2, 3, 7]; // Medium usage
    const residential = [5, 6, 8, 9, 10, 12]; // Lower usage
    
    if (cityCenter.includes(stationId)) return 1.4;
    if (highway.includes(stationId)) return 1.1;
    return 0.8;
  }

  predictOccupancy(stationId: number, currentTime: Date) {
    if (!this.isReady) {
      return this.getDefaultPrediction();
    }

    const pattern = this.basePatterns.get(stationId);
    if (!pattern) return this.getDefaultPrediction();

    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const dayOfWeek = currentTime.getDay();
    
    // Time-based multiplier
    let timeMultiplier = 1.0;
    if (pattern.peakHours.includes(hour)) {
      timeMultiplier = 1.6;
    } else if (hour >= 22 || hour <= 5) {
      timeMultiplier = 0.3;
    } else if (hour >= 12 && hour <= 14) {
      timeMultiplier = 1.2;
    }

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeMultiplier *= 0.7;
    }

    // Add some randomness for realism
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    // Calculate final occupancy
    let occupancy = pattern.baseOccupancy * pattern.locationMultiplier * timeMultiplier * randomFactor;
    occupancy = Math.max(0, Math.min(1, occupancy));

    const available = Math.max(0, pattern.capacity - Math.floor(occupancy * pattern.capacity));
    const waitTime = available === 0 ? 15 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5);

    return {
      predictedUsage: occupancy,
      confidence: 0.85 + Math.random() * 0.1,
      availability: available,
      waitTime,
      status: this.getStatus(occupancy)
    };
  }

  private getStatus(occupancy: number): string {
    if (occupancy >= 0.9) return 'full';
    if (occupancy >= 0.7) return 'busy';
    if (occupancy >= 0.4) return 'moderate';
    return 'available';
  }

  private getDefaultPrediction() {
    return {
      predictedUsage: 0.3 + Math.random() * 0.4,
      confidence: 0.5,
      availability: Math.floor(Math.random() * 8),
      waitTime: Math.floor(Math.random() * 10),
      status: 'available'
    };
  }

  isModelReady(): boolean {
    return this.isReady;
  }
}

export const simplePredictionEngine = new SimplePredictionEngine();
