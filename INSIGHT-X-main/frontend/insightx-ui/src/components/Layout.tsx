import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
