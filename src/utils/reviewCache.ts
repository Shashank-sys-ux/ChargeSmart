interface Review {
  id: string;
  stationId: number;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  timestamp: Date;
}

class ReviewCache {
  private reviews: Review[] = [];

  addReview(stationId: number, name: string, rating: number, review: string): Review {
    const newReview: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stationId,
      name,
      avatar: this.getRandomAvatar(),
      rating,
      review,
      timestamp: new Date()
    };

    this.reviews.push(newReview);
    return newReview;
  }

  getStationReviews(stationId: number): Review[] {
    return this.reviews
      .filter(review => review.stationId === stationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3); // Only latest 3 reviews
  }

  private getRandomAvatar(): string {
    const avatars = ["👨‍💼", "👩‍🎓", "👨‍🔧", "👩‍💻", "👨‍⚕️", "👩‍🏫", "👨‍🎨", "👩‍🚀", "👨‍🍳", "👩‍🔬"];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}

export const reviewCache = new ReviewCache();
export type { Review };