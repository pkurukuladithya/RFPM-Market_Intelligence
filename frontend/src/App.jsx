/**
 * App Root — Sets up React Router with Sidebar layout.
 * All pages render inside the main content area.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import RatingPredictor from "./pages/RatingPredictor";
import PriceRecommender from "./pages/PriceRecommender";
import MarketAnalysis from "./pages/MarketAnalysis";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict-rating" element={<RatingPredictor />} />
            <Route path="/predict-price" element={<PriceRecommender />} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
