export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  id: string;
}

export const generateTimeSlots = (currentTime: Date, numberOfSlots: number = 12): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const now = new Date(currentTime);
  
  // Calculate the next hour boundary
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  
  // Generate 1-hour slots starting from the next hour boundary
  for (let i = 0; i < numberOfSlots; i++) {
    const startTime = new Date(nextHour);
    startTime.setHours(nextHour.getHours() + i, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);
    
    slots.push({
      id: `slot_${startTime.getTime()}`,
      startTime,
      endTime
    });
  }
  return slots;
};

export const formatTimeRange = (startTime: Date, endTime: Date) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};