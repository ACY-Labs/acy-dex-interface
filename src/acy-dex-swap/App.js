import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import SwapComponent from "./components/SwapComponent";
import LiquidityComponent from "./components/LiquidityComponent";
import RemoveLiquidityComponent from "./components/RemoveLiquidityComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// import your favorite web3 convenience library here

function getLibrary(provider, connector) {
  return new Web3Provider(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div
        className="py-5"
        style={{ "padding-left": "15%", "padding-right": "15%" }}
      >
        <SwapComponent />
        <hr />
        <LiquidityComponent />
        <hr />
        <RemoveLiquidityComponent />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
