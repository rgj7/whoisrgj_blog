import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between h-14">
        <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 hover:text-gray-700">
          whoisrgj
        </Link>
        <div className="flex items-center gap-4 text-sm">
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
