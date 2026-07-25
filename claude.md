# claude.md — FuelWise Frontend Implementation

You are working as an expert React & Frontend Engineer. Your task is to build the frontend for **FuelWise**, a smart fuel-efficient routing and money-saving application. 

The backend is completely finished (running on JDK 21). You will implement the frontend matching the specifications, styling, and API formats defined below.

---

## 1. Tech Stack & Setup Requirements
- **Framework:** React (Vite + TypeScript)
- **Styling:** Tailwind CSS (modern, clean, and mobile-responsive)
- **Routing:** React Router DOM (v6)
- **Map Library:** Google Maps JavaScript API (via `@react-google-maps/api`)
- **Icons:** Lucide React (for sleek, minimalist interface icons)

---

## 2. Page & Layout Specifications

Implement a fluid-width application with three main routes, protected by basic auth state routing.

### Route 1: Register (`/register`)
- Clean, centered card layout.
- Inputs: `Email`, `Password`, `Confirm Password`, `Vehicle Type` (Dropdown/Text), `Fuel Consumption Rate (L/100km)`, and `Tank Capacity (Liters)`.
- On successful submission, redirect to `/login` with a success toast or notification.

### Route 2: Login (`/login`)
- Clean, centered card layout matching the app's dark/light modern theme.
- Inputs: `Email`, `Password`.
- On successful login, save the auth token/session (localStorage/sessionStorage) and redirect to the Main Map page (`/`).

### Route 3: Main Dashboard (`/` - Protected Route)
A split-screen interface (Map on one side, control & information sidebar on the other).

- **Sidebar (Left - 35% width / Full on mobile):**
  - **User Profile Quick Settings:** Display current user's profile values (`tank_capacity`, `fuel_efficiency`). Provide manual override input fields for these values so they can be modified on the fly during route planning.
  - **(This is held, ignore this)Station Finder Controls:** Search radius slider (1 km to 20 km) and a trigger button.
  - **Route Planner Controls:**
    - Inputs for Origin Lat/Lng and Destination Lat/Lng.
    - Option: "Pick Origin on Map" & "Pick Destination on Map" click hooks.
    - Button: "Calculate Fuel-Wise Route".
  - **Gas Station List Panel:** Show a list of stations currently retrieved from `/api/v1/routes/advice/` matching the map boundaries or clicked radius. **Highlight the lowest fuel price (e10, e5, or diesel) in green.**
  - **Route Advice Panel:** Once the advice API is called, show up to 3 money-saving options sorted from best to worst. For each item in the returned array list, display:
  
  Station Info: Station Name (station.displayName.text), address (station.formattedAddress), and the parsed target fuel price (fuelPricePerLiter).

  Route Footprint: Total combined trip financial cost (totalCostOffset), added travel time (addedSeconds formatted into minutes/seconds), and added travel distance (addedMeters formatted into km).

  Navigation Trigger: An anchor link or button utilizing routingSummary.directionsUri to launch navigation directly in a new Google Maps window.
  

- **Map Area (Right - 65% width / Hidden or toggle on mobile):**
  - Standard Google Map.
  - **Interactive Selection:** Clicking/dropping a pin on the map populates the target coordinate input field currently toggled active by the "Pick on Map" hooks.
  - **Markers:** Render custom markers or color-coded pins for each station option returned in the advice list using the first coordinate element from routingSummary.legs. Clicking a pin opens an InfoWindow displaying the target fuelPricePerLiter and full address details.
  - **Route Overlay:** Render the route path using Google Maps Directions renderer or by parsing coordinate arrays if multiple paths are supported by the frontend viewport.

---

## 3. Backend API Contract Integration

Use relative paths `/api/...` to allow proxying through Vite to your local running JDK 21 backend.

### 3.1 Fetch Gas Stations(this is held, ignore it)
* **Method:** `GET`
* **Path:** `/api/v1/fuel-price/stations/`
* **Query Params:** `lng` (double), `lat` (double), `rad` (double - radius in km)
* **Response Format:**
  ```json
  [
    {
      "id": "579d25fd-acb9-445a-9494-f7fe0fa7ce4a",
      "brand": "ELAN",
      "name": "Elan Berlin",
      "street": "Storkower Str.",
      "houseNumber": "116",
      "postCode": 10407,
      "place": "Berlin",
      "lat": 52.535343,
      "lng": 13.450748,
      "dist": 1.8,
      "diesel": 2.089,
      "e5": 2.089,
      "e10": 2.029,
      "open": false
    }
  ]
  ```
