import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import {
  request,
  AddressPurpose,
  RpcErrorCode,
  signMultipleTransactions,
  BitcoinNetworkType,
  SignPsbtParams,
} from "sats-connect";
import Link from "next/link";
import WavyBackground from "@/components/WavyBackground";
import Footer from "@/components/Footer";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import Banner from "@/components/Banner";

const inter = Inter({ subsets: ["latin"] });

// Update the gradient animation constant
const gradientAnimation = {
  backgroundSize: "200% 200%",
  animation: "gradient 4s linear infinite",
};

export default function LiquidityPool() {
  // const backendUrl = "https://api.chimera.finance/api";
  const backendUrl = "http://localhost:8001/api";

  // LP specific states
  const [chimeraAmount, setChimeraAmount] = useState<string>("0");
  const [tbtcAmount, setTbtcAmount] = useState<string>("0");
  const [apr, setApr] = useState<string>("12.5");
  const [totalLiquidity, setTotalLiquidity] = useState<string>("$1,245,678");
  const [volume24h, setVolume24h] = useState<string>("$345,678");
  const [fees24h, setFees24h] = useState<string>("$1,234");
  const [userLiquidity, setUserLiquidity] = useState<string>("$0");
  const [userShare, setUserShare] = useState<string>("0");
  const [userEarnings, setUserEarnings] = useState<string>("$0");
  const [userNetYield, setUserNetYield] = useState<string>("0");
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isWithdrawingLiquidity, setIsWithdrawingLiquidity] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("0");
  const [activeTab, setActiveTab] = useState<"add" | "withdraw">("add");
  
  // Wallet states
  const [loading, setLoading] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState("");
  const [paymentPubkey, setPaymentPubkey] = useState("");
  const [ordinalAddress, setOrdinalAddress] = useState("");
  const [ordinalPubkey, setOrdinalPubkey] = useState("");
  const [walletType, setWalletType] = useState("");
  const [chimeraBalance, setChimeraBalance] = useState<number>(0);
  const [tbtcBalance, setTbtcBalance] = useState<number>(0);

  // Fetch user balances and pool data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for now - would be replaced with actual API calls
      setTimeout(() => {
        setChimeraBalance(250000);
        setTbtcBalance(0.025);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if wallet is connected from localStorage
    const storedPaymentAddress = localStorage.getItem("paymentAddress");
    const storedPaymentPubkey = localStorage.getItem("paymentPubkey");
    const storedOrdinalAddress = localStorage.getItem("ordinalAddress");
    const storedOrdinalPubkey = localStorage.getItem("ordinalPubkey");
    const storedWalletType = localStorage.getItem("walletType");

    if (
      storedPaymentAddress &&
      storedPaymentPubkey &&
      storedOrdinalAddress &&
      storedOrdinalPubkey &&
      storedWalletType
    ) {
      setPaymentAddress(storedPaymentAddress);
      setPaymentPubkey(storedPaymentPubkey);
      setOrdinalAddress(storedOrdinalAddress);
      setOrdinalPubkey(storedOrdinalPubkey);
      setWalletType(storedWalletType);
      fetchData();
    }
  }, []);

  const selectWalletConnect = async (walletType: number) => {
    try {
      const getAddressOptions = {
        payload: {
          purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
          message: "CHIMERA PROTOCOL needs your addresses",
          network: {
            type: BitcoinNetworkType.Testnet,
          },
        },
        onFinish: (response: any) => {
          const paymentAddress = response.addresses[0].address;
          const paymentPubkey = response.addresses[0].publicKey;
          const ordinalAddress = response.addresses[1].address;
          const ordinalPubkey = response.addresses[1].publicKey;

          setPaymentAddress(paymentAddress);
          setPaymentPubkey(paymentPubkey);
          setOrdinalAddress(ordinalAddress);
          setOrdinalPubkey(ordinalPubkey);

          if (walletType === 1) {
            setWalletType("Unisat");
            localStorage.setItem("walletType", "Unisat");
          } else if (walletType === 2) {
            setWalletType("Xverse");
            localStorage.setItem("walletType", "Xverse");
          } else if (walletType === 3) {
            setWalletType("Leather");
            localStorage.setItem("walletType", "Leather");
          }

          localStorage.setItem("paymentAddress", paymentAddress);
          localStorage.setItem("paymentPubkey", paymentPubkey);
          localStorage.setItem("ordinalAddress", ordinalAddress);
          localStorage.setItem("ordinalPubkey", ordinalPubkey);

          fetchData();
        },
        onCancel: () => {
          alert("Request canceled");
        },
      };

      if (walletType === 1) {
        await (window as any).unisat.requestAccounts();
        const accounts = await (window as any).unisat.getAccounts();
        setPaymentAddress(accounts[0]);
        setOrdinalAddress(accounts[0]);
        setWalletType("Unisat");
        localStorage.setItem("walletType", "Unisat");
        localStorage.setItem("paymentAddress", accounts[0]);
        localStorage.setItem("ordinalAddress", accounts[0]);
        fetchData();
      } else if (walletType === 2) {
        await request("getAddress" as any, getAddressOptions);
      } else if (walletType === 3) {
        await request("getAddress" as any, getAddressOptions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined") {
        if (
          typeof (window as any).unisat !== "undefined" ||
          typeof (window as any).LeatherProvider !== "undefined" ||
          typeof (window as any).BitcoinProvider !== "undefined"
        ) {
          // Wallet selection logic
        } else {
          alert("Please install Unisat, Xverse, or Leather wallet");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetMaxChimera = () => {
    setChimeraAmount(chimeraBalance.toString());
  };

  const handleSetHalfChimera = () => {
    setChimeraAmount((chimeraBalance / 2).toString());
  };

  const handleSetMaxTbtc = () => {
    setTbtcAmount(tbtcBalance.toString());
  };

  const handleSetHalfTbtc = () => {
    setTbtcAmount((tbtcBalance / 2).toString());
  };

  const handleAddLiquidity = async () => {
    try {
      setIsAddingLiquidity(true);
      
      // Mock successful liquidity addition
      setTimeout(() => {
        setIsAddingLiquidity(false);
        setShowSuccess(true);
        
        // Reset form
        setTimeout(() => {
          setShowSuccess(false);
          setChimeraAmount("0");
          setTbtcAmount("0");
          fetchData();
        }, 3000);
      }, 2000);
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setIsAddingLiquidity(false);
    }
  };

  const handleWithdrawLiquidity = async () => {
    try {
      setIsWithdrawingLiquidity(true);
      
      // Mock successful liquidity withdrawal
      setTimeout(() => {
        setIsWithdrawingLiquidity(false);
        setShowSuccess(true);
        
        // Reset form
        setTimeout(() => {
          setShowSuccess(false);
          setWithdrawAmount("0");
          fetchData();
        }, 3000);
      }, 2000);
    } catch (error) {
      console.error("Error withdrawing liquidity:", error);
      setIsWithdrawingLiquidity(false);
    }
  };

  const handleSetMaxWithdraw = () => {
    // Set withdraw amount to 100% of user's liquidity
    setWithdrawAmount("100");
  };

  const handleSetHalfWithdraw = () => {
    // Set withdraw amount to 50% of user's liquidity
    setWithdrawAmount("50");
  };

  return (
    <div className="overflow-hidden">
      <Banner />
      <main
        className={`flex min-h-screen flex-col items-center ${inter.className} overflow-x-hidden`}
      >
        <Head>
          <title>CHIMERA PROTOCOL - Liquidity Pool</title>
          <link rel="icon" href="/chimera-icon.svg" />
        </Head>

        {/* Content Container with Vignette */}
        <div className="relative w-full min-h-screen flex flex-col">
          {/* Fixed Wavy Background that stays throughout the page */}
          <div className="fixed inset-0 w-full h-full">
            <WavyBackground className="w-full h-full" />
            <div className="absolute inset-0 bg-black opacity-50" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col">
            <Header
              connectWallet={connectWallet}
              selectWalletConnect={selectWalletConnect}
              paymentAddress={paymentAddress}
              setPaymentAddress={setPaymentAddress}
              ordinalAddress={ordinalAddress}
              setOrdinalAddress={setOrdinalAddress}
              paymentPubkey={paymentPubkey}
              setPaymentPubkey={setPaymentPubkey}
              ordinalPubkey={ordinalPubkey}
              setOrdinalPubkey={setOrdinalPubkey}
              walletType={walletType}
              setWalletType={setWalletType}
              openWalletModal={false}
              setOpenWalletModal={() => {}}
            />

            {/* LP Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-6">
                
                {/* Left Section - Pool Info */}
                <motion.div
                  className="w-full md:w-1/3 bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.1] p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">CHIMERA•PROTOCOL-tBTC</h2>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">24h APR</p>
                      <p className="text-lg font-bold text-green-500">{apr}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Liquidity</span>
                      <span className="text-white font-medium">{totalLiquidity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Volume</span>
                      <span className="text-white font-medium">{volume24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Fees</span>
                      <span className="text-white font-medium">{fees24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee Tier</span>
                      <span className="text-white font-medium">1%</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold">CP</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-xs font-bold">₿</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">CHIMERA•PROTOCOL-tBTC</p>
                        <p className="text-xs text-gray-400">AMM Liquidity Pool</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Right Section - User Position and Add Liquidity */}
                <div className="w-full md:w-2/3 space-y-6">
                  {/* User Position */}
                  <motion.div
                    className="bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.1] p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Your Position</h2>
                    
                    {paymentAddress ? (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Your Liquidity</span>
                          <span className="text-white font-medium">{userLiquidity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pool Share</span>
                          <span className="text-white font-medium">{userShare}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unclaimed Earnings</span>
                          <span className="text-white font-medium">{userEarnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Net Yield</span>
                          <span className="text-white font-medium">{userNetYield}%</span>
                        </div>
                        
                        {userLiquidity !== "$0" && (
                          <div className="mt-4">
                            <div className="flex gap-3 mb-4">
                              <button 
                                onClick={() => setIsWithdrawingLiquidity(true)}
                                className="flex-1 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                              >
                                Withdraw
                              </button>
                              <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition">
                                Claim Rewards
                              </button>
                            </div>
                            
                            {/* Withdraw UI */}
                            <AnimatePresence>
                              {isWithdrawingLiquidity && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 bg-white/5 rounded-lg mt-2">
                                    <h4 className="text-white font-medium mb-3">Withdraw Liquidity</h4>
                                    <div className="mb-3">
                                      <div className="flex justify-between mb-2">
                                        <label className="text-gray-400">Amount (%)</label>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                          <input
                                            type="text"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        <button 
                                          onClick={handleSetHalfWithdraw}
                                          className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                                        >
                                          50%
                                        </button>
                                        <button 
                                          onClick={handleSetMaxWithdraw}
                                          className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                                        >
                                          Max
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => setIsWithdrawingLiquidity(false)}
                                        className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={handleWithdrawLiquidity}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">Connect your wallet to view your position</p>
                        <button 
                          onClick={connectWallet}
                          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-medium hover:opacity-90 transition"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Add Liquidity / Withdraw Tabs */}
                  <motion.div
                    className="bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.1] p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {/* Tabs */}
                    <div className="flex mb-6 border-b border-white/10">
                      <button
                        onClick={() => setActiveTab("add")}
                        className={`px-4 py-2 text-base font-medium transition-colors relative ${
                          activeTab === "add" 
                            ? "text-white" 
                            : "text-gray-400 hover:text-white/80"
                        }`}
                      >
                        Add Liquidity
                        {activeTab === "add" && (
                          <motion.div 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                            layoutId="activeTabIndicator"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("withdraw")}
                        className={`px-4 py-2 text-base font-medium transition-colors relative ${
                          activeTab === "withdraw" 
                            ? "text-white" 
                            : "text-gray-400 hover:text-white/80"
                        }`}
                      >
                        Withdraw
                        {activeTab === "withdraw" && (
                          <motion.div 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500"
                            layoutId="activeTabIndicator"
                          />
                        )}
                      </button>
                    </div>
                    
                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                      {activeTab === "add" ? (
                        <motion.div
                          key="add-liquidity"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* CHIMERA Input */}
                          <div className="mb-4">
                            <div className="flex justify-between mb-2">
                              <label className="text-gray-400">CHIMERA•PROTOCOL</label>
                              <div className="text-sm text-gray-400">
                                Balance: {chimeraBalance.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={chimeraAmount}
                                  onChange={(e) => setChimeraAmount(e.target.value)}
                                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <button 
                                onClick={handleSetHalfChimera}
                                className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                              >
                                Half
                              </button>
                              <button 
                                onClick={handleSetMaxChimera}
                                className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                              >
                                Max
                              </button>
                            </div>
                          </div>
                          
                          {/* tBTC Input */}
                          <div className="mb-6">
                            <div className="flex justify-between mb-2">
                              <label className="text-gray-400">tBTC</label>
                              <div className="text-sm text-gray-400">
                                Balance: {tbtcBalance}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={tbtcAmount}
                                  onChange={(e) => setTbtcAmount(e.target.value)}
                                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <button 
                                onClick={handleSetHalfTbtc}
                                className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                              >
                                Half
                              </button>
                              <button 
                                onClick={handleSetMaxTbtc}
                                className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                              >
                                Max
                              </button>
                            </div>
                          </div>
                          
                          {/* Summary */}
                          <div className="mb-6 p-4 bg-white/5 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Exchange Rate</span>
                              <span className="text-white">1 tBTC = 10,000 CHIMERA•PROTOCOL</span>
                            </div>
                          </div>
                          
                          {/* Add Liquidity Button */}
                          <motion.button
                            onClick={handleAddLiquidity}
                            className="relative w-full px-6 py-3 text-lg font-semibold text-white rounded-lg"
                            whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isAddingLiquidity || !paymentAddress || chimeraAmount === "0" || tbtcAmount === "0"}
                          >
                            <div
                              className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                              style={gradientAnimation}
                            />
                            <div className={`absolute inset-[1px] rounded-lg ${(!paymentAddress || chimeraAmount === "0" || tbtcAmount === "0") ? 'bg-black/95' : 'bg-black/80'} backdrop-blur-sm`} />
                            <span className="relative z-10 flex items-center justify-center">
                              {isAddingLiquidity ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Adding Liquidity...
                                </>
                              ) : !paymentAddress ? (
                                "Connect Wallet"
                              ) : chimeraAmount === "0" || tbtcAmount === "0" ? (
                                "Enter Amount"
                              ) : (
                                "Add Liquidity"
                              )}
                            </span>
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="withdraw-liquidity"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {userLiquidity === "$0" ? (
                            <div className="text-center py-8">
                              <p className="text-gray-400 mb-2">You don't have any liquidity in this pool yet.</p>
                              <button 
                                onClick={() => setActiveTab("add")}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-medium hover:opacity-90 transition"
                              >
                                Add Liquidity
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Your Position Summary */}
                              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-400">Your Position</span>
                                  <span className="text-white font-medium">{userLiquidity}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-400">CHIMERA•PROTOCOL</span>
                                  <span className="text-white">125,000</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">tBTC</span>
                                  <span className="text-white">0.0125</span>
                                </div>
                              </div>
                              
                              {/* Withdraw Amount */}
                              <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                  <label className="text-gray-400">Withdraw Amount (%)</label>
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      value={withdrawAmount}
                                      onChange={(e) => setWithdrawAmount(e.target.value)}
                                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                      placeholder="0"
                                    />
                                  </div>
                                  <button 
                                    onClick={handleSetHalfWithdraw}
                                    className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                                  >
                                    50%
                                  </button>
                                  <button 
                                    onClick={handleSetMaxWithdraw}
                                    className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                                  >
                                    Max
                                  </button>
                                </div>
                              </div>
                              
                              {/* You Will Receive */}
                              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                                <h4 className="text-white font-medium mb-3">You Will Receive</h4>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-400">CHIMERA•PROTOCOL</span>
                                  <span className="text-white">{withdrawAmount === "0" ? "0" : withdrawAmount === "100" ? "125,000" : "62,500"}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-400">tBTC</span>
                                  <span className="text-white">{withdrawAmount === "0" ? "0" : withdrawAmount === "100" ? "0.0125" : "0.00625"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Earned Fees</span>
                                  <span className="text-white">{userEarnings}</span>
                                </div>
                              </div>
                              
                              {/* Withdraw Button */}
                              <motion.button
                                onClick={handleWithdrawLiquidity}
                                className="relative w-full px-6 py-3 text-lg font-semibold text-white rounded-lg"
                                whileHover={{
                                  scale: 1.02,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isWithdrawingLiquidity || withdrawAmount === "0"}
                              >
                                <div
                                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                                  style={gradientAnimation}
                                />
                                <div className={`absolute inset-[1px] rounded-lg ${withdrawAmount === "0" ? 'bg-black/95' : 'bg-black/80'} backdrop-blur-sm`} />
                                <span className="relative z-10 flex items-center justify-center">
                                  {isWithdrawingLiquidity ? (
                                    <>
                                      <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Withdrawing...
                                    </>
                                  ) : withdrawAmount === "0" ? (
                                    "Enter Amount"
                                  ) : (
                                    "Withdraw Liquidity"
                                  )}
                                </span>
                              </motion.button>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Success Message */}
                    <AnimatePresence>
                      {showSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center text-green-500"
                        >
                          {activeTab === "add" ? "Liquidity added successfully!" : "Liquidity withdrawn successfully!"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
} 