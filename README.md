# KuTo - Travel Marketplace Prototype

**Live Demo**: [keralaexploreprototype.vercel.app](https://keralaexploreprototype.vercel.app)

KuTo (formerly GuideGo) is a high-fidelity prototype of a modern peer-to-peer travel marketplace that connects travelers with local, verified guides in Kerala. The application features a robust custom-trip bidding system, real-time traveler-guide chat, and an interactive AI-powered itinerary generator.

> [!NOTE]
> This prototype is built as a responsive web application designed to run seamlessly on both mobile viewports and desktop browsers.

---

## 🚀 Key Features

### 1. For Travelers (Tourists)
*   **Discover Kerala**: Search, explore, and filter destinations (Kochi, Munnar, Alleppey, and more).
*   **Custom Trip Bidding**: A multi-step request wizard where travelers post details (dates, travelers, budget, style) and receive competitive bids from local guides.
*   **Guide Packages**: Browse pre-designed packages and guide profiles with client reviews, languages, and specialties.
*   **Interactive AI Trip Planner**: A conversational assistant that generates customized itineraries based on user interests, matching them with the perfect local guides.
*   **Traveler Dashboard**: Track incoming offers, active chats, and pending trip requests.

### 2. For Local Guides
*   **Onboarding & Registry**: Detailed onboarding flow to set up profiles with experience, certificates, bio, and hourly/daily rates.
*   **Job Discovery (Nearby Requests)**: A feed of traveler custom trip requests in the guide's vicinity.
*   **Bidding System**: Send custom bids and message pitches directly to traveler requests.
*   **Guide Dashboard**: Track active bookings, upcoming tours, earnings, and ratings.

### 3. Core Capabilities
*   **Real-time Chat**: Live messaging interface for negotiation and coordination.
*   **Unified Authentication**: Session persistence for traveler and guide accounts.

---

## 🛠️ Architecture & Tech Stack

### Single-Line Deployment Format:
`Responsive Web Application (React & Vite) • Vercel hosting + Supabase backend • AI matching engine on Serverless Functions • rolled out across major Kerala tourism hubs via hotel & airport QR codes, onboarded through OTP & social SSO.`

### Technical Stack Details:
*   **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons.
*   **Backend & DB**: Supabase (PostgreSQL for structured registries, Supabase Auth for SSO, WebSockets for Realtime Chat).
*   **Compute & AI**: Serverless Edge Functions executing LLM/Gemini matching models for automatic itinerary generation.
*   **Hosting**: Vercel CDN for high-performance global delivery.

---

## 📁 Directory Structure

```text
keralaexploreprtotype/
├── src/
│   ├── app/
│   │   ├── components/       # Core UI screens (TravelerSignup, Login, etc.)
│   │   ├── context/          # State providers (AuthContext for user sessions)
│   │   ├── data/             # JSON seeds for guides and travelers databases
│   │   ├── lib/              # Mock database accessors (guidesDb, travelersDb)
│   │   ├── styles/           # Styling tokens and utility classes
│   │   └── App.tsx           # Main application routing and screen controller
│   ├── main.tsx              # Application mount point
│   index.html                # Entry HTML document
│   vite.config.ts            # Vite build configuration
└── package.json              # Script definitions and package dependencies
```

---

## 💻 Running the Code Locally

### 1. Install Dependencies
Ensure you have Node.js installed, then install project dependencies:
```bash
npm install
# or
pnpm install
```

### 2. Run the Development Server
Start the local server with hot-reload support:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Build for Production
To bundle and optimize the application for Vercel/production deployment:
```bash
npm run build
```
The output assets will be created in the `/dist` directory.