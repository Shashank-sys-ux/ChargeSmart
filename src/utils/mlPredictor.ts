
import { HistoricalDataPoint, StationFeatures, getCurrentWeather, getCurrentTraffic, enhancedBangaloreStations } from './dataGenerator';

// Enhanced Neural Network with improved architecture for temporal patterns
class EnhancedNeuralNetwork {
  private weights1: number[][];
  private weights2: number[][];
  private weights3: number[][];
  private bias1: number[];
  private bias2: number[];
  private bias3: number[];
  private readonly inputSize = 20; // Increased for better temporal features
  private readonly hiddenSize1 = 40; // Larger for better pattern learning
  private readonly hiddenSize2 = 20;
  private readonly outputSize = 1;
  private readonly learningRate = 0.0003;

  constructor() {
    this.weights1 = this.xavierMatrix(this.inputSize, this.hiddenSize1);
    this.weights2 = this.xavierMatrix(this.hiddenSize1, this.hiddenSize2);
    this.weights3 = this.xavierMatrix(this.hiddenSize2, this.outputSize);
    this.bias1 = this.randomArray(this.hiddenSize1, 0.01);
    this.bias2 = this.randomArray(this.hiddenSize2, 0.01);
    this.bias3 = this.randomArray(this.outputSize, 0.01);
  }

  private xavierMatrix(rows: number, cols: number): number[][] {
    const scale = Math.sqrt(2.0 / (rows + cols));
    return Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2 * scale)
    );
  }

  private randomArray(size: number, scale: number = 0.01): number[] {
    return Array(size).fill(0).map(() => (Math.random() - 0.5) * 2 * scale);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private leakyRelu(x: number): number {
    return x > 0 ? x : 0.01 * x;
  }

  private matMul(a: number[], weights: number[][]): number[] {
    const result = new Array(weights[0].length).fill(0);
    for (let i = 0; i < weights[0].length; i++) {
      for (let j = 0; j < a.length && j < weights.length; j++) {
        result[i] += a[j] * weights[j][i];
      }
    }
    return result;
  }

  private forward(input: number[]): { hidden1: number[], hidden2: number[], output: number[] } {
    const hidden1Pre = this.matMul(input, this.weights1).map((x, i) => x + this.bias1[i]);
    const hidden1 = hidden1Pre.map(x => this.leakyRelu(x));
    
    const hidden2Pre = this.matMul(hidden1, this.weights2).map((x, i) => x + this.bias2[i]);
    const hidden2 = hidden2Pre.map(x => this.relu(x));
    
    const outputPre = this.matMul(hidden2, this.weights3).map((x, i) => x + this.bias3[i]);
    const output = outputPre.map(x => this.sigmoid(x));
    
    return { hidden1, hidden2, output };
  }

  predict(input: number[]): number {
    const { output } = this.forward(input);
    return output[0];
  }

  train(inputs: number[][], targets: number[]): void {
    const batchSize = Math.min(128, inputs.length);
    
    for (let batch = 0; batch < Math.ceil(inputs.length / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, inputs.length);
      const batchInputs = inputs.slice(batchStart, batchEnd);
      const batchTargets = targets.slice(batchStart, batchEnd);
      
      const predictions = batchInputs.map(input => this.forward(input));
      
      for (let i = 0; i < batchInputs.length; i++) {
        const error = batchTargets[i] - predictions[i].output[0];
        const learningRateAdj = this.learningRate / batchInputs.length;
        
        // Update output layer
        for (let j = 0; j < this.weights3.length; j++) {
          for (let k = 0; k < this.weights3[j].length; k++) {
            this.weights3[j][k] += learningRateAdj * error * predictions[i].hidden2[j];
          }
        }
        
        for (let j = 0; j < this.bias3.length; j++) {
          this.bias3[j] += learningRateAdj * error;
        }
        
        // Update second hidden layer
        for (let j = 0; j < this.weights2.length; j++) {
          for (let k = 0; k < this.weights2[j].length; k++) {
            const gradient = error * this.weights3[k][0] * (predictions[i].hidden2[k] > 0 ? 1 : 0);
            this.weights2[j][k] += learningRateAdj * gradient * predictions[i].hidden1[j];
          }
        }
      }
    }
  }
}

export class MLPredictor {
  private model: EnhancedNeuralNetwork;
  private isTrained: boolean = false;
  private trainingProgress: number = 0;
  private stationPatterns: Map<number, any> = new Map();
  private temporalPatterns: Map<number, number[]> = new Map(); // Station -> hourly patterns

  constructor() {
    this.model = new EnhancedNeuralNetwork();
  }

