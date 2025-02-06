import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Update the gradient animation constant
const gradientAnimation = {
  backgroundSize: "200% 200%",
  animation: "gradient 2s linear infinite",
};

interface IHeader {
  unisatConnectWallet: () => void;
  paymentAddress: string;
  setPaymentAddress: (e: string) => void;
  paymentPubkey: string;
  setPaymentPubkey: (e: string) => void;
  ordinalAddress: string;
  setOrdinalAddress: (e: string) => void;
  ordinalPubkey: string;
  setOrdinalPubkey: (e: string) => void;
}

export default function Header(props: IHeader) {
  useEffect(() => {
    const userAddress = localStorage.getItem("paymentAddress");
    props.setPaymentAddress(userAddress ? userAddress : "");
    const ordinalAddress = localStorage.getItem("ordinalAddress");
    props.setOrdinalAddress(ordinalAddress ? ordinalAddress : "");
    const ordinalPubkey = localStorage.getItem("ordinalPubkey");
    props.setOrdinalPubkey(ordinalPubkey ? ordinalPubkey : "");
    const paymentPubkey = localStorage.getItem("paymentPubkey");
    props.setPaymentPubkey(paymentPubkey ? paymentPubkey : "");
  }, []);

  return (
    <>
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
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              onClick={props.unisatConnectWallet}
            >
              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FFA200] via-[#FF3000] to-[#FFA200]"
                style={gradientAnimation}
              />
              <div className="absolute inset-[1px] rounded-lg bg-black/95 backdrop-blur-sm" />
              <span className="relative z-10">
                {props.paymentAddress === ""
                  ? "Connect Wallet"
                  : props.paymentAddress.slice(0, 4) +
                    "..." +
                    props.paymentAddress.slice(-5)}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
}
