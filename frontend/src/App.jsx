import React, { useState } from "react";
import Auth from "./components/Auth.jsx";
import Home from "./pages/Home.jsx"; // 🌟 Adicione o .jsx aqui

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

  // Essa função gerencia a subida do UUID real obtido no login
 const handleLoginSucesso = (idRecebidoDoJava) => {
  localStorage.setItem('userId', idRecebidoDoJava);

  setUserIdLogado(idRecebidoDoJava);
  setTelaAtiva("home");
};

  return (
    <div className="app">
      {telaAtiva === "auth" ? (
        <Auth onLoginSucesso={handleLoginSucesso} />
      ) : (
        <Home 
  userId={userIdLogado}
  onLogout={handleLogout}
/>
      )}
    </div>
  );
}