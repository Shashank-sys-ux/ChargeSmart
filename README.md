# ChargeSmart
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Shashank-sys-ux/ChargeSmart)

ChargeSmart is an intelligent, AI-powered platform designed to revolutionize the electric vehicle (EV) charging experience in India. It provides a comprehensive suite of tools for both EV drivers and station owners, focusing on predictive analytics, smart routing, and seamless booking.

The application leverages a hybrid machine learning system to forecast charging station availability, predict wait times, and optimize travel routes, ensuring a reliable and efficient journey for EV users.

## Key Features

- **AI-Powered Route Planning**: Generates optimal travel routes that consider the vehicle's battery level, real-time traffic, and predicted station availability. It intelligently suggests charging stops to minimize travel time and range anxiety.

- **Live Smart Map**: An interactive Mapbox-powered map that displays real-time station data, including availability, charging speeds, and pricing. A dynamic heatmap visualizes station usage intensity across the network.

- **Predictive Station Analytics**: A hybrid ML model combines deterministic patterns with a simulated neural network to forecast station usage and wait times up to 30 minutes in advance, helping drivers make informed decisions.

- **Intercity Trip Planner**: A dedicated module for planning long-distance journeys. It calculates safe, efficient routes with optimal charging stops on highways, considering station safety ratings, amenities, and charging power.

- **Slot Booking & Management**: Users can book charging time slots in advance, manage their bookings, and receive real-time notifications about their slot status.

- **Admin & Analytics Dashboard**: A comprehensive dashboard for station owners to monitor real-time usage trends, view performance metrics, and gain data-driven insights to optimize their operations.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI & Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Mapping**: Mapbox GL JS
- **Data Fetching & State**: TanStack Query (React Query), React Context API
- **Routing**: React Router
- **Linting & Formatting**: ESLint, Prettier

## Project Structure

The codebase is organized to separate concerns, making it modular and maintainable.

```
src
├── components/       # Reusable UI components
│   ├── booking/      # Components related to the booking flow
│   ├── intercity/    # Components for the intercity planner
│   ├── map/          # Map-related components (Mapbox, markers, etc.)
│   └── ui/           # Core UI elements from shadcn/ui
├── contexts/         # React Contexts for global state (Auth, Booking)
├── data/             # Static data for stations and routes
├── hooks/            # Custom React hooks for shared logic
├── lib/              # Utility functions
├── pages/            # Top-level page components for routing
└── utils/            # Core logic (ML predictors, cache managers, etc.)
```

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/shashank-sys-ux/chargesmart.git
    cd chargesmart
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
