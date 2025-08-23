# Office Nexus Schema - Frontend Application

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation & Setup
```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev

# Open your browser to http://localhost:5173
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── analytics/      # Dashboard analytics components
│   ├── capital/        # Capital management components
│   ├── common/         # Shared utility components
│   ├── forms/          # Form components and validation
│   ├── notifications/  # Notification system
│   ├── reports/        # Reporting and analytics
│   └── roi/           # ROI calculation components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Main page components (routes)
├── services/           # API and business logic services
└── types/              # TypeScript type definitions
```

## 🎯 Key Features

### 1. **Dashboard & Analytics**
- Business overview with key metrics
- Financial performance indicators
- Compliance status monitoring
- System health monitoring

### 2. **Company Management**
- Company profile management
- Directors & shareholders registry
- Capital & equity tracking
- Meeting minutes management
- Business plan & strategy

### 3. **Financial & Accounting**
- Accounting books
- General ledger
- Trial balance
- Invoices & receipts
- Fixed assets management

### 4. **HR & Operations**
- Employee records
- Payroll management
- Client & supplier registers
- Contract management

### 5. **Compliance & Legal**
- Tax returns
- Compliance calendar
- Audit reports
- Risk management

## 🛠️ Development Guide

### Adding New Pages
1. **Create the page component** in `src/pages/`
```tsx
// src/pages/NewFeature.tsx
import React from 'react';

const NewFeature = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">New Feature</h1>
      {/* Your content here */}
    </div>
  );
};

export default NewFeature;
```

2. **Add the route** in `src/App.tsx`
```tsx
import NewFeature from './pages/NewFeature';

// Add to Routes
<Route path="/new-feature" element={<NewFeature />} />
```

3. **Add navigation** in `src/components/AppSidebar.tsx`
```tsx
const newFeatureItems = [
  {
    title: "New Feature",
    url: "/new-feature",
    icon: FileText, // Import from lucide-react
  },
];
```

### Adding New Components
1. **Create the component** in `src/components/`
2. **Use shadcn/ui components** for consistent styling
3. **Follow the existing patterns** for props and styling
4. **Export from index files** for easy importing

### Styling Guidelines
- **Tailwind CSS** for utility-first styling
- **shadcn/ui components** for consistent design
- **Responsive design** with mobile-first approach
- **Dark/light theme** support via next-themes

### Data Management
- **React Query** for server state management
- **Custom hooks** for reusable data logic
- **Services** for API calls and business logic
- **Zod** for data validation

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
npm audit            # Security audit
```

## 📚 Technology Stack

### Frontend Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### UI & Styling
- **shadcn/ui** - High-quality, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, customizable icons

### State Management
- **React Query** - Server state management and caching
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation

### Routing
- **React Router DOM** - Client-side routing

### Charts & Data
- **Recharts** - Composable charting library
- **date-fns** - Modern date utility library

## 🎨 Component Library

### Base Components (shadcn/ui)
- `Button`, `Input`, `Select`, `Dialog`
- `Table`, `Card`, `Tabs`, `Form`
- `Alert`, `Toast`, `Badge`, `Avatar`
- And many more...

### Custom Components
- `AppSidebar` - Main navigation
- `DashboardHeader` - Page headers
- `CompanySelector` - Company switching
- `DataSyncNotification` - Sync status
- Various form components for different business needs

## 🔌 API Integration

### Service Layer
- **accountingService** - Financial data
- **companyService** - Company information
- **employeeService** - HR data
- **complianceService** - Legal compliance
- **reportService** - Analytics and reporting

### Data Fetching
```tsx
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';

const { data, isLoading, error } = useQuery({
  queryKey: ['company'],
  queryFn: companyService.getCompany,
});
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoint system** using Tailwind CSS
- **Sidebar collapse** on mobile devices
- **Touch-friendly** interactions

## 🌙 Theme Support

- **Light/dark mode** switching
- **System preference** detection
- **Persistent theme** storage
- **CSS variables** for theming

## 🧪 Testing & Quality

- **ESLint** for code quality
- **TypeScript** for type safety
- **Prettier** for code formatting
- **React DevTools** for debugging

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Static Hosting
- Vercel, Netlify, or any static hosting service
- Upload the `dist/` folder after building

## 📖 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contributing

1. **Follow the existing code style**
2. **Use TypeScript** for all new code
3. **Add proper comments** for complex logic
4. **Test your changes** before committing
5. **Update documentation** as needed

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts**: Change port in `vite.config.ts`
- **Build errors**: Check TypeScript errors with `npm run lint`
- **Styling issues**: Verify Tailwind CSS classes
- **Component errors**: Check component imports and props

### Getting Help
- Check the console for error messages
- Review the component documentation
- Check existing similar components for patterns
- Use React DevTools for debugging

---

**Happy coding! 🎉**

This frontend application provides a comprehensive business management dashboard with modern React patterns, beautiful UI components, and excellent developer experience.
