import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopBanner from './components/layout/TopBanner'
import Header from './components/layout/Header'
import SubNav from './components/layout/SubNav'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import PlantDetail from './pages/PlantDetail'
import './App.css'

function Layout({ children }) {
  return (
    <>
      <TopBanner />
      <Header />
      <SubNav />
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/gallery"
          element={
            <Layout>
              <Gallery />
            </Layout>
          }
        />
        <Route
          path="/gallery/:id"
          element={
            <Layout>
              <PlantDetail />
            </Layout>
          }
        />
        {/* Placeholder routes for future pages */}
        <Route
          path="*"
          element={
            <Layout>
              <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af' }}>
                <p style={{ fontSize: '48px' }}>🚧</p>
                <h2 style={{ color: '#374151' }}>준비 중인 페이지입니다</h2>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
