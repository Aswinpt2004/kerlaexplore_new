import { useState } from "react";
import {
  Search, MapPin, Star, Clock, Globe, Shield, ChevronRight, ChevronLeft,
  ArrowRight, Users, Calendar, DollarSign, MessageCircle, Check, X,
  Bell, Home, Map, Heart, User, Send, Phone, Video, MoreHorizontal,
  Plus, Filter, Navigation, Award, Briefcase, TrendingUp, Package,
  ChevronDown, Mic, Image, Smile, Menu, LogOut, Settings
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen =
  | "landing"
  | "destination"
  | "packages"
  | "package-detail"
  | "custom-trip"
  | "request-submitted"
  | "traveler-dashboard"
  | "offers"
  | "chat"
  | "guide-dashboard"
  | "nearby-requests"
  | "counter-offer";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS = [
  { id: 1, name: "Kyoto, Japan", image: "photo-1545569341-9eb8b30979d9", country: "Japan", guides: 48, rating: 4.9 },
  { id: 2, name: "Amalfi Coast", image: "photo-1533587851505-d119e13fa0d7", country: "Italy", guides: 32, rating: 4.8 },
  { id: 3, name: "Marrakech", image: "photo-1539020140153-e479b8e7b4cc", country: "Morocco", guides: 27, rating: 4.7 },
  { id: 4, name: "Patagonia", image: "photo-1501854140801-50d01698950b", country: "Argentina", guides: 19, rating: 4.9 },
  { id: 5, name: "Santorini", image: "photo-1570077188670-e3a8d69ac5ff", country: "Greece", guides: 41, rating: 4.8 },
  { id: 6, name: "Bali", image: "photo-1537996194471-e657df975ab4", country: "Indonesia", guides: 63, rating: 4.7 },
];

const GUIDES = [
  {
    id: 1, name: "Hiroshi Tanaka", avatar: "photo-1507003211169-0a1dd7228f2d",
    location: "Kyoto, Japan", rating: 4.97, reviews: 312, experience: 9,
    languages: ["English", "Japanese", "Mandarin"], price: 85, duration: "Full Day",
    specialty: "Traditional Culture & Tea Ceremony", verified: true,
    bio: "Born and raised in Kyoto, I offer authentic glimpses into Japan's living heritage — from hidden temples to sake breweries most tourists never find.",
    tags: ["Culture", "History", "Food"],
    images: ["photo-1545569341-9eb8b30979d9", "photo-1528360983277-13d401cdc186", "photo-1542051841857-5f90071e7989"],
    itinerary: [
      { time: "8:00 AM", title: "Fushimi Inari Shrine at dawn", desc: "Beat the crowds at one of Japan's most iconic sites." },
      { time: "10:30 AM", title: "Nishiki Market tasting walk", desc: "Sample street food and local specialties." },
      { time: "12:30 PM", title: "Kaiseki lunch in Gion", desc: "Traditional multi-course meal in a preserved machiya." },
      { time: "2:30 PM", title: "Arashiyama Bamboo Grove", desc: "Walk the iconic grove and visit Tenryu-ji gardens." },
      { time: "5:00 PM", title: "Private tea ceremony", desc: "Participate in a ceremony led by a certified tea master." },
    ],
    inclusions: ["Private transportation", "Kaiseki lunch", "Tea ceremony", "Skip-the-line passes", "Photo spots guide"],
  },
  {
    id: 2, name: "Sofia Ricci", avatar: "photo-1438761681033-6461ffad8d80",
    location: "Amalfi, Italy", rating: 4.94, reviews: 218, experience: 7,
    languages: ["English", "Italian", "French"], price: 110, duration: "Full Day",
    specialty: "Coastal Villages & Cuisine", verified: true,
    bio: "I grew up with the sea on my doorstep. Let me show you the Amalfi my family has loved for generations — from secret coves to nonna's recipes.",
    tags: ["Coastal", "Food", "Photography"],
    images: ["photo-1533587851505-d119e13fa0d7", "photo-1551634979-2b11f8c218da", "photo-1516483638261-f4dbaf036963"],
    itinerary: [
      { time: "9:00 AM", title: "Positano panorama walk", desc: "Golden hour light on the pastel cliffside." },
      { time: "11:00 AM", title: "Ravello gardens", desc: "UNESCO villa gardens with Mediterranean views." },
      { time: "1:00 PM", title: "Seafood lunch on the dock", desc: "Fresh catch at a family-run trattoria." },
      { time: "3:30 PM", title: "Amalfi Cathedral & old town", desc: "Byzantine mosaics and limoncello tasting." },
      { time: "5:30 PM", title: "Sunset boat ride", desc: "Private boat through the sea caves at golden hour." },
    ],
    inclusions: ["Boat rental", "Seafood lunch", "Limoncello tasting", "Garden entry", "Professional photos"],
  },
  {
    id: 3, name: "Fatima El-Amin", avatar: "photo-1494790108377-be9c29b29330",
    location: "Marrakech, Morocco", rating: 4.91, reviews: 176, experience: 11,
    languages: ["English", "Arabic", "French", "Berber"], price: 65, duration: "Full Day",
    specialty: "Medina & Souks & Desert Culture", verified: true,
    bio: "A Marrakchi storyteller — I navigate the labyrinthine medina without maps and know exactly whose tagine will change your life.",
    tags: ["Culture", "Markets", "Architecture"],
    images: ["photo-1539020140153-e479b8e7b4cc", "photo-1548013146-72479768bada", "photo-1518548419970-58e3b4079ab2"],
    itinerary: [],
    inclusions: ["Medina walk", "Souk guide", "Tagine lunch", "Artisan workshop", "Rooftop café"],
  },
  {
    id: 4, name: "Mateo Vargas", avatar: "photo-1500648767791-00dcc994a43e",
    location: "Bariloche, Argentina", rating: 4.96, reviews: 89, experience: 14,
    languages: ["English", "Spanish", "Portuguese"], price: 95, duration: "Full Day",
    specialty: "Patagonia Trekking & Wildlife", verified: true,
    bio: "Certified Patagonia guide and conservationist. I've crossed the ice field three times and know every condor nesting site in the region.",
    tags: ["Trekking", "Wildlife", "Adventure"],
    images: ["photo-1501854140801-50d01698950b", "photo-1464822759023-fed622ff2c3b", "photo-1484960055659-a39d25adab7a"],
    itinerary: [],
    inclusions: ["All equipment", "Ranger permits", "Packed lunch", "Wildlife booklet", "Emergency kit"],
  },
];

const REQUESTS = [
  { id: 1, traveler: "Alex M.", destination: "Kyoto, Japan", budget: "$300–450", date: "Jul 14–16", travelers: 2, style: "Cultural & Historical", distance: "2.1 km", avatar: "photo-1472099645785-5658abf4ff4e", notes: "Looking for hidden temples and local food experiences, not tourist traps." },
  { id: 2, traveler: "Priya S.", destination: "Kyoto, Japan", budget: "$200–300", date: "Jul 20", travelers: 1, style: "Photography", distance: "3.4 km", avatar: "photo-1534528741775-53994a69daeb", notes: "I'm a photographer wanting golden hour shots at Fushimi Inari and Arashiyama." },
  { id: 3, traveler: "Marcus T.", destination: "Kyoto, Japan", budget: "$500–700", date: "Aug 3–5", travelers: 4, style: "Luxury & Food", distance: "0.9 km", avatar: "photo-1507003211169-0a1dd7228f2d", notes: "Anniversary trip, family of 4. Want the best kaiseki and a private tea ceremony." },
];

const MY_REQUESTS = [
  { id: 1, destination: "Kyoto, Japan", date: "Jul 14–16", budget: "$300–450", status: "offers_received", offers: 3, travelers: 2 },
  { id: 2, destination: "Amalfi Coast", date: "Aug 20–22", budget: "$400–600", status: "pending", offers: 0, travelers: 2 },
];

const OFFERS = [
  { id: 1, guide: GUIDES[0], price: 340, originalBudget: "$300–450", message: "Hello! I'd love to show you the hidden side of Kyoto. My package includes a private tea ceremony at a 200-year-old machiya and a pre-dawn walk at Fushimi Inari — all within your budget.", status: "pending" },
  { id: 2, guide: { ...GUIDES[2], name: "Kenji Watanabe", avatar: "photo-1506794778202-cad84cf45f1d", location: "Kyoto, Japan", rating: 4.88, reviews: 143, price: 290, specialty: "Street Food & Night Markets" }, price: 290, originalBudget: "$300–450", message: "Great budget for a 2-day Kyoto experience! I specialize in food and nightlife — izakayas, ramen alleys, and sake bars that locals actually go to.", status: "pending" },
  { id: 3, guide: { ...GUIDES[3], name: "Yuki Nakamura", avatar: "photo-1560250097-0b93528c311a", location: "Kyoto, Japan", rating: 4.82, reviews: 97, price: 420, specialty: "Luxury & Traditional Arts" }, price: 420, originalBudget: "$300–450", message: "I can offer a premium cultural immersion — private access to a Noh theatre rehearsal and dinner at a Michelin-starred kaiseki restaurant. Slightly above budget but worth every yen.", status: "pending" },
];

const CHAT_MESSAGES = [
  { id: 1, sender: "guide", name: "Hiroshi", avatar: "photo-1507003211169-0a1dd7228f2d", text: "Hello Alex! I saw your request for a Kyoto cultural tour. I'd love to design a custom itinerary around the hidden gems — places that aren't in any guidebook. 🌸", time: "10:32 AM" },
  { id: 2, sender: "traveler", text: "Hi Hiroshi! This looks amazing. Can we include the bamboo grove early morning before the crowds?", time: "10:45 AM" },
  { id: 3, sender: "guide", name: "Hiroshi", avatar: "photo-1507003211169-0a1dd7228f2d", text: "Absolutely — I always recommend starting at 6 AM. I know a side path that even most locals don't use. We can be there at first light, just the two of you.", time: "10:47 AM" },
  { id: 4, sender: "traveler", text: "Perfect. What about the tea ceremony? Is that included in the $340?", time: "11:02 AM" },
  { id: 5, sender: "guide", name: "Hiroshi", avatar: "photo-1507003211169-0a1dd7228f2d", text: "Yes, fully included! The ceremony is at a 200-year-old machiya in Gion — hosted by Sensei Yamamoto, a 4th-generation tea master. It's genuinely one of a kind. 🍵", time: "11:04 AM" },
  { id: 6, sender: "traveler", text: "We're sold! Can you confirm July 14–15?", time: "11:15 AM" },
  { id: 7, sender: "guide", name: "Hiroshi", avatar: "photo-1507003211169-0a1dd7228f2d", text: "Both days are wide open for you. Let me send the booking confirmation and detailed itinerary now. So excited to welcome you to Kyoto! 🎋", time: "11:16 AM" },
];

// ─── Shared Components ─────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${s} ${i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : i - 0.5 <= rating ? "fill-amber-200 text-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </span>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "blue" | "amber" | "outline" }) {
  const v = {
    default: "bg-gray-100 text-gray-600",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    outline: "bg-white border border-gray-200 text-gray-600",
  }[variant];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${v}`}>{children}</span>;
}

function Avatar({ src, size = "md", alt = "" }: { src: string; size?: "sm" | "md" | "lg" | "xl"; alt?: string }) {
  const s = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14", xl: "w-20 h-20" }[size];
  return (
    <img
      src={`https://images.unsplash.com/${src}?w=120&h=120&fit=crop&auto=format`}
      alt={alt}
      className={`${s} rounded-full object-cover flex-shrink-0`}
    />
  );
}

