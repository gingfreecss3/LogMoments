
# 💭 LogMoments - Moments That Matter

A discreet mobile journal app for capturing special emotional moments - specifically when you're missing someone important to you.

![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.0.4-purple?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwindcss)

## 🌟 What is LogMoments?

Every time you have that feeling of longing or missing someone special, you quickly note it down with the date, time, and your thoughts. It becomes a beautiful collection of your feelings over time.

### Design Philosophy
- **Warm but subtle**: Feels meaningful without being obviously romantic
- **Public-safe**: Won't draw attention if used in public
- **Emotionally resonant**: Makes your feelings feel precious and important

## ✨ Features

### 📝 Core Functionality
- **Quick Capture**: Instantly capture moments with mood detection
- **Timeline View**: Beautiful chronological display of your thoughts
- **Offline Support**: Works seamlessly without internet connection
- **Smart Sync**: Automatically syncs when connection is restored

### 🎨 User Experience
- **Mobile-First Design**: Optimized for mobile devices
- **Intuitive Interface**: Clean, professional appearance
- **Mood Detection**: Automatically detects emotional tone
- **Time Adjustment**: Capture moments from the past

### 🔒 Privacy & Security
- **User Authentication**: Secure login with Supabase
- **Offline Storage**: Local data storage for privacy
- **Discreet Design**: Professional appearance for public use

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/logmoments.git
   cd logmoments
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Mobile**: Capacitor (iOS & Android native apps)
- **PWA**: Vite PWA Plugin with Workbox

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout
│   ├── QuickCapture.tsx # Moment capture interface
│   └── MomentsTimeline.tsx # Timeline display
├── pages/              # App pages
│   ├── Capture.tsx     # Main capture page
│   ├── Timeline.tsx    # Timeline view
│   ├── Insights.tsx    # Analytics & insights
│   └── Profile.tsx     # User profile
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── syncService.ts  # Offline sync service
│   └── offlineStorage.ts # Local storage
└── types/              # TypeScript type definitions
```

## 🎯 Key Components

### QuickCapture
The heart of the app - a beautiful interface for capturing moments:
- Mood detection based on keywords
- Time adjustment capabilities
- Offline support with sync
- Responsive design for all devices

### MomentsTimeline
Displays your captured moments in chronological order:
- Combines online and offline data
- Shows sync status
- Beautiful card-based layout
- Empty state with encouraging message

### SyncService
Handles data synchronization:
- Automatic sync when online
- Offline storage management
- Conflict resolution
- Background sync capabilities

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (`from-purple-500 to-blue-500`)
- **Background**: Neutral gray (`bg-neutral-50`)
- **Text**: Dark gray (`text-neutral-900`)
- **Accents**: Purple (`text-purple-500`)

### Typography
- Clean, readable fonts
- Consistent spacing
- Mobile-optimized sizing

### Icons
- Lucide React icons
- Consistent 16px/20px sizing
- Meaningful iconography

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Consistent component structure

## 📱 Mobile App

LogMoments now ships with full native mobile support powered by Capacitor.

### Quick Start
- `npm run mobile:sync` – Build the web app and sync native platforms
- `npm run mobile:android` – Open the Android project in Android Studio
- `npm run mobile:ios` – Open the iOS project in Xcode
- `npm run mobile:run:android` – Build, sync, and run on Android
- `npm run mobile:run:ios` – Build, sync, and run on iOS

Detailed instructions for Android & iOS builds, asset generation, and publishing workflows are available in [MOBILE.md](./MOBILE.md).

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables
Make sure to add these in your Vercel dashboard:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📈 Future Improvements

### 1. Enhanced Privacy Features
- **Discreet Mode**: Option to change the app icon and name to something generic
- **Password Protection**: Secure sensitive moments with an app lock
- **Code Words**: Use subtle code words instead of obvious romantic language

### 2. Emotional Journey Tracking
- **Visual Emotional Timeline**: Graphical representation of emotional patterns over time
- **Intensity Levels**: Track "missing you" feelings with a 1-5 heart scale
- **Seasonal Patterns & Anniversaries**: Highlight significant dates and recurring emotional trends

### 3. Meaningful Insights
- **Reflection Stats**: "You've been thinking about them for X days"
- **Emotional Analytics**: "Most common feeling this month: Longing"
- **Emotional Charts**: Beautiful visualizations of your emotional journey

### 4. Enhanced Capture Experience
- **Voice Notes**: Capture your feelings through voice when typing isn't convenient
- **Photo Attachments**: Add subtle, meaningful images to moments
- **Location Tagging**: Save the location where you had the thought

### 5. Special Features
- **Distance Counter**: Track distance in a long-distance relationship
- **Next Meetup Countdown**: Countdown timer for the next planned meeting
- **Gentle Reminders**: Non-intrusive prompts to log new moments
- **Export PDF Journals**: Create beautifully formatted PDF exports of your moments

## 🙏 Acknowledgments

- Built with love for capturing precious moments
- Inspired by the beauty of human connection
- Designed for privacy and emotional safety

---

**Made with 💜 for moments that matter**

*"Every feeling is a story worth telling"*
