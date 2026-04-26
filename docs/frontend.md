# Frontend Documentation: VetClinic Pro

The VetClinic Pro frontend is a high-performance, accessible, and aesthetically premium web application built with **Next.js 14** and the **App Router**.

## 🎨 Design Philosophy: "The Clinical Curator"

The UI follows a unique "No-Line" design system that prioritizes information architecture over rigid borders.

- **Surface Hierarchy**: Uses background color shifts instead of borders to define sections.
- **Glassmorphism**: Subtle use of backdrop blurs and gradients to create a modern, "sterile-yet-welcoming" feel.
- **Typography**: Focused on **Inter** with editorial spacing for clarity.

Refer to [design.md](./design.md) for the full specification.

## 🏗️ Folder Structure

```text
apps/web/src/
├── app/                # App Router: Pages, Layouts, and Loading states
│   ├── (auth)/         # Group: Login, Password Recovery
│   ├── (dashboard)/    # Group: Main App (Requires Auth)
│   └── (root)/         # Group: Marketing / Landing (Optional)
├── components/         # React Components
│   ├── ui/             # shadcn/ui primitives (Radix UI based)
│   ├── dashboard/      # Feature-specific components
│   ├── layout/         # Shell, Sidebar, Navbar
│   └── shared/         # Reusable business components
├── hooks/              # Custom Hooks
│   ├── use-auth.ts     # Session and permission management
│   ├── use-socket.ts   # Real-time event handlers
│   └── use-api.ts      # Abstracted TanStack Query logic
├── lib/                # Utilities and API clients
│   ├── api.ts          # Axios instance with interceptors
│   ├── utils.ts        # Tailwind merge and formatting helpers
│   └── socket.ts       # Socket.io client configuration
└── types/              # Global TypeScript interfaces
```

## 🔄 State Management & Data Fetching

We use **TanStack Query (React Query) v5** for all server state.

- **Cache Keys**: Centrally managed to ensure consistent invalidation across the app.
- **Mutations**: Wrapped in custom hooks that provide optimistic updates and automatic toast notifications.
- **Real-time Sync**: Socket.io events trigger `queryClient.invalidateQueries()`, keeping the UI in sync with the server without manual refreshing.

### Example Hook Pattern

```typescript
export function usePets(clientId?: string) {
  return useQuery({
    queryKey: ['pets', { clientId }],
    queryFn: () => petsApi.getAll({ clientId }),
  });
}
```

## 🧩 UI Components

Built using **Tailwind CSS** and **shadcn/ui**. All components are:
1. **Responsive**: Fully functional on tablets and desktops.
2. **Accessible**: ARIA compliant via Radix UI.
3. **Themed**: Supports a refined teal/zinc palette with high contrast for readability.

## ⚡ Key Features implemented

- **Dynamic Calendar**: Interactive scheduling with `react-big-calendar`.
- **SOAP Medical Records**: Specialized forms for subjective/objective clinical notes.
- **Real-time Notifications**: Instant updates for appointments and low stock via Sonner toasts.
- **Interactive Dashboards**: Data visualization using `recharts`.

## 🚀 Development

- **Run Dev Server**: `pnpm dev`
- **Build for Production**: `pnpm build`
- **Linting**: `pnpm lint`
