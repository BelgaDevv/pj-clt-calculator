import React, { useState } from "react";
import Auth from "./components/Auth/Auth.jsx";
import Home from "./pages/Home/Home.jsx";
import "./App.css";
import Help from "./pages/Help/Help.jsx";

export default function App() {
  const [telaAtiva, setTelaAtiva] = useState(
    localStorage.getItem('userId') ? 'home' : 'auth'
  );
  const [userIdLogado, setUserIdLogado] = useState(
    localStorage.getItem('userId')
  );

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserIdLogado(null);
    setTelaAtiva('auth');
  };

  // This function manages the storage and state of the real UUID obtained upon login
  const handleLoginSucesso = (idRecebidoDoJava) => {
    localStorage.setItem('userId', idRecebidoDoJava);

    setUserIdLogado(idRecebidoDoJava);
    setTelaAtiva("home");
  };

return (
  <div className="app">

    {telaAtiva === "auth" && (
      <Auth onLoginSucesso={handleLoginSucesso} />
    )}

    {telaAtiva === "home" && (
      <Home
        userId={userIdLogado}
        onLogout={handleLogout}
        abrirAjuda={() => setTelaAtiva("ajuda")}
      />
    )}

    {telaAtiva === "ajuda" && (
      <Help
        voltar={() => setTelaAtiva("home")}
      />
    )}

  </div>
);
}