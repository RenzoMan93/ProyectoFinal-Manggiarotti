import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublishItem from './pages/PublishItem';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ChatThread from './pages/ChatThread';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import SavedSearches from './pages/SavedSearches';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingresar" element={<Login />} />
          <Route path="/registrarse" element={<Register />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/perfil/:uid" element={<Profile />} />
          <Route
            path="/publicar"
            element={
              <ProtectedRoute>
                <PublishItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes/:chatId"
            element={
              <ProtectedRoute>
                <ChatThread />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/busquedas-guardadas"
            element={
              <ProtectedRoute>
                <SavedSearches />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        ReUsalo · Compra y venta de segunda mano en Uruguay
      </footer>
    </div>
  );
}

export default App;