function UnsplashImg({ id, w, h, alt, className }: { id: string; w: number; h: number; alt: string; className?: string }) {
  return (
    <img
      src={`https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`}
      alt={alt}
      className={className}
    />
  );
}

function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "blue";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const variants = {
    primary: "bg-[#0ea472] text-white hover:bg-[#0c9266] shadow-sm hover:shadow-md active:scale-95",
    blue: "bg-[#1a7fd4] text-white hover:bg-[#1568b8] shadow-sm hover:shadow-md active:scale-95",
    secondary: "bg-[#f0faf6] text-[#0ea472] hover:bg-[#e0f5ed] border border-[#c6eadc]",
    outline: "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-black/[0.07] shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Input({ label, placeholder, icon: Icon, value, onChange, type = "text" }: {
  label?: string; placeholder?: string; icon?: React.ComponentType<{ className?: string }>;
  value?: string; onChange?: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#f5f7fa] border border-transparent rounded-xl py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] transition-all ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function BottomNav({ active, onNavigate }: { active: "home" | "explore" | "trips" | "profile"; onNavigate: (s: Screen) => void }) {
  const items = [
    { id: "home", icon: Home, label: "Home", screen: "landing" as Screen },
    { id: "explore", icon: Map, label: "Explore", screen: "destination" as Screen },
    { id: "trips", icon: Briefcase, label: "My Trips", screen: "traveler-dashboard" as Screen },
    { id: "profile", icon: User, label: "Profile", screen: "traveler-dashboard" as Screen },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.screen)} className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all">
            <item.icon className={`w-5 h-5 ${item.id === active ? "text-[#0ea472]" : "text-gray-400"}`} />
            <span className={`text-[10px] font-semibold ${item.id === active ? "text-[#0ea472]" : "text-gray-400"}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TopNav({ onNavigate, title, showBack, backScreen, mode = "traveler" }: {
  onNavigate: (s: Screen) => void; title?: string; showBack?: boolean;
  backScreen?: Screen; mode?: "traveler" | "guide";
}) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {showBack ? (
          <button onClick={() => onNavigate(backScreen || "landing")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="w-7 h-7 rounded-lg bg-[#0ea472] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0d1117] text-base" style={{ fontFamily: "Fraunces, serif" }}>GuideGo</span>
          </div>
        )}
        {title && <h1 className="text-base font-semibold text-gray-900">{title}</h1>}
        <div className="flex items-center gap-1">
          {mode === "guide" ? (
            <button onClick={() => onNavigate("guide-dashboard")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0ea472] rounded-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 1: Landing ─────────────────────────────────────────────────────────

function LandingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0ea472] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0d1117] text-xl" style={{ fontFamily: "Fraunces, serif" }}>GuideGo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium" onClick={() => onNavigate("destination")}>Explore</a>
            <a className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium" onClick={() => onNavigate("traveler-dashboard")}>My Trips</a>
            <a className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium" onClick={() => onNavigate("guide-dashboard")}>Guide Dashboard</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
              <button className="px-3 py-1 rounded-full text-xs font-semibold transition-all bg-white shadow text-gray-900">Traveler</button>
              <button onClick={() => onNavigate("guide-dashboard")} className="px-3 py-1 rounded-full text-xs font-semibold transition-all text-gray-500 hover:text-gray-700">Guide</button>
            </div>
            <Avatar src="photo-1472099645785-5658abf4ff4e" size="sm" alt="Profile" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[580px] md:h-[680px] overflow-hidden">
        <UnsplashImg id="photo-1506905925346-21bda4d32df4" w={1600} h={900} alt="Mountain landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          <Badge variant="green">✦ 2,400+ Verified Local Guides</Badge>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl" style={{ fontFamily: "Fraunces, serif" }}>
            Travel like you already live there.
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl font-light">
            Book an expert local guide or post your custom trip — nearby guides will compete for your adventure.
          </p>

          {/* Search bar */}
          <div className="mt-8 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <MapPin className="w-5 h-5 text-[#0ea472] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <div className="w-px bg-gray-200 hidden md:block my-2" />
            <div className="flex items-center gap-3 px-4 py-2 md:w-36">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-400">Any date</span>
            </div>
            <Btn size="lg" onClick={() => onNavigate("destination")} className="rounded-xl whitespace-nowrap">
              <Search className="w-4 h-4" /> Search
            </Btn>
          </div>
          <div className="mt-5 flex gap-4">
            <Btn variant="secondary" onClick={() => onNavigate("packages")} className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
              Explore Packages
            </Btn>
            <Btn variant="secondary" onClick={() => onNavigate("custom-trip")} className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
              Create Custom Trip <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#0ea472] text-sm font-semibold mb-1">Trending now</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>Popular Destinations</h2>
          </div>
          <button className="text-sm text-[#0ea472] font-semibold hover:underline flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DESTINATIONS.map((d, i) => (
            <div key={d.id} onClick={() => onNavigate("destination")} className={`relative rounded-2xl overflow-hidden cursor-pointer group ${i === 0 ? "col-span-2 h-64" : "h-44"}`}>
              <UnsplashImg id={d.image} w={600} h={400} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-bold text-lg leading-tight">{d.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/70 text-xs">{d.guides} guides</span>
                  <span className="text-white/50">·</span>
                  <span className="text-amber-400 text-xs font-semibold">★ {d.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Guides */}
      <section className="bg-[#f5f7fa] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#0ea472] text-sm font-semibold mb-1">Top rated</p>
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>Featured Guides</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {GUIDES.map(g => (
              <Card key={g.id} onClick={() => onNavigate("package-detail")} className="overflow-hidden">
                <div className="relative h-44">
                  <UnsplashImg id={g.images[0]} w={400} h={300} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    {g.verified && <Badge variant="green"><Shield className="w-3 h-3" /> Verified</Badge>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={g.avatar} size="sm" alt={g.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{g.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{g.location}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarRating rating={g.rating} />
                      <span className="text-xs text-gray-500 ml-1">{g.rating} ({g.reviews})</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">${g.price}<span className="text-gray-400 font-normal text-xs">/day</span></span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-[#0ea472] text-sm font-semibold mb-1">Simple process</p>
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>How GuideGo works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Search, step: "01", title: "Search or post", desc: "Browse guide packages or post your custom trip with your budget and preferences." },
            { icon: MessageCircle, step: "02", title: "Receive offers", desc: "Nearby guides see your request and send personalized offers or accept your terms." },
            { icon: Award, step: "03", title: "Explore together", desc: "Choose your guide, chat, confirm details, and set off on an unforgettable adventure." },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-7 h-7 text-[#0ea472]" />
              </div>
              <p className="text-[#0ea472] text-xs font-bold mb-2">{item.step}</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="relative rounded-3xl overflow-hidden">
          <UnsplashImg id="photo-1488085061387-422e29b40080" w={1200} h={400} alt="Travel" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0ea472]/90 to-[#1a7fd4]/80" />
          <div className="absolute inset-0 flex items-center justify-between px-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Fraunces, serif" }}>Ready to explore differently?</h3>
              <p className="text-white/80 text-sm">Post your trip for free. No booking fees until you confirm.</p>
            </div>
            <Btn size="lg" variant="outline" onClick={() => onNavigate("custom-trip")} className="whitespace-nowrap bg-white text-[#0ea472] hover:bg-gray-50">
              Create Custom Trip <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </div>
      </section>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}

// ─── Screen 2: Destination ─────────────────────────────────────────────────────

function DestinationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState<"packages" | "custom">("packages");

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-64">
        <UnsplashImg id="photo-1545569341-9eb8b30979d9" w={800} h={400} alt="Kyoto" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={() => onNavigate("landing")} className="absolute top-12 left-4 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white/70 text-sm">Japan</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Fraunces, serif" }}>Kyoto</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="green">48 Guides</Badge>
            <span className="text-white/70 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 avg rating</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4">
        <div className="flex gap-0">
          {(["packages", "custom"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${tab === t ? "border-[#0ea472] text-[#0ea472]" : "border-transparent text-gray-500"}`}
            >
              {t === "packages" ? "Guide Packages" : "Custom Trip"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {tab === "packages" ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {["All", "Cultural", "Food", "Adventure", "Photography", "Luxury"].map(f => (
                <button key={f} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${f === "All" ? "bg-[#0ea472] text-white border-[#0ea472]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>{f}</button>
              ))}
            </div>
            {GUIDES.slice(0, 3).map(g => (
              <Card key={g.id} onClick={() => onNavigate("package-detail")} className="flex gap-4 p-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <UnsplashImg id={g.images[0]} w={200} h={200} alt={g.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                    {g.verified && <Shield className="w-4 h-4 text-[#0ea472] flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{g.specialty}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <StarRating rating={g.rating} />
                    <span className="text-xs text-gray-500 ml-1">{g.rating} ({g.reviews})</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3 h-3" />{g.languages.slice(0, 2).join(", ")}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{g.duration}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-gray-900">${g.price}<span className="text-xs text-gray-400 font-normal">/person</span></span>
                    <Btn size="sm" onClick={() => onNavigate("package-detail")}>View</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center">
              <Plus className="w-8 h-8 text-[#0ea472]" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Design your perfect trip</h3>
              <p className="text-sm text-gray-500 max-w-xs">Tell us what you want — budget, dates, style. Nearby guides will send you offers.</p>
            </div>
            <Btn size="lg" onClick={() => onNavigate("custom-trip")}>Start Custom Trip Wizard <ArrowRight className="w-4 h-4" /></Btn>
          </div>
        )}
      </div>
      <BottomNav active="explore" onNavigate={onNavigate} />
    </div>
  );
}

// ─── Screen 3: Guide Packages ──────────────────────────────────────────────────

function PackagesScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <TopNav onNavigate={onNavigate} title="Guide Packages" showBack backScreen="destination" />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{GUIDES.length} guides in Kyoto</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {GUIDES.map(g => (
            <Card key={g.id} onClick={() => onNavigate("package-detail")} className="overflow-hidden">
              <div className="relative h-48">
                <UnsplashImg id={g.images[0]} w={600} h={300} alt={g.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {g.verified && <Badge variant="green"><Shield className="w-3 h-3" /> Verified</Badge>}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Heart className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Avatar src={g.avatar} size="sm" alt={g.name} />
                  <div>
                    <p className="text-white text-sm font-semibold">{g.name}</p>
                    <p className="text-white/70 text-xs">{g.experience} yrs exp</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{g.specialty}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{g.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${g.price}</p>
                    <p className="text-xs text-gray-400">per person</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {g.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <StarRating rating={g.rating} />
                    <span className="text-xs text-gray-500 ml-1">{g.rating} · {g.reviews} reviews</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Globe className="w-3 h-3" />{g.languages[0]}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{g.duration}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="explore" onNavigate={onNavigate} />
    </div>
  );
}

// ─── Screen 4: Package Detail ──────────────────────────────────────────────────

function PackageDetailScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const g = GUIDES[0];
  const [selectedImg, setSelectedImg] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Image gallery */}
      <div className="relative h-72">
        <UnsplashImg id={g.images[selectedImg]} w={800} h={500} alt={g.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <button onClick={() => onNavigate("packages")} className="absolute top-12 left-4 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {g.images.map((_, i) => (
            <button key={i} onClick={() => setSelectedImg(i)} className={`w-2 h-2 rounded-full transition-all ${i === selectedImg ? "bg-white w-6" : "bg-white/50"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-32">
        {/* Guide info */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={g.avatar} size="lg" alt={g.name} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{g.name}</h2>
                  {g.verified && <Shield className="w-4 h-4 text-[#0ea472]" />}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" />{g.location}</p>
              </div>
            </div>
            <button className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
              <Heart className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <StarRating rating={g.rating} size="md" />
              <span className="text-sm font-semibold text-gray-900">{g.rating}</span>
              <span className="text-sm text-gray-500">({g.reviews} reviews)</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600"><Award className="w-4 h-4 text-[#0ea472]" />{g.experience} years exp.</div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600"><Globe className="w-4 h-4 text-[#1a7fd4]" />{g.languages.join(", ")}</div>
          </div>
        </div>

        {/* Bio */}
        <div className="py-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">About {g.name.split(" ")[0]}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{g.bio}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {g.tags.map(tag => <Badge key={tag} variant="green">{tag}</Badge>)}
          </div>
        </div>

        {/* Itinerary */}
        <div className="py-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Day Itinerary</h3>
          <div className="relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100" />
            {g.itinerary.map((item, i) => (
              <div key={i} className="flex gap-4 mb-5 last:mb-0">
                <div className="w-10 h-10 rounded-full bg-[#f0faf6] border-2 border-[#0ea472] flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-xs font-bold text-[#0ea472]">{i + 1}</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs font-semibold text-[#0ea472] mb-0.5">{item.time}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inclusions */}
        <div className="py-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">What's included</h3>
          <div className="grid grid-cols-2 gap-2">
            {g.inclusions.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-[#f0faf6] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#0ea472]" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="py-5">
          <h3 className="font-semibold text-gray-900 mb-4">Reviews</h3>
          {[
            { name: "Emily C.", avatar: "photo-1438761681033-6461ffad8d80", rating: 5, text: "Hiroshi is an absolute legend. The pre-dawn Fushimi Inari walk was the highlight of our entire Japan trip. He knew every guard, every shortcut.", date: "Jun 2025" },
            { name: "David K.", avatar: "photo-1507003211169-0a1dd7228f2d", rating: 5, text: "The tea ceremony was unlike anything I'd experienced. Sensei Yamamoto is a true artist. Hiroshi's storytelling throughout the day made history feel alive.", date: "May 2025" },
          ].map((r, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <Avatar src={r.avatar} size="sm" alt={r.name} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky book bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${g.price}</span>
            <span className="text-gray-400 text-sm"> / person</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate("chat")} className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
            <Btn size="lg" onClick={() => onNavigate("request-submitted")}>Book Package</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5: Custom Trip Wizard ─────────────────────────────────────────────

const WIZARD_STEPS = ["Destination", "Dates", "Travelers", "Style", "Requirements", "Budget", "Notes", "Review"];

function CustomTripScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    destination: "Kyoto, Japan",
    startDate: "2025-07-14",
    endDate: "2025-07-16",
    travelers: 2,
    style: "Cultural & Historical",
    requirements: "Hidden temples, local food, no tourist traps",
    budget: 400,
    notes: "Anniversary trip — would love a special surprise element",
  });

  const setField = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const styles = ["Cultural & Historical", "Adventure & Nature", "Food & Culinary", "Photography", "Luxury & Wellness", "Family Friendly"];

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-4">
            <Input label="Where do you want to go?" placeholder="e.g. Kyoto, Japan" icon={MapPin} value={form.destination} onChange={v => setField("destination", v)} />
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map(d => (
                <button key={d.id} onClick={() => setField("destination", d.name)} className={`relative rounded-xl overflow-hidden h-24 border-2 transition-all ${form.destination === d.name ? "border-[#0ea472]" : "border-transparent"}`}>
                  <UnsplashImg id={d.image} w={300} h={200} alt={d.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                    <span className="text-white text-xs font-semibold">{d.name}</span>
                  </div>
                  {form.destination === d.name && <div className="absolute top-2 right-2 w-5 h-5 bg-[#0ea472] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <Input label="Start date" type="date" value={form.startDate} onChange={v => setField("startDate", v)} />
            <Input label="End date" type="date" value={form.endDate} onChange={v => setField("endDate", v)} />
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Number of travelers</label>
              <div className="flex items-center gap-6">
                <button onClick={() => setField("travelers", Math.max(1, form.travelers - 1))} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:border-[#0ea472] hover:text-[#0ea472] transition-all">−</button>
                <span className="text-3xl font-bold text-gray-900 w-12 text-center">{form.travelers}</span>
                <button onClick={() => setField("travelers", form.travelers + 1)} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:border-[#0ea472] hover:text-[#0ea472] transition-all">+</button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-3">
            {styles.map(s => (
              <button key={s} onClick={() => setField("style", s)} className={`p-4 rounded-xl border-2 text-left transition-all ${form.style === s ? "border-[#0ea472] bg-[#f0faf6]" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="text-sm font-semibold text-gray-900">{s}</p>
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Specific requirements or must-haves</label>
            <textarea
              value={form.requirements}
              onChange={e => setField("requirements", e.target.value)}
              rows={4}
              placeholder="e.g. No crowded tourist spots, vegetarian meals, early mornings..."
              className="w-full bg-[#f5f7fa] border border-transparent rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] resize-none transition-all"
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-700">Your total budget (USD)</label>
            <div className="text-center py-4">
              <span className="text-5xl font-bold text-gray-900">${form.budget}</span>
              <p className="text-sm text-gray-500 mt-1">for {form.travelers} {form.travelers === 1 ? "person" : "people"}</p>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={25}
              value={form.budget}
              onChange={e => setField("budget", parseInt(e.target.value))}
              className="w-full accent-[#0ea472]"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>$50</span><span>$2,000+</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[150, 300, 500, 750, 1000].map(b => (
                <button key={b} onClick={() => setField("budget", b)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${form.budget === b ? "bg-[#0ea472] text-white border-[#0ea472]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>${b}</button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Additional notes for guides</label>
            <textarea
              value={form.notes}
              onChange={e => setField("notes", e.target.value)}
              rows={5}
              placeholder="Anything else you'd like guides to know..."
              className="w-full bg-[#f5f7fa] border border-transparent rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] resize-none transition-all"
            />
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col gap-3">
            {[
              { label: "Destination", value: form.destination, icon: MapPin },
              { label: "Dates", value: `${form.startDate} → ${form.endDate}`, icon: Calendar },
              { label: "Travelers", value: `${form.travelers} ${form.travelers === 1 ? "person" : "people"}`, icon: Users },
              { label: "Travel Style", value: form.style, icon: Star },
              { label: "Budget", value: `$${form.budget}`, icon: DollarSign },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-[#f5f7fa] rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#0ea472]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => step === 0 ? onNavigate("destination") : setStep(s => s - 1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-600">{step + 1} of {WIZARD_STEPS.length}</span>
          <button onClick={() => onNavigate("landing")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#0ea472] transition-all duration-300 rounded-full" style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <Badge variant="green">{WIZARD_STEPS[step]}</Badge>
          <h2 className="mt-3 text-2xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
            {[
              "Where's your adventure?",
              "When are you going?",
              "How many travelers?",
              "What's your travel style?",
              "Any special requirements?",
              "What's your budget?",
              "Anything else to add?",
              "Review your trip request",
            ][step]}
          </h2>
        </div>
        {stepContent()}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {step < WIZARD_STEPS.length - 1 ? (
            <Btn size="lg" className="w-full" onClick={() => setStep(s => s + 1)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Btn>
          ) : (
            <Btn size="lg" className="w-full" onClick={() => onNavigate("request-submitted")}>
              Submit Trip Request <Send className="w-4 h-4" />
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6: Request Submitted ──────────────────────────────────────────────

function RequestSubmittedScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-[#f0faf6] border-4 border-[#0ea472] flex items-center justify-center mx-auto">
          <Check className="w-12 h-12 text-[#0ea472]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
          <Bell className="w-4 h-4 text-white" />
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
        Request Submitted!
      </h1>
      <p className="mt-3 text-gray-500 text-base max-w-xs leading-relaxed">
        Nearby guides have been notified. You'll start receiving personalized offers shortly.
      </p>

      {/* Animated pulse */}
      <div className="mt-8 relative">
        <div className="w-48 h-48 rounded-full border border-[#0ea472]/20 flex items-center justify-center relative">
          <div className="w-36 h-36 rounded-full border border-[#0ea472]/30 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#f0faf6] flex items-center justify-center">
              <Navigation className="w-10 h-10 text-[#0ea472]" />
            </div>
          </div>
          {/* Fake guide dots */}
          {[[-60, -20], [50, -50], [70, 30], [-40, 60], [10, 70]].map(([x, y], i) => (
            <div key={i} className="absolute w-9 h-9 bg-white border-2 border-[#0ea472] rounded-full overflow-hidden shadow-md" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)" }}>
              <img src={`https://images.unsplash.com/${GUIDES[i % 4].avatar}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#f5f7fa] rounded-2xl p-4 max-w-xs w-full text-left">
        <p className="text-xs font-semibold text-gray-500 mb-2">Trip Summary</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Destination</span><span className="font-semibold text-gray-900">Kyoto, Japan</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Dates</span><span className="font-semibold text-gray-900">Jul 14–16</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Budget</span><span className="font-semibold text-gray-900">$400</span></div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Btn size="lg" className="w-full" onClick={() => onNavigate("offers")}>
          View Offers <ChevronRight className="w-4 h-4" />
        </Btn>
        <Btn variant="outline" size="lg" className="w-full" onClick={() => onNavigate("traveler-dashboard")}>
          Go to Dashboard
        </Btn>
      </div>
    </div>
  );
}

// ─── Screen 7: Traveler Dashboard ─────────────────────────────────────────────

function TravelerDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const statusColors = { offers_received: "green", pending: "amber" } as const;
  const statusLabels = { offers_received: "Offers Received", pending: "Awaiting Offers" };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 pt-14 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src="photo-1472099645785-5658abf4ff4e" size="lg" alt="Alex" />
              <div>
                <p className="text-xs text-gray-500">Welcome back</p>
                <h2 className="text-xl font-bold text-gray-900">Alex M.</h2>
              </div>
            </div>
            <button className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Trips Taken", value: "7" },
              { label: "Countries", value: "4" },
              { label: "Reviews Given", value: "12" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#f5f7fa] rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">My Requests</h3>
          <Btn size="sm" onClick={() => onNavigate("custom-trip")}>
            <Plus className="w-4 h-4" /> New
          </Btn>
        </div>

        <div className="flex flex-col gap-4">
          {MY_REQUESTS.map(req => (
            <Card key={req.id} onClick={() => req.status === "offers_received" ? onNavigate("offers") : undefined} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{req.destination}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{req.date} · {req.travelers} travelers · {req.budget}</p>
                </div>
                <Badge variant={statusColors[req.status as keyof typeof statusColors]}>{statusLabels[req.status as keyof typeof statusLabels]}</Badge>
              </div>
              {req.status === "offers_received" && (
                <div className="mt-3 flex items-center justify-between bg-[#f0faf6] rounded-xl p-3">
                  <div className="flex -space-x-2">
                    {GUIDES.slice(0, req.offers).map(g => (
                      <Avatar key={g.id} src={g.avatar} size="sm" alt={g.name} />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0ea472]">{req.offers} offers</p>
                    <p className="text-xs text-gray-500">Tap to compare</p>
                  </div>
                </div>
              )}
              {req.status === "pending" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                  <Bell className="w-4 h-4" />
                  <span>Waiting for nearby guides to respond...</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Past trips */}
        <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Past Adventures</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { dest: "Bali, Indonesia", date: "Mar 2025", img: "photo-1537996194471-e657df975ab4", rating: 5 },
            { dest: "Santorini, Greece", date: "Oct 2024", img: "photo-1570077188670-e3a8d69ac5ff", rating: 5 },
          ].map(trip => (
            <Card key={trip.dest} className="overflow-hidden">
              <div className="h-28 relative">
                <UnsplashImg id={trip.img} w={300} h={200} alt={trip.dest} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <p className="text-white text-xs font-semibold">{trip.dest}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-white text-xs">{trip.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400">{trip.date}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="trips" onNavigate={onNavigate} />
    </div>
  );
}

// ─── Screen 8: Offers ─────────────────────────────────────────────────────────

function OffersScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <TopNav onNavigate={onNavigate} title="Offers Received" showBack backScreen="traveler-dashboard" />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Request recap */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#0ea472]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Kyoto, Japan · Jul 14–16</p>
            <p className="text-xs text-gray-500">Budget $300–450 · 2 travelers · Cultural & Historical</p>
          </div>
          <Badge variant="green">{OFFERS.filter(o => !dismissed.includes(o.id)).length} offers</Badge>
        </div>

        <div className="flex flex-col gap-4">
          {OFFERS.filter(o => !dismissed.includes(o.id)).map(offer => (
            <Card key={offer.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={offer.guide.avatar} size="lg" alt={offer.guide.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{offer.guide.name}</p>
                      {"verified" in offer.guide && offer.guide.verified && <Shield className="w-4 h-4 text-[#0ea472]" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{offer.guide.specialty}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarRating rating={offer.guide.rating} />
                      <span className="text-xs text-gray-500">{offer.guide.rating} ({offer.guide.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900">${offer.price}</p>
                    <p className="text-xs text-gray-400">total offer</p>
                  </div>
                </div>

                {/* Offer price indicator */}
                <div className="mt-3 bg-[#f5f7fa] rounded-xl p-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Your budget</span>
                    <span className="text-gray-500">Offer price</span>
                  </div>
                  <div className="relative h-1.5 bg-gray-200 rounded-full">
                    <div className="absolute left-0 top-0 h-full bg-gray-300 rounded-full w-3/5" />
                    <div
                      className={`absolute top-0 h-full rounded-full ${offer.price <= 450 ? "bg-[#0ea472]" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(100, (offer.price / 500) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">{offer.originalBudget}</span>
                    <span className={`font-semibold ${offer.price <= 450 ? "text-[#0ea472]" : "text-amber-600"}`}>${offer.price} {offer.price > 450 ? "↑ above" : "✓ within budget"}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-600 leading-relaxed border-l-2 border-[#0ea472]/30 pl-3">
                  "{offer.message}"
                </p>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => setDismissed(d => [...d, offer.id])} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors">
                  <X className="w-4 h-4" /> Decline
                </button>
                <button onClick={() => onNavigate("chat")} className="flex-1 py-2.5 rounded-xl border border-[#1a7fd4] text-sm font-semibold text-[#1a7fd4] hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors">
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
                <button onClick={() => onNavigate("request-submitted")} className="flex-1 py-2.5 rounded-xl bg-[#0ea472] text-sm font-semibold text-white hover:bg-[#0c9266] flex items-center justify-center gap-1.5 transition-colors">
                  <Check className="w-4 h-4" /> Accept
                </button>
              </div>
            </Card>
          ))}

          {dismissed.length === OFFERS.length && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No more offers right now.</p>
              <Btn variant="outline" size="sm" className="mt-3" onClick={() => setDismissed([])}>Reset</Btn>
            </div>
          )}
        </div>
      </div>
      <BottomNav active="trips" onNavigate={onNavigate} />
    </div>
  );
}

// ─── Screen 9: Chat ───────────────────────────────────────────────────────────

function ChatScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: m.length + 1, sender: "traveler", text: input, time: "Now" }]);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Chat header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => onNavigate("offers")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <Avatar src="photo-1507003211169-0a1dd7228f2d" size="md" alt="Hiroshi" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Hiroshi Tanaka</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#0ea472] rounded-full" />
              <span className="text-xs text-gray-500">Online · Kyoto, Japan</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Video className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip context bar */}
      <div className="bg-[#f0faf6] border-b border-[#c6eadc] px-4 py-2.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0ea472] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs text-gray-600 flex-1">Kyoto Cultural Tour · Jul 14–15 · <span className="font-semibold text-[#0ea472]">Offer: $340</span></span>
          <Btn size="sm" onClick={() => onNavigate("request-submitted")}>Confirm Booking</Btn>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-w-lg mx-auto w-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.sender === "traveler" ? "flex-row-reverse" : ""}`}>
            {msg.sender === "guide" && <Avatar src={msg.avatar!} size="sm" alt={msg.name!} />}
            <div className={`max-w-[75%] ${msg.sender === "traveler" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "traveler" ? "bg-[#0ea472] text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <Plus className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-[#f5f7fa] rounded-full px-4 py-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Message Hiroshi..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <Mic className="w-4 h-4 text-gray-400" />
          </div>
          <button onClick={send} className="w-9 h-9 bg-[#0ea472] rounded-full flex items-center justify-center hover:bg-[#0c9266] transition-colors">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 10: Guide Dashboard ───────────────────────────────────────────────

function GuideDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 pt-14 pb-6">
          {/* Mode toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button onClick={() => onNavigate("landing")} className="px-3 py-1 rounded-full text-xs font-semibold transition-all text-gray-500 hover:text-gray-700">Traveler</button>
              <button className="px-3 py-1 rounded-full text-xs font-semibold transition-all bg-[#0ea472] text-white shadow">Guide</button>
            </div>
            <button onClick={() => onNavigate("landing")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Switch to Traveler
            </button>
          </div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Avatar src="photo-1507003211169-0a1dd7228f2d" size="lg" alt="Hiroshi" />
              <div>
                <p className="text-xs text-[#0ea472] font-semibold">Guide Mode</p>
                <h2 className="text-xl font-bold text-gray-900">Hiroshi Tanaka</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={4.97} />
                  <span className="text-xs text-gray-500 ml-1">4.97 · 312 reviews</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="green"><Shield className="w-3 h-3" /> Verified</Badge>
              <span className="text-xs text-gray-400">Member since 2016</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "This Month", value: "$2,840", icon: DollarSign, color: "text-[#0ea472]" },
              { label: "Trips Done", value: "312", icon: Award, color: "text-[#1a7fd4]" },
              { label: "Rating", value: "4.97", icon: Star, color: "text-amber-500" },
              { label: "Requests", value: "3", icon: Bell, color: "text-purple-500" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#f5f7fa] rounded-xl p-3 text-center">
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 pb-24">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card onClick={() => onNavigate("nearby-requests")} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center">
              <Navigation className="w-5 h-5 text-[#0ea472]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Nearby</p>
              <p className="text-xs text-gray-500">3 new requests</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#1a7fd4]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Packages</p>
              <p className="text-xs text-gray-500">2 active</p>
            </div>
          </Card>
          <Card onClick={() => onNavigate("chat")} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Messages</p>
              <p className="text-xs text-gray-500">2 unread</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">+18% this month</p>
            </div>
          </Card>
        </div>

        {/* Active trips */}
        <h3 className="text-base font-bold text-gray-900 mb-3">Active Trips</h3>
        {[
          { traveler: "Marcus T.", dest: "Kyoto Cultural", date: "Today, 8:00 AM", avatar: "photo-1507003211169-0a1dd7228f2d", status: "In Progress" },
          { traveler: "Emily C.", dest: "Nara Day Trip", date: "Tomorrow, 9:00 AM", avatar: "photo-1438761681033-6461ffad8d80", status: "Confirmed" },
        ].map(trip => (
          <Card key={trip.traveler} className="p-4 mb-3 flex items-center gap-3">
            <Avatar src={trip.avatar} size="md" alt={trip.traveler} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{trip.dest}</p>
              <p className="text-xs text-gray-500">{trip.traveler} · {trip.date}</p>
            </div>
            <Badge variant={trip.status === "In Progress" ? "green" : "blue"}>{trip.status}</Badge>
          </Card>
        ))}

        {/* Earnings chart placeholder */}
        <h3 className="text-base font-bold text-gray-900 mt-5 mb-3">Earnings This Month</h3>
        <Card className="p-4">
          <div className="flex items-end justify-between gap-1 h-24">
            {[40, 65, 45, 80, 55, 90, 70, 60, 75, 85, 50, 95, 72, 88, 62, 78, 91, 68, 84, 77, 59, 83, 66, 92, 74, 87, 61, 79, 95, 82].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 29 ? "#0ea472" : `rgba(14,164,114,${0.2 + h / 200})` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Jun 1</span>
            <span className="text-xs font-bold text-[#0ea472]">$2,840 total</span>
            <span className="text-xs text-gray-400">Jun 30</span>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {[
            { icon: Home, label: "Home", screen: "guide-dashboard" as Screen },
            { icon: Navigation, label: "Requests", screen: "nearby-requests" as Screen },
            { icon: Package, label: "Packages", screen: "packages" as Screen },
            { icon: MessageCircle, label: "Messages", screen: "chat" as Screen },
            { icon: User, label: "Profile", screen: "guide-dashboard" as Screen },
          ].map(item => (
            <button key={item.label} onClick={() => onNavigate(item.screen)} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all">
              <item.icon className={`w-5 h-5 ${item.label === "Home" ? "text-[#0ea472]" : "text-gray-400"}`} />
              <span className={`text-[10px] font-semibold ${item.label === "Home" ? "text-[#0ea472]" : "text-gray-400"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 11: Nearby Requests ───────────────────────────────────────────────

function NearbyRequestsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof REQUESTS[0] | null>(null);
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <TopNav onNavigate={onNavigate} title="Nearby Requests" showBack backScreen="guide-dashboard" mode="guide" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#f0faf6] border border-[#c6eadc] flex items-center justify-center">
            <Navigation className="w-5 h-5 text-[#0ea472]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Kyoto, Japan</p>
            <p className="text-xs text-gray-500">Showing requests within 10 km</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f7fa] border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {REQUESTS.filter(r => !dismissed.includes(r.id)).map(req => (
            <Card key={req.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={req.avatar} size="md" alt={req.traveler} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{req.traveler}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{req.distance} away</p>
                      </div>
                      <Badge variant="blue">{req.style}</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="bg-[#f5f7fa] rounded-xl p-2.5 text-center">
                    <MapPin className="w-4 h-4 text-[#0ea472] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{req.destination.split(",")[0]}</p>
                    <p className="text-[10px] text-gray-400">Destination</p>
                  </div>
                  <div className="bg-[#f5f7fa] rounded-xl p-2.5 text-center">
                    <DollarSign className="w-4 h-4 text-[#0ea472] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{req.budget}</p>
                    <p className="text-[10px] text-gray-400">Budget</p>
                  </div>
                  <div className="bg-[#f5f7fa] rounded-xl p-2.5 text-center">
                    <Calendar className="w-4 h-4 text-[#0ea472] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{req.date}</p>
                    <p className="text-[10px] text-gray-400">Dates</p>
                  </div>
                </div>

                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 italic">"{req.notes}"</p>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{req.travelers} travelers</span>
                </div>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => setDismissed(d => [...d, req.id])} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors">
                  <X className="w-3.5 h-3.5" /> Ignore
                </button>
                <button onClick={() => { setSelectedRequest(req); setShowCounterModal(true); }} className="flex-1 py-2.5 rounded-xl border border-[#1a7fd4] text-xs font-semibold text-[#1a7fd4] hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors">
                  <DollarSign className="w-3.5 h-3.5" /> Counter
                </button>
                <button onClick={() => onNavigate("chat")} className="flex-1 py-2.5 rounded-xl bg-[#0ea472] text-xs font-semibold text-white hover:bg-[#0c9266] flex items-center justify-center gap-1.5 transition-colors">
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
              </div>
            </Card>
          ))}

          {dismissed.length === REQUESTS.length && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-3">No more nearby requests right now.</p>
              <Btn variant="outline" size="sm" onClick={() => setDismissed([])}>Reset</Btn>
            </div>
          )}
        </div>
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && selectedRequest && (
        <CounterOfferModal request={selectedRequest} onClose={() => setShowCounterModal(false)} onSend={() => { setShowCounterModal(false); onNavigate("guide-dashboard"); }} />
      )}
    </div>
  );
}

// ─── Screen 12: Counter Offer Modal ───────────────────────────────────────────

function CounterOfferModal({ request, onClose, onSend }: {
  request: typeof REQUESTS[0];
  onClose: () => void;
  onSend: () => void;
}) {
  const [price, setPrice] = useState(350);
  const [msg, setMsg] = useState("Hello! I'd love to guide you through Kyoto. I have a special route that covers hidden temples and local eateries that aren't in any guidebook.");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Send Counter Offer</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Traveler info */}
          <div className="flex items-center gap-3 bg-[#f5f7fa] rounded-xl p-3">
            <Avatar src={request.avatar} size="sm" alt={request.traveler} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{request.traveler}</p>
              <p className="text-xs text-gray-500">{request.destination} · {request.date} · Budget {request.budget}</p>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Your offer price (USD)</label>
            <div className="text-center py-3">
              <span className="text-4xl font-bold text-gray-900">${price}</span>
            </div>
            <input
              type="range"
              min={100}
              max={800}
              step={10}
              value={price}
              onChange={e => setPrice(parseInt(e.target.value))}
              className="w-full accent-[#0ea472]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$100</span>
              <span className="text-[#0ea472] font-semibold">Their budget: {request.budget}</span>
              <span>$800</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Your message</label>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={4}
              className="w-full bg-[#f5f7fa] border border-transparent rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] resize-none transition-all"
            />
          </div>

          <Btn size="lg" className="w-full" onClick={onSend}>
            <Send className="w-4 h-4" /> Send Offer · ${price}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  const navigate = (s: Screen) => setScreen(s);

  return (
    <div className="font-sans" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {screen === "landing" && <LandingScreen onNavigate={navigate} />}
      {screen === "destination" && <DestinationScreen onNavigate={navigate} />}
      {screen === "packages" && <PackagesScreen onNavigate={navigate} />}
      {screen === "package-detail" && <PackageDetailScreen onNavigate={navigate} />}
      {screen === "custom-trip" && <CustomTripScreen onNavigate={navigate} />}
      {screen === "request-submitted" && <RequestSubmittedScreen onNavigate={navigate} />}
      {screen === "traveler-dashboard" && <TravelerDashboardScreen onNavigate={navigate} />}
      {screen === "offers" && <OffersScreen onNavigate={navigate} />}
      {screen === "chat" && <ChatScreen onNavigate={navigate} />}
      {screen === "guide-dashboard" && <GuideDashboardScreen onNavigate={navigate} />}
      {screen === "nearby-requests" && <NearbyRequestsScreen onNavigate={navigate} />}
    </div>
  );
}
