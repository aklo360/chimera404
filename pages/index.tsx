import { Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import WavyBackground from '@/components/WavyBackground';
import Footer from '@/components/Footer';
import { FaTwitter } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

const inter = Inter({ subsets: ['latin'] });

// Array of image paths - you'll need to add these images to your public folder
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
  // Add more images as needed
];

// Update the gradient animation constant
const gradientAnimation = {
  backgroundSize: '200% 200%',
  animation: 'gradient 2s linear infinite'
};

export default function Home() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [mempoolFee, setMempoolFee] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mintedCount] = useState(0); // Replace with actual minted count logic
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const totalSupply = 2000;
  const mintProgress = (mintedCount / totalSupply) * 100;
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedImageIndex, setMintedImageIndex] = useState(0);

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

    // Image carousel interval
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(imageInterval);
    };
  }, []);

  const handleMint = async () => {
    setIsMinting(true);
    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsMinting(false);
    // Set random image from carousel for success modal
    setMintedImageIndex(Math.floor(Math.random() * carouselImages.length));
    setShowSuccessModal(true);
  };

  return (
    <div className="overflow-hidden">
      <main className={`flex min-h-screen flex-col items-center ${inter.className} overflow-x-hidden`}>
        <Head>
          <title>CHIMERA BTC</title>
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
                  <Link href="/comingsoon">
                    <motion.button
                      className="relative px-6 py-2 text-base font-semibold text-white rounded-lg"
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                        style={gradientAnimation}
                      />
                      <div className="absolute inset-[1px] rounded-lg bg-black/95 backdrop-blur-sm" />
                      <span className="relative z-10">Connect Wallet</span>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.header>

            {/* Centered Module Container */}
            <div className="w-full min-h-screen flex items-center justify-center px-4">
              <div className="relative">
                <motion.div 
                  className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Carousel */}
                    <div className="w-full md:w-1/2 relative aspect-square cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                      <AnimatePresence mode='wait'>
                        <motion.div
                          key={currentImageIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={carouselImages[currentImageIndex]}
                            alt="Inscription Preview"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Minting Info */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">CHIMERA GENESIS</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-8">
                          CHIMERA GENESIS is a Hybrid Inscription collection of 2,000 Digital Artifacts on Bitcoin (testnet4). Each inscription can dynamically change states and unlock 100,000 CHIMERA•GENESIS Rune tokens via our trustless fractionalization protocol, you can swap for these tokens at any time (and vice versa).
                        </p>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                              <span>Progress</span>
                              <span>{mintedCount}/{totalSupply}</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${mintProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={handleMint}
                        className="relative w-full mt-8 px-6 py-3 text-lg font-semibold text-white rounded-lg"
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isMinting}
                      >
                        <div 
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                          style={gradientAnimation}
                        />
                        <div className="absolute inset-[1px] rounded-lg bg-black/95 backdrop-blur-sm" />
                        <span className="relative z-10 flex items-center justify-center">
                          {isMinting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Minting...
                            </>
                          ) : (
                            'Mint Inscription'
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Next Button - Positioned relative to the modal */}
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/hybridswap">
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
                      Next →
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
              {showSuccessModal && (
                <>
                  <div className="fixed inset-0 flex items-center justify-center z-[100]">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 backdrop-blur-md"
                      onClick={() => setShowSuccessModal(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative bg-black/90 rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/10 shadow-2xl z-[102]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-6">Congratulations!</h3>
                        <div className="relative w-48 h-48 mx-auto mb-6">
                          <Image
                            src={carouselImages[mintedImageIndex]}
                            alt="Minted Inscription"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-gray-300 mb-4">You successfully minted:</p>
                        <p className="font-mono text-white bg-black/50 rounded-lg p-3 mb-8 break-all">
                          Inscription ID: {`${Array(64).fill('x').join('')}`}
                        </p>
                        <motion.button
                          onClick={() => setShowSuccessModal(false)}
                          className="text-white/80 hover:text-white transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Close
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                  {/* Confetti above everything */}
                  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[999999]">
                    <ConfettiExplosion 
                      force={0.8}
                      duration={3000}
                      particleCount={100}
                      width={1600}
                    />
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Image Modal */}
            <AnimatePresence>
              {isImageModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100]">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={() => setIsImageModalOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-[90vw] h-[90vh] max-w-6xl max-h-[90vh] z-[101]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={carouselImages[currentImageIndex]}
                        alt="Enlarged Inscription Preview"
                        fill
                        className="object-contain"
                        priority
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageModalOpen(false);
                        }}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors duration-200 z-[102]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Footer component */}
        <Footer />
      </main>

      {/* Add this to your existing styles or create a new style tag in your document head */}
      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}