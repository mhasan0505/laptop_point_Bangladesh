# 💻 Laptop Point Bangladesh

A modern, high-performance e-commerce platform specializing in premium refurbished laptops. Built with Next.js 16, TypeScript, and cutting-edge web technologies for an exceptional user experience.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-f03e2f?style=flat-square&logo=sanity)](https://www.sanity.io/)

## 🚀 Features

### Customer Experience

- **Smart Product Discovery**: Advanced filtering by brand, processor, RAM, storage, and price range
- **Product Comparison**: Compare up to 3 laptops side-by-side with detailed specifications
- **Wishlist & Cart**: Persistent shopping experience with localStorage integration
- **Recently Viewed**: Track and display recently browsed products
- **Interactive Product Gallery**: High-quality images with zoom and multiple views
- **Real-time Stock Status**: Live inventory tracking
- **SEO Optimized**: Dynamic meta tags, structured data, and sitemap generation

### Business Features

- **Admin Dashboard**: Comprehensive management for products, orders, inventory, and analytics
- **Sanity CMS Integration**: Easy content management for blog posts and product updates
- **Facebook Pixel**: Advanced conversion tracking and analytics
- **Performance Monitoring**: Vercel Analytics and Speed Insights integration
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Flash Sales Banner**: Promotional campaigns with countdown timers

### Technical Highlights

- **Server Components**: Leveraging Next.js App Router for optimal performance
- **Image Optimization**: Next.js Image component with custom loader
- **Type Safety**: Full TypeScript coverage across the codebase
- **Modern UI**: Radix UI primitives with Tailwind CSS v4
- **Animations**: Framer Motion for smooth, professional interactions
- **Maps Integration**: Leaflet for store location display

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.1

### Content & Data

- **CMS**: Sanity 4.19
- **Database**: MongoDB 7.0
- **State Management**: React Context API

### UI Components

- **Component Library**: Radix UI (Dialog, Slot)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Carousel**: Swiper 12.x
- **Maps**: Leaflet

### Developer Experience

- **Package Manager**: pnpm 10.28
- **Linting**: ESLint 9
- **CSS Processing**: PostCSS with Autoprefixer

### Analytics & Monitoring

- **Vercel Analytics**: User behavior tracking
- **Speed Insights**: Performance monitoring
- **Facebook Pixel**: Conversion tracking

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/mhasan0505/laptop_point_Bangladesh.git
cd laptop_point_Bangladesh
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_TOKEN=your_api_token

# MongoDB (if applicable)
MONGODB_URI=your_mongodb_connection_string

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

4. **Run the development server**

```bash
pnpm dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Open Sanity Studio**
   Navigate to [http://localhost:3000/studio](http://localhost:3000/studio)

7. **Deploy schema to Sanity Content Lake**

```bash
pnpm sanity:deploy-schema
```

## 🏗️ Project Structure

```
laptop_point_bangladesh/
├── app/
│   ├── (main)/              # Public-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── shop/            # Product listing & filtering
│   │   ├── product/         # Product detail pages
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout process
│   │   ├── compare/         # Product comparison
│   │   ├── wishlist/        # User wishlist
│   │   ├── blog/            # Blog posts
│   │   └── ...
│   ├── admin/               # Admin dashboard
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order management
│   │   ├── inventory/       # Stock management
│   │   └── analytics/       # Business analytics
│   ├── data/                # Product data & navigation
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── providers.tsx        # Context providers
├── components/
│   ├── admin/               # Admin-specific components
│   ├── application/         # Main app components
│   ├── navigation/          # Navigation components
│   ├── product/             # Product-related components
│   ├── shop/                # Shop page components
│   ├── seo/                 # SEO components
│   └── ui/                  # Reusable UI components
├── contexts/
│   ├── CartContext.tsx      # Shopping cart state
│   ├── WishlistContext.tsx  # Wishlist state
│   └── ComparisonContext.tsx # Product comparison state
├── lib/
│   ├── utils.ts             # Utility functions
│   ├── seo-config.ts        # SEO configuration
│   ├── fpixel.js            # Facebook Pixel integration
│   ├── sanity.client.ts     # Sanity client setup
│   └── ...
├── types/
│   ├── product.ts           # Product type definitions
│   ├── cart.ts              # Cart type definitions
│   └── ...
├── public/
│   ├── products/            # Product images
│   ├── brand_logo/          # Brand logos
│   └── ...
├── sanity/                  # Sanity CMS schemas
├── docs/                    # Documentation
└── scripts/                 # Build & utility scripts
```

## 🎨 Key Features Explained

### Product Comparison

Users can select up to 3 products and compare their specifications side-by-side including processor, RAM, storage, display, graphics, and more.

### Recently Viewed Products

Automatically tracks and displays the last 10 products a user has viewed, stored in localStorage for persistent experience.

### Advanced Filtering

- **Brand**: HP, Dell, Lenovo, Microsoft
- **Processor**: Intel Core i5, i7, i9 (various generations)
- **RAM**: 8GB, 16GB, 32GB, 64GB
- **Storage**: 256GB, 512GB, 1TB, 2TB
- **Price Range**: Dynamic price slider

### Admin Dashboard

Comprehensive backend for:

- Product CRUD operations
- Inventory management
- Order processing
- Sales analytics
- Content management

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server (Turbopack)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
```

## 📊 Performance Optimizations

- **Image Optimization**: Automatic image compression and responsive sizing
- **Code Splitting**: Route-based and component-based splitting
- **Server Components**: Reduced client-side JavaScript
- **Static Generation**: Pre-rendered pages for faster load times
- **Font Optimization**: Automatic font subsetting and preloading
- **Lazy Loading**: Images and components load on demand

## 🔐 Security

- Environment variables for sensitive data
- Input validation and sanitization
- Secure authentication for admin routes
- HTTPS enforcement in production
- Content Security Policy headers

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy automatically on push

```bash
# Deploy to Vercel
vercel --prod
```

### Manual Deployment

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## 📄 Documentation

Detailed documentation is available in the `/docs` folder:

- [SEO Implementation](docs/SEO_IMPLEMENTATION.md)
- [Facebook Pixel Setup](docs/FACEBOOK_PIXEL_SETUP.md)
- [Performance Optimization](docs/PERFORMANCE_OPTIMIZATION.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Contact

**Laptop Point Bangladesh**

- Website: [laptoppointbd.com](https://laptoppointbd.com)
- GitHub: [@mhasan0505](https://github.com/mhasan0505)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Sanity](https://www.sanity.io/) - Content management
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives

---

Built with ❤️ by the Laptop Point Bangladesh team
