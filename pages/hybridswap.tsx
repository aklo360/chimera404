import { Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import WavyBackground from '@/components/WavyBackground';
import Footer from '@/components/Footer';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

const inter = Inter({ subsets: ['latin'] });

// Update the gradient animation constant
const gradientAnimation = {
  backgroundSize: '200% 200%',
  animation: 'gradient 4s linear infinite'
};

const carouselImages = [
  '/carousel/1.png',
  '/carousel/2.png',
  '/carousel/3.png',
  '/carousel/4.png',
  '/carousel/5.png',
  '/carousel/6.png',
  '/carousel/7.png',
  '/carousel/8.png',
  '/carousel/9.png',
  '/carousel/10.png',
  '/carousel/11.png',
  '/carousel/12.png',
  '/carousel/13.png'
];

export default function HybridSwap() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [mempoolFee, setMempoolFee] = useState<number | null>(null);
  const [isSwapFlipped, setIsSwapFlipped] = useState(false);
  const [sendAmount, setSendAmount] = useState<string>('1');
  const [getAmount, setGetAmount] = useState<string>('100,000');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inscriptionBalance, setInscriptionBalance] = useState<number>(1);
  const [chimeraBalance, setChimeraBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };

    const fetchMempoolFees = async () => {
      try {
        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const data = await response.json();
        setMempoolFee(data.halfHourFee);
      } catch (error) {
        console.error('Error fetching mempool fees:', error);
      }
    };

    fetchBtcPrice();
    fetchMempoolFees();

    const priceInterval = setInterval(() => {
      fetchBtcPrice();
      fetchMempoolFees();
    }, 60000);

    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  const handleSwapDirection = () => {
    setIsSwapFlipped(!isSwapFlipped);
    // Swap the amounts
    const tempSend = sendAmount;
    setSendAmount(getAmount);
    setGetAmount(tempSend);
    // Set image selection based on swap direction
    setSelectedImage(!isSwapFlipped ? -1 : 0);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    // Simulate swap delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Update balances
    setInscriptionBalance(prev => isSwapFlipped ? prev + 1 : prev - 1);
    setChimeraBalance(prev => isSwapFlipped ? prev - 100000 : prev + 100000);
    setIsSwapping(false);
    setShowSuccess(true);
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="overflow-hidden">
      <main className={`flex min-h-screen flex-col items-center ${inter.className} overflow-x-hidden`}>
        <Head>
          <title>CHIMERA BTC - Hybrid Swap</title>
          <link rel="icon" href="/chimera-icon.svg" />
        </Head>

        {/* Content Container with Vignette */}
        <div className="relative w-full min-h-screen">
          {/* Fixed Wavy Background that stays throughout the page */}
          <div className="fixed inset-0 w-full h-full">
            <WavyBackground className="w-full h-full" />
            <div className="absolute inset-0 bg-black opacity-50" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header Bar */}
            <motion.header 
              className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm h-16"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-7xl mx-auto h-full px-4 flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Image
                    src="/chimera-wide.svg"
                    alt="Chimera"
                    width={180}
                    height={40}
                    className="h-8 w-auto"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.button
                    className="relative px-6 py-2 text-base font-semibold text-white rounded-lg"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FF6B00] via-[#FF3A00] to-[#FF6B00]"
                      style={gradientAnimation}
                    />
                    <div className="absolute inset-[1px] rounded-lg bg-black/40 backdrop-blur-sm" />
                    <span className="relative z-10">Connect Wallet</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.header>

            {/* Centered Module Container */}
            <div className="w-full min-h-screen flex items-center justify-center px-4">
              <div className="relative w-full flex justify-center">
                <motion.div 
                  className="w-full max-w-[1120px] bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row gap-8 p-8">
                    {/* Left Column - Image Grid */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/[0.07] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.15] [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="grid grid-cols-2 gap-4">
                          {carouselImages.map((image: string, index: number) => (
                            <div 
                              key={index} 
                              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                                selectedImage === index && !isSwapFlipped ? 'ring-2 ring-[#FF6B00] ring-offset-1 ring-offset-black/80' : ''
                              }`}
                              onClick={() => handleImageSelect(index)}
                            >
                              <Image
                                src={image}
                                alt={`Inscription ${index + 1}`}
                                fill
                                className={`object-cover transition-transform duration-300 ${
                                  selectedImage === index ? 'scale-105' : 'hover:scale-105'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Swap Module */}
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                      <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 max-w-[400px] w-full">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-medium text-white">You Send:</h2>
                            <span className="text-white/60 text-sm">Balance: {isSwapFlipped ? chimeraBalance.toLocaleString() : inscriptionBalance}</span>
                          </div>
                          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-white/10">
                            <input
                              type="text"
                              className="bg-transparent text-xl font-semibold text-white w-full outline-none"
                              placeholder={isSwapFlipped ? '100,000' : '1'}
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                            />
                            <span className="text-white/80 text-sm ml-2">{isSwapFlipped ? 'CHIMERA•GENESIS▣' : 'INSCRIPTION◉'}</span>
                          </div>
                        </div>

                        {/* Swap Direction Button */}
                        <div className="relative h-12 flex items-center justify-center">
                          <motion.button
                            onClick={handleSwapDirection}
                            className="absolute text-white/80 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="tabler-icon tabler-icon-switch-vertical w-5 h-5 mx-auto z-50"
                            >
                              <path d="M3 8l4 -4l4 4"></path>
                              <path d="M7 4l0 9"></path>
                              <path d="M13 16l4 4l4 -4"></path>
                              <path d="M17 10l0 10"></path>
                            </svg>
                          </motion.button>
                        </div>

                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-medium text-white">You Get:</h2>
                            <span className="text-white/60 text-sm">Balance: {isSwapFlipped ? inscriptionBalance : chimeraBalance.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-white/10">
                            <input
                              type="text"
                              className="bg-transparent text-xl font-semibold text-white w-full outline-none"
                              placeholder={isSwapFlipped ? '1' : '100,000'}
                              value={getAmount}
                              onChange={(e) => setGetAmount(e.target.value)}
                            />
                            <span className="text-white/80 text-sm ml-2">{isSwapFlipped ? 'INSCRIPTION◉' : 'CHIMERA•GENESIS▣'}</span>
                          </div>
                        </div>

                        <motion.button
                          onClick={handleSwap}
                          className="relative w-full px-6 py-2.5 text-base font-semibold text-white rounded-lg"
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSwapping}
                        >
                          <div 
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                            style={gradientAnimation}
                          />
                          <div className="absolute inset-[1px] rounded-lg bg-black/95 backdrop-blur-sm" />
                          <span className="relative z-10 flex items-center justify-center">
                            {isSwapping ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Swapping...
                              </>
                            ) : (
                              'Swap'
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Back Button - Positioned relative to the modal */}
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 -bottom-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/">
                    <motion.span
                      className="text-white/80 hover:text-white text-lg font-medium cursor-pointer inline-block"
                      initial={{ y: 0 }}
                      animate={{ 
                        y: [-4, 4, -4],
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    >
                      ← Back
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Replace old footer with Footer component */}
        <Footer />
      </main>

      {/* Success Notification */}
      <div className="fixed top-20 inset-0 pointer-events-none flex items-start justify-center" style={{ zIndex: 99999 }}>
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="pointer-events-auto bg-black/90 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl min-w-[300px]"
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">Swap Successful!</p>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <ConfettiExplosion 
                  force={0.4}
                  duration={2200}
                  particleCount={30}
                  width={400}
                />
              </div>
              <div className="mt-2">
                <p className="text-white/60 text-sm">
                  {isSwapFlipped ? 'You received 1 INSCRIPTION◉' : 'You received 100,000 CHIMERA•GENESIS▣'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
} 