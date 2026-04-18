import { Route, Routes, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Providers from './pages/Providers';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold py-2 px-4 rounded-md ${
    isActive ? 'bg-brand-900 text-white' : 'text-brand-700 hover:bg-brand-100'
  }`;

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">WONESE Healthcare</p>
            <h1 className="text-2xl font-semibold">Staff Portal</h1>
          </div>
          <nav className="flex gap-2">
            <NavLink to="/" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/providers" className={navClass}>
              Providers
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/providers" element={<Providers />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
