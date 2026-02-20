import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Post from './pages/Post'
import Page from './pages/Page'
import TagFeed from './pages/TagFeed'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import PostEditor from './pages/admin/PostEditor'
import PageEditor from './pages/admin/PageEditor'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<Post />} />
            <Route path="/pages/:slug" element={<Page />} />
            <Route path="/tags/:slug" element={<TagFeed />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts/new"
              element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts/:id/edit"
              element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pages/new"
              element={
                <ProtectedRoute>
                  <PageEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pages/:id/edit"
              element={
                <ProtectedRoute>
                  <PageEditor />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
