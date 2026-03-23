import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SubscriptionPlanPage from './pages/subscription/SubscriptionPlanPage';
import AnniversaryPage from './pages/subscription/AnniversaryPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/subscription" element={<SubscriptionPlanPage />} />
        <Route path="/subscription/:subscriptionId/anniversaries" element={<AnniversaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
