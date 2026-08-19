import React, { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


// Contract ABI - only the read function
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isVerified",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [contractAddress, setContractAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkVerified() {
    if (!ethers.isAddress(contractAddress) || !ethers.isAddress(userAddress)) {
      setResult("❌ ERROR: Invalid Ethereum address format.");
      return;
    }

    setLoading(true);
    setResult(null); // Clear previous result

    try {
      // Connect to blockchain via public RPC - NO WALLET NEEDED
      const provider = new ethers.JsonRpcProvider(
        "https://sepolia.infura.io/v3/350d3bfe0557495195b54e17239fe4d5"
      );

      // Create contract instance for read-only access
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

      // Call isVerified function - NO GAS FEES
      const isVerified = await contract.isVerified(userAddress);

      setResult(isVerified ? "✅ VERIFIED" : "❌ NOT VERIFIED");

    } catch (error) {
      // Provide a more user-friendly error message
      console.error(error);
      setResult("❌ ERROR: Could not fetch status. Check the contract address or network.");
    } finally {
      setLoading(false);
    }
  }

  // A simple SVG spinner component
  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans">

       <div className="absolute left-8 top-[10vh] z-50">
          <Link
            to="/dashboard"
            className="group inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full font-medium transition-all duration-300 border border-slate-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Link>
        </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all hover:scale-[1.01]">


        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">🔍 Wallet-Free Verification Checker</h2>
          <p className="text-gray-500 mt-2">
            Read smart contract data directly. No wallet, no gas fees.
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Contract Address
            </label>
            <input
              id="contractAddress"
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={e => setContractAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>
          
          <div>
            <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-2">
              User Address to Check
            </label>
            <input
              id="userAddress"
              type="text"
              placeholder="0x..."
              value={userAddress}
              onChange={e => setUserAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
        
        <button
          onClick={checkVerified}
          disabled={loading || !contractAddress || !userAddress}
          className="w-full mt-8 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {loading ? <Spinner /> : null}
          {loading ? 'Checking Status...' : 'Check Verification'}
        </button>
        
        {result && (
          <div className={`
            mt-6 p-4 rounded-md text-center font-semibold text-lg
            ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            transition-opacity duration-500 animate-fade-in
          `}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;