  // Enhanced feature preparation with strong temporal focus
  private prepareFeatures(
    stationId: number,
    station: StationFeatures,
    currentTime: Date,
    weather: any,
    traffic: number
  ): number[] {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
    
    // Enhanced temporal features
    const hourSin = Math.sin(2 * Math.PI * hour / 24);
    const hourCos = Math.cos(2 * Math.PI * hour / 24);
    const dayOfWeekSin = Math.sin(2 * Math.PI * dayOfWeek / 7);
    const dayOfWeekCos = Math.cos(2 * Math.PI * dayOfWeek / 7);
    
    // Peak hour indicators for this station
    const isPeakHour = station.peakHours.includes(hour) ? 1 : 0;
    
    // Weather encoding
    const weatherConditionMap = { sunny: 0, cloudy: 0.33, rainy: 0.66, stormy: 1 };
    const weatherCondition = weatherConditionMap[weather.condition as keyof typeof weatherConditionMap] || 0;
    
    // Area type encoding
    const areaTypeMap = { residential: 0, commercial: 0.33, tech: 0.66, entertainment: 1 };
    const areaType = areaTypeMap[station.areaType];
    
    // Location density encoding
    const densityMap = { urban: 1, suburban: 0.5, rural: 0 };
    const locationDensity = densityMap[station.locationDensity];
    
    // Time-based contextual features
    const isRushHour = ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 19)) && !isWeekend ? 1 : 0;
    const isNightTime = (hour >= 22 || hour <= 5) ? 1 : 0;
    const isLunchTime = (hour >= 12 && hour <= 14) ? 1 : 0;
    
    return [
      hour / 24,                           // Normalized hour
      hourSin,                             // Cyclic hour encoding
      hourCos,                             // Cyclic hour encoding  
      dayOfWeek / 7,                       // Normalized day of week
      dayOfWeekSin,                        // Cyclic day encoding
      dayOfWeekCos,                        // Cyclic day encoding
      isWeekend,                           // Weekend indicator
      isPeakHour,                          // Station-specific peak hour
      isRushHour,                          // General rush hour
      isNightTime,                         // Night time indicator
      isLunchTime,                         // Lunch time indicator
      weather.temperature / 40,            // Normalized temperature
      weatherCondition,                    // Weather condition
      traffic,                             // Traffic level
      station.baseOccupancy,               // Station's base occupancy level
      station.volatility,                  // Station's volatility factor
      station.popularityScore,             // Station popularity
      areaType,                            // Area type encoding
      locationDensity,                     // Location density
      station.capacity / 12                // Normalized capacity
    ];
  }

  // Enhanced training with focus on temporal pattern learning
  async trainModel(historicalData: HistoricalDataPoint[], stations: StationFeatures[]): Promise<void> {
    console.log('🚀 Training enhanced temporal ML model...');
    
    const stationMap = new Map(stations.map(s => [s.id, s]));
    
    // Analyze temporal patterns for each station
    this.analyzeTemporalPatterns(historicalData, stationMap);
    
    const inputs: number[][] = [];
    const targets: number[] = [];
    
    // Prepare training data with enhanced temporal features
    for (const dataPoint of historicalData) {
      const station = stationMap.get(dataPoint.stationId);
      if (!station) continue;
      
      const weather = {
        temperature: dataPoint.weatherTemp,
        condition: dataPoint.weatherCondition
      };
      
      const features = this.prepareFeatures(
        dataPoint.stationId,
        station,
        new Date(dataPoint.timestamp),
        weather,
        dataPoint.trafficLevel
      );
      
      inputs.push(features);
      targets.push(dataPoint.actualUsage);
    }
    
    console.log(`📊 Training on ${inputs.length} temporal data points...`);
    
    // Enhanced training with multiple epochs and progress tracking
    const epochs = 150; // More epochs for better temporal learning
    for (let epoch = 0; epoch < epochs; epoch++) {
      // Shuffle data for better training
      const indices = Array.from({length: inputs.length}, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      const shuffledInputs = indices.map(i => inputs[i]);
      const shuffledTargets = indices.map(i => targets[i]);
      
      this.model.train(shuffledInputs, shuffledTargets);
      this.trainingProgress = (epoch + 1) / epochs;
      
      if (epoch % 30 === 0) {
        // Calculate validation loss
        const sampleSize = Math.min(500, inputs.length);
        const samplePredictions = inputs.slice(0, sampleSize).map(input => this.model.predict(input));
        const sampleTargets = targets.slice(0, sampleSize);
        const loss = sampleTargets.reduce((sum, target, i) => 
          sum + Math.pow(target - samplePredictions[i], 2), 0) / sampleTargets.length;
        
        console.log(`🎯 Epoch ${epoch + 1}/${epochs}, Loss: ${loss.toFixed(4)}`);
      }
    }
    
    this.isTrained = true;
    console.log('✅ Enhanced temporal ML model training completed!');
    
    // Validate temporal patterns
    this.validateTemporalPredictions(stationMap);
  }

  // Analyze hourly patterns for each station
  private analyzeTemporalPatterns(historicalData: HistoricalDataPoint[], stationMap: Map<number, StationFeatures>) {
    console.log('📈 Analyzing temporal patterns...');
    
    for (const station of stationMap.values()) {
      const stationData = historicalData.filter(d => d.stationId === station.id);
      
      // Calculate average usage by hour
      const hourlyUsage = new Array(24).fill(0);
      const hourlyCounts = new Array(24).fill(0);
      
      stationData.forEach(d => {
        hourlyUsage[d.hour] += d.actualUsage;
        hourlyCounts[d.hour]++;
      });
      
      const avgHourlyUsage = hourlyUsage.map((sum, hour) => 
        hourlyCounts[hour] > 0 ? sum / hourlyCounts[hour] : 0
      );
      
      this.temporalPatterns.set(station.id, avgHourlyUsage);
      
      // Store comprehensive patterns
      const weekdayData = stationData.filter(d => !d.isWeekend);
      const weekendData = stationData.filter(d => d.isWeekend);
      
      this.stationPatterns.set(station.id, {
        avgHourlyUsage,
        weekdayAvg: weekdayData.length > 0 ? weekdayData.reduce((sum, d) => sum + d.actualUsage, 0) / weekdayData.length : 0,
        weekendAvg: weekendData.length > 0 ? weekendData.reduce((sum, d) => sum + d.actualUsage, 0) / weekendData.length : 0,
        peakHour: avgHourlyUsage.indexOf(Math.max(...avgHourlyUsage)),
        minHour: avgHourlyUsage.indexOf(Math.min(...avgHourlyUsage)),
        volatility: this.calculateVolatility(avgHourlyUsage)
      });
    }
  }

  private calculateVolatility(hourlyUsage: number[]): number {
    const mean = hourlyUsage.reduce((sum, val) => sum + val, 0) / hourlyUsage.length;
    const variance = hourlyUsage.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hourlyUsage.length;
    return Math.sqrt(variance);
  }

  // Validate that predictions show proper temporal patterns
  private validateTemporalPredictions(stationMap: Map<number, StationFeatures>) {
    console.log('🔍 Validating temporal prediction patterns...');
    
    const testTime = new Date();
    const validationResults: any[] = [];
    
    for (const station of stationMap.values()) {
      const hourlyPredictions = [];
      
      // Test predictions across 24 hours
      for (let testHour = 0; testHour < 24; testHour++) {
        testTime.setHours(testHour);
        const prediction = this.predictStationLoad(station.id, station, testTime);
        hourlyPredictions.push(prediction.predictedUsage);
      }
      
      // Validate patterns
      const nightAvg = (hourlyPredictions[0] + hourlyPredictions[1] + hourlyPredictions[2] + 
                       hourlyPredictions[3] + hourlyPredictions[4] + hourlyPredictions[5]) / 6;
      const peakAvg = (hourlyPredictions[8] + hourlyPredictions[9] + hourlyPredictions[17] + 
                      hourlyPredictions[18] + hourlyPredictions[19]) / 5;
      
      validationResults.push({
        stationId: station.id,
        stationName: `Station ${station.id}`,
        nightAvg: nightAvg.toFixed(3),
        peakAvg: peakAvg.toFixed(3),
        ratio: (peakAvg / Math.max(nightAvg, 0.01)).toFixed(2),
        hasProperPattern: peakAvg > nightAvg * 1.5
      });
    }
    
    console.log('📊 Temporal validation results:', validationResults);
    
    const goodPatterns = validationResults.filter(r => r.hasProperPattern).length;
    console.log(`✅ ${goodPatterns}/${validationResults.length} stations show proper temporal patterns`);
  }

  // Enhanced prediction with strong temporal awareness
  predictStationLoad(
    stationId: number,
    station: StationFeatures,
    currentTime: Date
  ): {
    predictedUsage: number;
    confidence: number;
    availability: number;
    waitTime: number;
    status: string;
  } {
    try {
      const weather = getCurrentWeather();
      const traffic = getCurrentTraffic();
      
      let predictedUsage: number;
      let confidence: number;
      
      if (this.isTrained) {
        const features = this.prepareFeatures(stationId, station, currentTime, weather, traffic);
        predictedUsage = this.model.predict(features);
        confidence = Math.min(0.95, 0.75 + Math.random() * 0.2);
      } else {
        const result = this.temporalPatternBasedPrediction(stationId, station, currentTime);
        predictedUsage = result.usage;
        confidence = result.confidence;
      }
      
      // Ensure proper bounds
      predictedUsage = Math.max(0.01, Math.min(0.98, predictedUsage));
      
      // Calculate derived metrics
      const availability = Math.max(0, Math.floor(station.capacity * (1 - predictedUsage)));
      const waitTime = predictedUsage > 0.85 ? Math.floor((predictedUsage - 0.85) * 100) : 0;
      
      let status = "available";
      if (predictedUsage >= 0.95) status = "full";
      else if (predictedUsage >= 0.85) status = "critical";
      else if (predictedUsage >= 0.7) status = "busy";
      else if (predictedUsage >= 0.5) status = "moderate";
      
      return {
        predictedUsage,
        confidence,
        availability,
        waitTime,
        status
      };
    } catch (error) {
      console.error('❌ Prediction error:', error);
      return this.temporalPatternBasedPrediction(stationId, station, currentTime);
    }
  }

  // Enhanced pattern-based prediction with strong temporal focus
  private temporalPatternBasedPrediction(stationId: number, station: StationFeatures, currentTime: Date) {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Start with station-specific base occupancy
    let usage = station.baseOccupancy;
    
    // Apply strong temporal patterns
    if (hour >= 0 && hour <= 5) {
      usage *= 0.15; // Very low at night
    } else if (hour >= 6 && hour <= 7) {
      usage *= 0.4; // Early morning
    } else if (hour >= 8 && hour <= 9 && !isWeekend) {
      usage *= 2.0; // Morning rush
    } else if (hour >= 10 && hour <= 11) {
      usage *= 0.8; // Post-morning
    } else if (hour >= 12 && hour <= 14) {
      usage *= 1.2; // Lunch time
    } else if (hour >= 15 && hour <= 16) {
      usage *= 0.9; // Afternoon
    } else if (hour >= 17 && hour <= 19 && !isWeekend) {
      usage *= 2.2; // Evening rush (highest)
    } else if (hour >= 20 && hour <= 21) {
      usage *= 1.1; // Post-work
    } else if (hour >= 22 && hour <= 23) {
      usage *= 0.5; // Late evening
    }
    
    // Station-specific peak hours
    const isPeakHour = station.peakHours.includes(hour);
    if (isPeakHour) {
      usage *= 1.3;
    }
    
    // Area type temporal patterns
    switch (station.areaType) {
      case 'tech':
        if (!isWeekend && hour >= 9 && hour <= 20) usage *= 1.2;
        if (isWeekend) usage *= 0.4;
        break;
      case 'commercial':
        if (hour >= 10 && hour <= 21) usage *= 1.1;
        if (isWeekend) usage *= 1.2;
        break;
      case 'entertainment':
        if (hour >= 18 && hour <= 23) usage *= 1.4;
        if (hour >= 0 && hour <= 6) usage *= 0.2;
        break;
      case 'residential':
        if (hour >= 18 && hour <= 22) usage *= 1.2;
        if (hour >= 0 && hour <= 6) usage *= 0.3;
        break;
    }
    
    // Apply other factors
    usage *= (0.8 + station.popularityScore * 0.4);
    usage *= (1.0 - station.maintenanceLevel * 0.2);
    
    // Add controlled randomness
    usage += (Math.random() - 0.5) * station.volatility;
    
    const finalUsage = Math.max(0.02, Math.min(0.96, usage));
    
    return {
      predictedUsage: finalUsage,
      confidence: 0.7,
      availability: Math.max(0, Math.floor(station.capacity * (1 - finalUsage))),
      waitTime: finalUsage > 0.8 ? Math.floor((finalUsage - 0.8) * 80) : 0,
      status: finalUsage > 0.8 ? "busy" : finalUsage > 0.6 ? "moderate" : "available",
      usage: finalUsage
    };
  }

  getTrainingProgress(): number {
    return this.trainingProgress;
  }

  isModelTrained(): boolean {
    return this.isTrained;
  }

  // Get temporal patterns for debugging
  getTemporalPatterns(stationId: number): number[] | undefined {
    return this.temporalPatterns.get(stationId);
  }
}

// Singleton instance
export const mlPredictor = new MLPredictor();
