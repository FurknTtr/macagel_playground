import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app-container">
      {/* Outlet bileşeni, URL'e göre 'children' olan sayfaları buraya yansıtır (Örn: /login) */}
      <Outlet />
    </div>
  );
}

export default App;