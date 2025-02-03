import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTwitter, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [mempoolFee, setMempoolFee] = useState<number | null>(null);

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

  return (
    <footer className="fixed bottom-0 w-full h-[45px] bg-black/50 backdrop-blur-sm border-t border-gray-800 flex items-center justify-between px-3 z-50">
      <div className="flex items-center text-gray-400 space-x-3">
        <div className="flex items-center">
          <Image src="/btclogo.png" alt="Bitcoin Logo" width={14} height={14} />
          <span className="ml-1.5 text-sm">
            {btcPrice ? `$${btcPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}` : 'Loading...'}
          </span>
        </div>
        <div className="h-3 w-px bg-gray-800"></div>
        <div className="flex items-center">
          <Image 
            src="/speed.svg" 
            alt="Fee Rate" 
            width={17} 
            height={17} 
            className="mr-1.5"
          />
          <span className="text-sm">{mempoolFee ? `${mempoolFee} sats/vB` : 'Loading...'}</span>
        </div>
      </div>
      <div className="flex items-center border-l border-gray-800 pl-3">
        <a href="https://twitter.com/chimeraBTC" className="text-gray-400 mx-1.5 hover:text-white" target="_blank" rel="noopener noreferrer">
          <FaTwitter size={17} />
        </a>
        <a href="https://discord.gg/chimerabtc" className="text-gray-400 mx-1.5 hover:text-white" target="_blank" rel="noopener noreferrer">
          <FaDiscord size={17} />
        </a>
      </div>
    </footer>
  );
} 