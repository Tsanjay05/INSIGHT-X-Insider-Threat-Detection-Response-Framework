import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Overview' },
  { path: '/threat-map', label: 'Threat Map' },
  { path: '/cases', label: 'Cases' },
  { path: '/users', label: 'Users' },
  { path: '/settings', label: 'Settings' },
  { path: '/reports', label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#1a1a1f] border-r border-gray-800 fixed h-full">
      <nav className="p-4 space-y-1">
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#b8ff3c]/10 text-[#b8ff3c] border-l-2 border-[#b8ff3c]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
