import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import Error Boundary
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load components for performance optimization
const GV_TopNav = React.lazy(() => import('@/components/views/GV_TopNav'));
const GV_Footer = React.lazy(() => import('@/components/views/GV_Footer'));
const UV_Home = React.lazy(() => import('@/components/views/UV_Home'));
const UV_PortfolioGallery = React.lazy(() => import('@/components/views/UV_PortfolioGallery'));
const UV_ProjectDetails = React.lazy(() => import('@/components/views/UV_ProjectDetails'));
const UV_About = React.lazy(() => import('@/components/views/UV_About'));
const UV_Contact = React.lazy(() => import('@/components/views/UV_Contact'));
const UV_Customization = React.lazy(() => import('@/components/views/UV_Customization'));

// Import Zustand store hook
import { useAppStore } from '@/store/main';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { is_authenticated } = useAppStore(state => ({
    is_authenticated: state.is_authenticated,
  }));

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <GV_TopNav aria-label="Global Navigation" />

            <Routes>
              <Route path="/" element={<UV_Home />} />
              <Route path="/portfolio" element={<UV_PortfolioGallery />} />
              <Route path="/portfolio/:project_id" element={<UV_ProjectDetails />} />
              <Route path="/about" element={<UV_About />} />
              <Route path="/contact" element={<UV_Contact />} />
              <Route
                path="/customization"
                element={is_authenticated ? <UV_Customization /> : <UV_Home />}
              />
            </Routes>

            <GV_Footer aria-label="Global Footer" />
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </Router>
  );
};

export default App;