### 3.2 Calculate Route & Save Settings
* **Method:** `POST`
* **Path:** `/api/v1/routes/advice`
* **Request Body (JSON):**
    ```json
  {
    "originLat": 53.35993,
    "originLng": -6.24964,
    "destLat": 54.27008,
    "destLng": -8.46999,
    "fuelType": "SP95",
    "tankCapacityLiters": 60.0,
    "currentFuelLiters": 15.0,
    "fuelEfficiencyKml": 14.5
  }
    ```
(Note: tank_capacity and fuel_efficiency are optional and should be pulled from the sidebar's override inputs or fallback to user defaults).
* **Response Format:**
    ```json
  [
    {
      "station": {
        "id": "ChIJa1D_a63FZ0gRWnMauEXWTHU",
        "formattedAddress": "279 Richmond Rd, Drumcondra, Dublin, Ireland",
        "priceLevel": null,
        "fuelOptions": {
          "fuelPrices": [
            {
              "type": "SP95",
              "price": {
                "currencyCode": "EUR",
                "units": 1,
                "nanos": 700000000
              },
              "updateTime": "2026-07-14T12:48:29Z"
            },
            {
              "type": "DIESEL",
              "price": {
                "currencyCode": "EUR",
                "units": 1,
                "nanos": 650000000
              },
              "updateTime": "2026-07-14T12:48:29Z"
            }
          ]
        },
        "displayName": {
          "text": "Circle K Richmond",
          "languageCode": "en"
        }
      },
      "routingSummary": {
        "legs": [
          {
            "duration": "181s",
            "distanceMeters": 793
          },
          {
            "duration": "9592s",
            "distanceMeters": 217095
          }
        ],
        "directionsUri": "https://google.com"
      },
      "fuelPricePerLiter": 1.70,
      "totalCostOffset": 84.35,
      "addedSeconds": 145,
      "addedMeters": 450
    }
  ]

    ```
(Note: `station.id` is the Google Places ID, sourced from the backend's `X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.fuelOptions,places.location,routingSummaries`. The frontend uses it to link out to `https://www.google.com/maps/place/?q=place_id:<id>` from the station InfoWindow.)

### 3.3 Register User
* **Method:** `POST`
* **Path:** `/api/v1/auth/register`
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "vehicleType": "Sedan",
    "fuelEfficiency": 6.5,
    "tankCapacity": 55.0
  }
  ```
* **Response Format:** `201 Created`
  ```json
  {
    "id": "uuid-here",
    "email": "user@example.com",
    "vehicleType": "Sedan",
    "fuelEfficiency": 6.5,
    "tankCapacity": 55.0
  }
  ```
* **Errors:** `409 Conflict` if the email is already registered, `400 Bad Request` for validation failures.

(Note: until this endpoint is wired to the real backend, the frontend uses a mock/local implementation of this contract backed by `localStorage` — see `src/context/AuthContext.tsx`.)

### 3.4 Login
* **Method:** `POST`
* **Path:** `/api/v1/auth/login`
* **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
* **Response Format:** `200 OK`
  ```json
  {
    "token": "jwt-string-here",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "vehicleType": "Sedan",
      "fuelEfficiency": 6.5,
      "tankCapacity": 55.0
    }
  }
  ```
* **Errors:** `401 Unauthorized` on invalid email/password.

(Note: until this endpoint is wired to the real backend, the frontend uses a mock/local implementation of this contract backed by `localStorage` — see `src/context/AuthContext.tsx`. The mock token is a non-cryptographic base64 JWT-shaped placeholder, not a real signed JWT.)

## 4. Engineering Instructions & Step-by-Step Build Order
When executing tasks, follow this sequence:

Prerequisites Verification: Check for package.json configurations. Install dependencies: lucide-react, react-router-dom, @react-google-maps/api, and @mapbox/polyline (for decoding Google's encoded polyline).

State & Auth Management: Setup a JWT token-based react context AuthContext to handle register, login, session retention, and user parameters storage.

API Utility Service: Create services/api.ts wrapping Axios or standard fetch with pre-defined paths and type declarations matching the schemas in Section 3.

Interactive Map Component: Implement the Google Map wrapper. Add a click-listener to place a target marker (or origin/destination pins) on the map and extract latitude and longitude.

UI Assembly: Connect the Sidebar controls to trigger API calls. When a route is successfully returned, render the polyline overlay cleanly on the Google Map.

Polishing: Ensure clean error handling (e.g., handling missing API keys, failed authentication, or out-of-range coords) with visual user-friendly alerts.