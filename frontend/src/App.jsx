import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import { PredictionProvider } from './hooks/usePrediction';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Results from './pages/Results';
import History from './pages/History';
import Analytics from './pages/Analytics';
import ModelInsights from './pages/ModelInsights';
import AboutModel from './pages/AboutModel';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <PredictionProvider>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="predict" element={<Prediction />} />
                <Route path="results" element={<Results />} />
                <Route path="history" element={<History />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="model-insights" element={<ModelInsights />} />
                <Route path="about" element={<AboutModel />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </PredictionProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
