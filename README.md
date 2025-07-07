# 🎓 Varsity Heights - University Dating App

A modern, university-focused dating app built specifically for college students and young professionals (ages 18-28). Features Tinder-like swiping, campus-based matching, student verification, and university-specific features.

## ✨ Features

### 🔐 Authentication & Security
- **University Email Verification** - Prioritizes .edu email addresses for instant verification
- **Social Login** - Google and Facebook OAuth integration
- **Student ID Verification** - Optional upload for verified student badges
- **Safety Features** - Block/report functionality with robust moderation
- **Privacy Controls** - Profile visibility toggles and strict RLS policies

### 👤 Enhanced Profile System
- **Photo Upload** - Up to 6 profile photos with drag-and-drop interface
- **University Information** - University, major, year of study, graduation year
- **Smart Interest Tags** - 20+ predefined interests + custom options (max 8)
- **Gender & Relationship Preferences** - Inclusive options and relationship goals
- **Bio & Personal Info** - 500-character bio with real-time counter
- **Verified Badges** - Student verification and university email badges

### 💕 Tinder-like Discovery
- **Swipe Interface** - Drag-to-swipe with smooth animations and visual feedback
- **Smart Filtering** - University, course, age, year of study filters
- **Campus-Based Matching** - Location and university-specific recommendations
- **Match Detection** - Instant match notifications and celebrations
- **Card Stack UI** - Beautiful card design with next card preview
- **Profile Details** - Comprehensive profile view with interests and university info

### 💬 Real-Time Chat System
- **Instant Messaging** - Real-time chat only available after mutual matches
- **Rich Media Support** - Text, emojis, GIFs, voice notes, and image sharing
- **Match History** - View all matches with easy access to start conversations
- **Chat Features** - Modern chat UI with read receipts and typing indicators

### 🎯 Date Ideas & Icebreakers
- **AI-Suggested Date Ideas** - Campus-friendly date suggestions categorized by:
  - 📚 Study dates (library, coffee shops)
  - 🎉 Casual activities (campus events, walks)
  - 🍕 Food adventures (food trucks, dining)
  - 🏃‍♀️ Active dates (hiking, sports)
  - 🎨 Cultural events (museums, theater)
- **Smart Icebreakers** - Conversation starters categorized by:
  - 😄 Fun questions
  - 🤔 Deep conversations
  - 📖 Study-related topics
  - 💫 Interest exploration
- **Copy-to-Use** - Easy clipboard integration for chat usage

### 🛡️ Safety & Privacy
- **Blocking System** - Block users with optional reason reporting
- **Report Feature** - Report inappropriate behavior with detailed descriptions
- **Profile Moderation** - Strict verification for fake profiles
- **Visibility Controls** - Toggle profile visibility on/off
- **Data Protection** - Row-Level Security (RLS) for all sensitive data

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, unstyled components
- **Lucide React** for consistent iconography
- **React Router** for client-side routing
- **React Hook Form** for form management
- **Sonner** for beautiful toast notifications

### Backend & Database
- **Supabase** for backend-as-a-service
- **PostgreSQL** for robust data storage
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for chat functionality
- **File Storage** for photos and attachments

### Authentication
- **Supabase Auth** with email/password
- **OAuth Integration** (Google, Facebook)
- **JWT tokens** for secure session management
- **Email verification** workflows

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Landing page hero
│   ├── Features.tsx       # Feature showcase
│   ├── Safety.tsx         # Safety information
│   ├── DateIdeas.tsx      # Date ideas & icebreakers
│   └── ...
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Authentication
│   ├── Dashboard.tsx      # User dashboard
│   ├── Profile.tsx        # Profile management
│   ├── Discover.tsx       # Swipe/discovery
│   ├── Matches.tsx        # Match management
│   ├── Chat.tsx          # Chat interface
│   └── NotFound.tsx      # 404 page
├── lib/
│   └── utils.ts          # Utility functions
├── hooks/
│   └── use-toast.ts      # Toast hook
└── integrations/
    └── supabase/         # Supabase client & types
```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User profile information, preferences, photos
- **matches** - Mutual like relationships between users
- **likes** - One-way like/pass tracking
- **messages** - Chat messages with rich media support
- **blocked_users** - User blocking for safety
- **reports** - User reporting system
- **date_ideas** - Curated date suggestions
- **icebreakers** - Conversation starter questions

### Storage Buckets
- **profile-photos** - User profile images (public)
- **student-verification** - Student ID documents (private)
- **chat-attachments** - Chat media files (public)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd varsity-heights-dating
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migration from `supabase/migrations/`
   - Set up authentication providers (Google, Facebook)
   - Configure storage buckets

4. **Environment Configuration**
   Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel, Netlify, or any static hosting
   - Configure environment variables
   - Set up custom domain and SSL

## 🎨 Design Philosophy

### Mobile-First Approach
- Responsive design optimized for mobile devices
- Touch-friendly interactions and swipe gestures
- Progressive Web App capabilities

### University-Specific Features
- Campus location integration
- Academic year and major matching
- Student-friendly date ideas and activities
- Budget-conscious recommendations

### Safety & Trust
- Multiple verification layers
- Comprehensive reporting system
- Privacy-first approach to data handling
- Clear community guidelines

## 🧑‍💻 Development Features

### Code Quality
- TypeScript for type safety
- ESLint configuration for code consistency
- Component-based architecture
- Reusable UI component library

### Performance
- Vite for fast development builds
- Image optimization and lazy loading
- Efficient data fetching with React Query
- Real-time updates with minimal re-renders

### Accessibility
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## 📱 Key User Flows

### 1. Registration & Setup
1. Sign up with university email or social login
2. Email verification process
3. Complete profile with photos and interests
4. Optional student ID verification
5. Set preferences and privacy settings

### 2. Discovery & Matching
1. Browse profiles with smart filtering
2. Swipe right to like, left to pass
3. Receive match notifications
4. Start conversations with matches

### 3. Communication
1. Access date ideas and icebreakers
2. Send messages with rich media
3. Plan dates using suggestion system
4. Build meaningful connections

## 🔮 Future Enhancements

### Planned Features
- **Campus Events Integration** - Sync with university event calendars
- **Group Date Features** - Organize group activities and meetups
- **Video Chat** - In-app video calling for matches
- **Compatibility Quiz** - Advanced matching algorithm
- **Dating Journal** - Track date experiences and feedback
- **Premium Features** - Super likes, read receipts, advanced filters

### Technical Improvements
- **Push Notifications** - Real-time match and message notifications
- **Offline Support** - PWA capabilities for offline browsing
- **Advanced Analytics** - User behavior insights and optimization
- **AI Matching** - Machine learning for better compatibility

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- University students who provided feedback and insights
- Open source community for amazing tools and libraries
- Design inspiration from modern dating platforms
- Campus safety organizations for security best practices

---

**Varsity Heights** - Where University Hearts Connect 💕🎓
