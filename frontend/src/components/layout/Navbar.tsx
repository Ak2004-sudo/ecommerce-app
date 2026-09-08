import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const linkClass = 'text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors'

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-bold text-gray-900" onClick={() => setMenuOpen(false)}>
          Shoply
        </Link>

        <button
          type="button"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/products" className={linkClass}>
            Products
          </Link>
          {isAdmin && (
            <Link to="/admin" className={linkClass}>
              Admin
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/orders" className={linkClass}>
              My Orders
            </Link>
          )}
          <Link to="/cart" className="relative flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hi, {user?.full_name.split(' ')[0]}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 bg-white px-4 py-3 sm:hidden">
          <Link to="/products" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Products
          </Link>
          {isAdmin && (
            <Link to="/admin" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/orders" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
          )}
          <Link to="/cart" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Cart {itemCount > 0 ? `(${itemCount})` : ''}
          </Link>
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="py-2 text-left text-sm font-medium text-gray-700">
              Logout ({user?.full_name.split(' ')[0]})
            </button>
          ) : (
            <>
              <Link to="/login" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
