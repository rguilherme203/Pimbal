function App() {
  const [showShop, setShowShop] = React.useState(false);
  const [coins, setCoins] = React.useState(0);
  const [weapon, setWeapon] = React.useState("Pistola");
  const [item, setItem] = React.useState("Nenhum");
  const [specialReady, setSpecialReady] = React.useState(true);
  const [lives, setLives] = React.useState(3);
  const [level, setLevel] = React.useState(1);
  const [msg, setMsg] = React.useState("");
  const [enemyType, setEnemyType] = React.useState("Zumbi");
  const [dogActive, setDogActive] = React.useState(false);

  // Simulação de física e ações
  function buy(type) {
    if (type === "arma" && coins >= 10) {
      setWeapon("Metralhadora");
      setCoins(coins - 10);
      setMsg("Você comprou uma Metralhadora!");
    }
    if (type === "jetpack" && coins >= 8) {
      setItem("Jetpack");
      setCoins(coins - 8);
      setMsg("Você comprou um Jetpack!");
    }
    if (type === "vida" && coins >= 5) {
      setLives(lives + 1);
      setCoins(coins - 5);
      setMsg("Você ganhou +1 vida!");
    }
  }

  function nextLevel() {
    setLevel(level + 1);
    setEnemyType(level % 2 === 0 ? "Drone" : "Zumbi");
    setMsg("Novo chefe: " + (level % 2 === 0 ? "Drone" : "Zumbi"));
    setShowShop(false);
  }

  function pegarMoeda() {
    setCoins(coins + 1);
    setMsg("Você pegou uma moeda!");
  }

  function usarEspecial() {
    if (specialReady) {
      setDogActive(true);
      setSpecialReady(false);
      setMsg("Cachorro de ataque lançado!");
      setTimeout(() => {
        setDogActive(false);
        setTimeout(() => setSpecialReady(true), 5000);
      }, 2000);
    } else {
      setMsg("Especial recarregando...");
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-row gap-4 items-center justify-center mb-2">
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg w-96">
          <div className="flex flex-row justify-between mb-2">
            <span>Vidas: <b>{lives}</b></span>
            <span>Moedas: <b>{coins}</b></span>
            <span>Nível: <b>{level}</b></span>
          </div>
          <div className="flex flex-row justify-between mb-2">
            <span>Arma: <b>{weapon}</b></span>
            <span>Apetrecho: <b>{item}</b></span>
            <span>Especial: <b>{specialReady ? "Pronto" : "Recarregando"}</b></span>
          </div>
          <div className="flex flex-row justify-between mb-2">
            <span>Inimigo: <b>{enemyType}</b></span>
            <button className="bg-yellow-400 px-2 py-1 rounded" onClick={pegarMoeda}>Pegar Moeda</button>
            <button className="bg-green-400 px-2 py-1 rounded" onClick={() => setShowShop(true)}>Loja</button>
          </div>
          <div className="flex flex-row justify-between mb-2">
            <button className="bg-blue-400 px-2 py-1 rounded" onClick={usarEspecial}>Usar Especial (Cachorro)</button>
            <button className="bg-purple-400 px-2 py-1 rounded" onClick={nextLevel}>Próximo Nível</button>
          </div>
          {msg && <div className="mt-2 text-yellow-200">{msg}</div>}
        </div>
      </div>
      <div className="flex flex-row justify-center items-end h-64 relative">
        {/* Plataforma */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg"></div>
        {/* Player */}
        <div className="absolute left-1/4 bottom-8 flex flex-col items-center">
          <div className="w-10 h-16 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-lg border-2 border-yellow-700 flex items-end justify-center relative">
            {/* Jetpack */}
            {item === "Jetpack" && (
              <div className="absolute left-0 bottom-0 w-2 h-6 bg-pink-500 rounded"></div>
            )}
            {/* Arma */}
            <div className="absolute right-0 top-8 w-4 h-2 bg-gray-800 rounded"></div>
          </div>
          <span className="text-xs text-white">Você</span>
        </div>
        {/* Inimigo */}
        <div className="absolute left-2/3 bottom-8 flex flex-col items-center">
          <div className={`w-10 h-16 ${enemyType === "Drone" ? "bg-gradient-to-b from-blue-300 to-blue-700" : "bg-gradient-to-b from-red-300 to-red-700"} rounded-lg border-2 border-gray-700 flex items-end justify-center`}>
            {enemyType === "Drone" && (
              <div className="absolute left-1 top-2 w-8 h-2 bg-gray-300 rounded-full"></div>
            )}
          </div>
          <span className="text-xs text-white">{enemyType}</span>
        </div>
        {/* Cachorro especial */}
        {dogActive && (
          <div className="absolute left-1/2 bottom-8 flex flex-col items-center animate-bounce">
            <div className="w-12 h-8 bg-gradient-to-r from-yellow-700 to-yellow-300 rounded-full border-2 border-yellow-900 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full mr-1"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-xs text-white">Cachorro</span>
          </div>
        )}
      </div>
      {/* Loja */}
      {showShop && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 shadow-2xl w-96">
            <h2 className="text-xl text-yellow-300 mb-4">Loja do Jogo</h2>
            <div className="flex flex-col gap-2">
              <button className="bg-blue-500 px-4 py-2 rounded text-white" onClick={() => buy("arma")}>Comprar Metralhadora (10 moedas)</button>
              <button className="bg-pink-500 px-4 py-2 rounded text-white" onClick={() => buy("jetpack")}>Comprar Jetpack (8 moedas)</button>
              <button className="bg-green-500 px-4 py-2 rounded text-white" onClick={() => buy("vida")}>Comprar Vida (5 moedas)</button>
              <button className="bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setShowShop(false)}>Fechar Loja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Renderização
ReactDOM.render(<App />, document.getElementById('root'));
