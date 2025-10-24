# Real Estate Dashboard Frontend

A modern, responsive React/Next.js frontend for the WhatsApp Real Estate Listings system.

## 🚀 Features

- **Real-time Updates**: WebSocket integration for live listing updates
- **QR Code Scanner**: WhatsApp connection interface with QR code display
- **Search & Filter**: Advanced search and filtering capabilities
- **Image Gallery**: Zoom functionality for property images
- **Mobile Responsive**: Optimized for all device sizes
- **Modern UI**: Clean, professional design with smooth animations

## 🛠 Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Socket.IO Client** - Real-time WebSocket communication
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.js            # Dashboard page
│   ├── qr-scanner/        # QR Scanner page
│   ├── layout.js          # Root layout
│   ├── providers.js       # Context providers
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Navigation.js      # Main navigation
│   ├── ListingCard.js     # Individual listing card
│   ├── ListingsGrid.js    # Listings grid layout
│   ├── ImageGallery.js    # Image gallery with zoom
│   ├── SearchAndFilter.js # Search and filter UI
│   ├── StatsCards.js      # Statistics cards
│   ├── Notification.js    # Notification component
│   └── NotificationContainer.js
├── hooks/                 # Custom React hooks
│   ├── useSocket.js       # WebSocket connection hook
│   ├── useListings.js     # Listings data management
│   ├── useQRCode.js       # QR code management
│   └── index.js           # Hook exports
├── lib/                   # Utility libraries
│   ├── socket.js          # Socket.IO client setup
│   └── api.js             # API functions
└── utils/                 # Helper utilities
```

## 🔧 Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Ensure backend is running on port 3001

## 🔌 WebSocket Integration

The frontend uses WebSocket connections for real-time updates:

### Connection Flow

1. **Connect**: Automatically connects to backend WebSocket server
2. **Listen**: Receives real-time events for new listings and images
3. **Update**: Updates UI instantly without page refresh

### Events Received

- `new_listing` - New property listing added
- `new_image` - New image added to existing listing
- `qr_code` - WhatsApp QR code for connection
- `connection_status` - Connection status updates

## 🎨 UI Components

### Navigation

- Responsive navigation bar
- Connection status indicator
- Page routing

### Dashboard

- Statistics cards showing key metrics
- Search and filter functionality
- Real-time listings grid
- Pagination support

### QR Scanner

- QR code display for WhatsApp connection
- Connection status monitoring
- Step-by-step instructions

### Listing Cards

- Property information display
- Image gallery with zoom
- Contact information
- Responsive design

## 📱 Mobile Responsive

The application is fully responsive with:

- Mobile-first design approach
- Touch-friendly interactions
- Optimized layouts for all screen sizes
- Swipe gestures for image galleries

## 🔍 Search & Filter

Advanced search and filtering capabilities:

- **Text Search**: Search by location or broker name
- **Type Filter**: Filter by sale/rent
- **Location Filter**: Filter by specific location
- **BHK Filter**: Filter by number of bedrooms
- **Real-time Results**: Instant filtering without page reload

## 🖼 Image Gallery

Professional image gallery with:

- **Zoom Functionality**: Click to zoom images
- **Navigation**: Previous/next image navigation
- **Thumbnails**: Thumbnail strip for quick navigation
- **Fullscreen Mode**: Full-screen image viewing
- **Responsive**: Optimized for all devices

## 🔔 Notifications

Real-time notification system:

- **Toast Notifications**: Non-intrusive notifications
- **Auto-dismiss**: Notifications auto-remove after 5 seconds
- **Multiple Types**: Success, error, warning, and info notifications
- **Smooth Animations**: Framer Motion animations

## 🎭 Animations

Smooth animations throughout the application:

- **Page Transitions**: Smooth page load animations
- **Card Animations**: Staggered card loading
- **Hover Effects**: Interactive hover states
- **Loading States**: Skeleton loading animations

## 🚀 Performance

Optimized for performance:

- **React Query**: Intelligent caching and background updates
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js image optimization
- **Lazy Loading**: Components load as needed

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables required for frontend (connects to localhost:3001 by default).

## 🎯 Key Features Explained

### WebSocket Hooks

- **useSocket**: Manages WebSocket connection state
- **useListings**: Handles listings data with real-time updates
- **useQRCode**: Manages QR code display and WhatsApp connection

### Component Architecture

- **Modular Design**: Reusable components
- **Props Interface**: Clear prop definitions
- **Error Handling**: Comprehensive error states
- **Loading States**: Skeleton loading animations

### State Management

- **React Query**: Server state management
- **Local State**: Component-level state with useState
- **Real-time Updates**: WebSocket event handling

This frontend provides a professional, modern interface for monitoring real estate listings with real-time updates and excellent user experience.
