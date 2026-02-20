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
    <nav className="bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl grid grid-cols-3 items-center h-28">
        <div className="justify-self-start">
          <Link to="/">
            <img src="/whoisrgj_logo_invert.png" alt="whoisrgj" className="h-12 w-auto" />
          </Link>
        </div>
        <div className="justify-self-center flex items-center gap-6 text-sm">
          {navLinks.map((link) => {
            const className = "font-bold text-gray-600 hover:text-gray-900"
            if (link.page) {
              return (
                <Link key={link.id} to={`/pages/${link.page.slug}`} className={className}>
                  {link.page.title}
                </Link>
              )
            }
            if (link.custom_url && link.custom_url.startsWith('/')) {
              return (
                <Link key={link.id} to={link.custom_url} className={className}>
                  {link.custom_label}
                </Link>
              )
            }
            return (
              <a key={link.id} href={link.custom_url} target="_blank" rel="noopener noreferrer" className={className}>
                {link.custom_label}
              </a>
            )
          })}
        </div>
        <div className="justify-self-end flex items-center gap-4 text-sm">
          {token ? (
            <>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-500 hover:text-gray-900">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
