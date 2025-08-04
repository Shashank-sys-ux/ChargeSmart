export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
};

export const getTimeRemaining = (targetTime: Date, currentTime: Date, simulationSpeed: number) => {
  const diff = targetTime.getTime() - currentTime.getTime();
  if (diff <= 0) return { minutes: 0, seconds: 0, expired: true };
  
  // Adjust for simulation speed
  const actualDiff = diff / simulationSpeed;
  const minutes = Math.floor(actualDiff / (1000 * 60));
  const seconds = Math.floor((actualDiff % (1000 * 60)) / 1000);
  
  return { minutes, seconds, expired: false };
};