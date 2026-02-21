import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const publicAxios = axios.create()

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [navLinks, setNavLinks] = useState([])

  useEffect(() => {
    publicAxios
      .get('/api/nav-links')
      .then((res) => setNavLinks(res.data))
      .catch(() => {})
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-b from-navy-950 to-navy-900 relative">
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-400/50 to-transparent" />

      <div className="container mx-auto px-4 max-w-4xl grid grid-cols-3 items-center h-28">
        <div className="justify-self-start">
          <Link to="/">
            <img
              src="/whoisrgj_logo.png"
              alt="whoisrgj"
              className="h-12 w-auto opacity-85 hover:opacity-100 transition-opacity duration-300"
            />
          </Link>
        </div>

        <div className="justify-self-center flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.page) {
              return (
                <Link key={link.id} to={`/pages/${link.page.slug}`} className="nav-link">
                  {link.page.title}
                </Link>
              )
            }
            if (link.custom_url && link.custom_url.startsWith('/')) {
              return (
                <Link key={link.id} to={link.custom_url} className="nav-link">
                  {link.custom_label}
                </Link>
              )
            }
            return (
              <a key={link.id} href={link.custom_url} target="_blank" rel="noopener noreferrer" className="nav-link">
                {link.custom_label}
              </a>
            )
          })}
        </div>

        <div className="justify-self-end flex items-center gap-4">
          {token ? (
            <>
              <Link
                to="/admin"
                className="text-navy-200 hover:text-navy-50 transition-colors duration-200"
                style={{ fontSize: '0.85rem', letterSpacing: '0.13em', textTransform: 'uppercase' }}
              >
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-navy-300 hover:text-navy-100 transition-colors duration-200"
                style={{ fontSize: '0.85rem', letterSpacing: '0.13em', textTransform: 'uppercase' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-navy-600 text-navy-200 hover:border-navy-400 hover:text-navy-50 rounded px-3 py-1.5 transition-colors duration-200"
              style={{ fontSize: '0.85rem', letterSpacing: '0.13em', textTransform: 'uppercase' }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
