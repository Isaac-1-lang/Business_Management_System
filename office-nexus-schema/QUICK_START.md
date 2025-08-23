# 🚀 Quick Start Guide - Office Nexus Schema

## ⚡ Get Started in 5 Minutes

### 1. Install Dependencies
```bash
# Navigate to the project directory
cd office-nexus-schema

# Install dependencies (choose one)
npm install
# or
bun install
# or
yarn install
```

### 2. Start Development Server
```bash
# Start the development server
npm run dev
# or
bun dev
# or
yarn dev
```

### 3. Open Your Browser
- Navigate to: `http://localhost:5173`
- You should see the main dashboard!

## 🎯 What You'll See

- **Main Dashboard**: Business overview with key metrics
- **Sidebar Navigation**: Access to all application features
- **Company Selector**: Switch between different companies
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Your First Changes

### Change the Dashboard Title
1. Open `src/components/DashboardHeader.tsx`
2. Find the `<h1>` tag
3. Change "Dashboard" to your preferred title
4. Save the file - changes appear instantly!

### Add a New Menu Item
1. Open `src/components/AppSidebar.tsx`
2. Find the appropriate section (e.g., `companyItems`)
3. Add a new item:
```tsx
{
  title: "My New Feature",
  url: "/my-feature",
  icon: FileText, // Import from lucide-react
}
```

### Create a New Page
1. Create `src/pages/MyFeature.tsx`:
```tsx
import React from 'react';

const MyFeature = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My New Feature</h1>
      <p>This is my new page!</p>
    </div>
  );
};

export default MyFeature;
```

2. Add route in `src/App.tsx`:
```tsx
import MyFeature from './pages/MyFeature';

// Add to Routes
<Route path="/my-feature" element={<MyFeature />} />
```

## 🔍 Key Files to Know

| File | Purpose | What to Modify |
|------|---------|----------------|
| `src/App.tsx` | Main app & routing | Add new routes |
| `src/pages/Index.tsx` | Dashboard home page | Main dashboard layout |
| `src/components/AppSidebar.tsx` | Navigation menu | Add menu items |
| `src/components/DashboardHeader.tsx` | Page headers | Customize titles |
| `src/services/*.ts` | Data & business logic | API calls, data handling |

## 🎨 Styling with Tailwind CSS

### Common Classes
- `p-6` = padding: 1.5rem
- `text-2xl` = font-size: 1.5rem
- `font-bold` = font-weight: 700
- `bg-white` = background-color: white
- `rounded-lg` = border-radius: 0.5rem
- `hover:bg-gray-100` = hover background color

### Responsive Design
- `grid-cols-1 lg:grid-cols-3` = 1 column on mobile, 3 on large screens
- `hidden md:block` = hidden on mobile, visible on medium+ screens

## 📱 Component Patterns

### Basic Component Structure
```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  data?: any[];
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, data = [] }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {/* Your content here */}
    </div>
  );
};
```

### Using shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MyCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click Me</Button>
      </CardContent>
    </Card>
  );
};
```

## 🔌 Data & State Management

### Using React Query
```tsx
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';

const { data, isLoading, error } = useQuery({
  queryKey: ['company'],
  queryFn: companyService.getCurrentCompany,
});

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return <div>Company: {data?.name}</div>;
```

### Local State with useState
```tsx
import { useState } from 'react';

const [count, setCount] = useState(0);

return (
  <div>
    <p>Count: {count}</p>
    <Button onClick={() => setCount(count + 1)}>Increment</Button>
  </div>
);
```

## 🚨 Common Issues & Solutions

### "Module not found" Error
- Check import paths (use `@/` for src directory)
- Ensure file exists in the correct location
- Restart dev server: `Ctrl+C` then `npm run dev`

### Styling Not Working
- Verify Tailwind CSS classes are correct
- Check if component is wrapped in proper layout
- Use browser dev tools to inspect elements

### Component Not Rendering
- Check console for JavaScript errors
- Verify component is properly exported
- Ensure route is correctly configured

## 📚 Next Steps

1. **Explore Components**: Look through `src/components/` to see available UI elements
2. **Check Services**: Review `src/services/` to understand data handling
3. **Study Pages**: Examine `src/pages/` to see how pages are structured
4. **Read README**: Check the main `README.md` for comprehensive documentation

## 🆘 Need Help?

- **Check the console** for error messages
- **Review existing components** for patterns
- **Use React DevTools** for debugging
- **Check the main README.md** for detailed information

---

**Happy coding! 🎉**

The application is designed to be developer-friendly with clear patterns and comprehensive documentation. Start small and build up your understanding gradually!
