import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import WavyBackground from "@/components/WavyBackground";
import Footer from "@/components/Footer";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { useState, useEffect } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import Header from "@/components/header";
import Banner from "@/components/Banner";

const inter = Inter({ subsets: ["latin"] });

// Update the gradient animation constant
const gradientAnimation = {
  backgroundSize: "200% 200%",
  animation: "gradient 4s linear infinite",
};

export default function HybridSwap() {
  const backendUrl = "https://api.chimera.finance/api";

  const [isSwapFlipped, setIsSwapFlipped] = useState(false);
  const [sendAmount, setSendAmount] = useState<string>("1");
  const [getAmount, setGetAmount] = useState<string>("100,000");
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [chimeraBalance, setChimeraBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState("");
  const [paymentPubkey, setPaymentPubkey] = useState("");
  const [ordinalAddress, setOrdinalAddress] = useState("");
  const [ordinalPubkey, setOrdinalPubkey] = useState("");
  const [inscriptionList, setInscriptionList] = useState<Array<string>>([]);
  const [broadcastTxId, setBroadcastTxId] = useState("");

  useEffect(() => {
    fetchData();
  }, [paymentAddress]);

  const unisatConnectWallet = async () => {
    try {
      if (paymentAddress === "") {
        const currentWindow: any = window;
        if (typeof currentWindow?.unisat !== "undefined") {
          const unisat: any = currentWindow?.unisat;
          try {
            // const network = await unisat.getNetwork();
            // if (network != "testnet") {
            //   await unisat.switchNetwork("testnet");
            // }
            const chain = await unisat.getChain();
            console.log(chain);
            if (chain.enum != "BITCOIN_TESTNET4")
              await unisat.switchChain("BITCOIN_TESTNET4");

            let accounts: string[] = await unisat.requestAccounts();
            let pubkey = await unisat.getPublicKey();

            const tempOrdinalAddress = accounts[0];
            const tempPaymentAddress = accounts[0];
            const tempOrdinalPublicKey = pubkey;
            const tempPaymentPublicKey = pubkey;
            localStorage.setItem("paymentAddress", tempPaymentAddress);
            localStorage.setItem("paymentPubkey", tempPaymentPublicKey);
            localStorage.setItem("ordinalAddress", tempOrdinalAddress);
            localStorage.setItem("ordinalPubkey", tempOrdinalPublicKey);
            localStorage.setItem("walletType", "Unisat");
            setPaymentAddress(tempPaymentAddress);
            setPaymentPubkey(tempPaymentPublicKey);
            setOrdinalAddress(tempOrdinalAddress);
            setOrdinalPubkey(tempOrdinalPublicKey);
          } catch (e) {
            throw "Connection Failed";
          }
        }
      } else {
        localStorage.setItem("walletType", "");
        localStorage.setItem("paymentAddress", "");
        localStorage.setItem("paymentPubkey", "");
        localStorage.setItem("ordinalAddress", "");
        localStorage.setItem("ordinalPubkey", "");
        setPaymentAddress("");
        setPaymentPubkey("");
        setOrdinalAddress("");
        setOrdinalPubkey("");
      }
    } catch (error) {
      console.log("unisatConnectWallet error ==> ", error);
    }
  };

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

  const fetchData = async () => {
    if (ordinalAddress !== "") {
      setLoading(true);
      const res: any = await fetch(`${backendUrl}/user/get-rune-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: ordinalAddress,
        }),
      });
      const { balance } = await res.json();
      setChimeraBalance(balance);

      const resInscription: any = await fetch(
        `${backendUrl}/user/get-inscription-list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: ordinalAddress,
          }),
        }
      );
      const { inscriptions } = await resInscription.json();
      setInscriptionList(inscriptions);
      setLoading(false);
    } else {
      setChimeraBalance(0);
      setInscriptionList([]);
    }
  };

  const swapInscriptionRune = async (selectedInscriptioin: string) => {
    try {
      if (ordinalAddress === "") throw "Connect Wallet";
      if (inscriptionList.length === 0) throw "You Have Not Got Inscriptions";

      const res = await fetch(
        `${backendUrl}/swap/pre-rune-inscribe-generate-psbt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: ordinalAddress,
            userPubkey: ordinalPubkey,
            inscriptionId: selectedInscriptioin,
          }),
        }
      );

      const { hexPsbt, signIndexes, runeUtxos, remainAmount } =
        await res.json();

      console.log(hexPsbt, signIndexes, runeUtxos, remainAmount);

      const toSignInputs: {
        index: number;
        address: string;
        sighashTypes: number[];
      }[] = [];

      signIndexes.map((value: number) =>
        toSignInputs.push({
          index: value,
          address: ordinalAddress,
          sighashTypes: [129],
        })
      );

      const signedPsbt = await (window as any).unisat.signPsbt(hexPsbt, {
        autoFinalized: false,
        toSignInputs,
      });

      const pushRes = await fetch(
        `${backendUrl}/swap/push-rune-inscribe-psbt-arch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signedPSBT: signedPsbt,
            runeUtxos,
            remainAmount,
          }),
        }
      );

      const { txid } = await pushRes.json();

      return `https://mempool.space/testnet4/tx/${txid}`;
    } catch (error) {
      setIsSwapping(false);
      throw error;
    }
  };

  const swapRuneInscription = async () => {
    try {
      if (ordinalAddress === "") throw "Connect Wallet";
      const res = await fetch(
        `${backendUrl}/swap/pre-inscribe-rune-generate-psbt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: ordinalAddress,
            userPubkey: ordinalPubkey,
          }),
        }
      );

      const { psbt, signIndexes, inscriptionUtxo } = await res.json();
      console.log(psbt, signIndexes, inscriptionUtxo);
      const toSignInputs: {
        index: number;
        address: string;
        sighashTypes: number[];
      }[] = [];

      signIndexes.map((value: number) =>
        toSignInputs.push({
          index: value,
          address: ordinalAddress,
          sighashTypes: [129],
        })
      );

      const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
        autoFinalized: false,
        toSignInputs,
      });

      const pushRes = await fetch(
        `${backendUrl}/swap/push-inscribe-rune-psbt-arch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signedPSBT: signedPsbt,
            inscriptionUtxo,
          }),
        }
      );

      const { txid } = await pushRes.json();

      return `https://mempool.space/testnet4/tx/${txid}`;
    } catch (error) {
      setIsSwapping(false);
      throw error;
    }
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    let txid = "";
    if (isSwapFlipped) {
      txid = await swapRuneInscription();
    } else {
      txid = await swapInscriptionRune(inscriptionList[selectedImage]);
    }
    setIsSwapping(false);
    setBroadcastTxId(txid);
    setShowSuccess(true);
    // Auto hide the success message after 10 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 10000);
    fetchData();
  };

  return (
    <div className="overflow-hidden">
      <Banner />
      <main
        className={`flex min-h-screen flex-col items-center ${inter.className} overflow-x-hidden`}
      >
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
            <Header
              unisatConnectWallet={unisatConnectWallet}
              paymentAddress={paymentAddress}
              setPaymentAddress={setPaymentAddress}
              ordinalAddress={ordinalAddress}
              setOrdinalAddress={setOrdinalAddress}
              paymentPubkey={paymentPubkey}
              setPaymentPubkey={setPaymentPubkey}
              ordinalPubkey={ordinalPubkey}
              setOrdinalPubkey={setOrdinalPubkey}
            />

            {/* Centered Module Container */}
            <div className="w-full min-h-screen flex items-center justify-center px-4">
              <div className="relative w-full flex justify-center">
                <motion.div
                  className="w-full max-w-[1280px] bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.1]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row gap-8 p-8 h-[640px]">
                    {/* Left Column - Image Grid */}
                    <div className="w-full md:w-1/2 h-full flex items-center">
                      <div className="w-full bg-black/80 backdrop-blur-md rounded-xl p-4 h-[576px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/[0.07] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.15] [&::-webkit-scrollbar-track]:bg-transparent border border-white/[0.12]">
                        {inscriptionList.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {inscriptionList.map(
                              (image: string, index: number) => (
                                <div
                                  key={index}
                                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                                    selectedImage === index && !isSwapFlipped
                                      ? "ring-2 ring-[#FF6B00] ring-offset-1 ring-offset-black/80"
                                      : ""
                                  }`}
                                  onClick={() => handleImageSelect(index)}
                                >
                                  <Image
                                    src={`https://static-testnet4.unisat.io/content/${image}`}
                                    alt={`Inscription ${index + 1}`}
                                    fill
                                    className={`object-cover transition-transform duration-300 ${
                                      selectedImage === index
                                        ? "scale-105"
                                        : "hover:scale-105"
                                    }`}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400 text-center">
                              No Inscriptions found from the CHIMERA GENESIS collection.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Swap Module */}
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                      <div className="w-full max-w-[400px] bg-black/95 backdrop-blur-md rounded-xl p-6 border border-white/[0.12]">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-medium text-white">
                              You Send:
                            </h2>
                            <span className="text-white/60 text-sm">
                              Balance:{" "}
                              {isSwapFlipped
                                ? chimeraBalance.toLocaleString()
                                : inscriptionList.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-white/10">
                            <input
                              type="text"
                              className="bg-transparent text-xl font-semibold text-white w-full outline-none"
                              placeholder={isSwapFlipped ? "100,000" : "1"}
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                            />
                            <span className="text-white/80 text-sm ml-2 inline-flex whitespace-nowrap">
                              {isSwapFlipped
                                ? "CHIMERA•GENESIS ▣"
                                : "INSCRIPTION ◉"}
                            </span>
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
                            <h2 className="text-base font-medium text-white">
                              You Get:
                            </h2>
                            <span className="text-white/60 text-sm">
                              Balance:{" "}
                              {isSwapFlipped
                                ? inscriptionList.length
                                : chimeraBalance.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-white/10">
                            <input
                              type="text"
                              className="bg-transparent text-xl font-semibold text-white w-full outline-none"
                              placeholder={isSwapFlipped ? "1" : "100,000"}
                              value={getAmount}
                              onChange={(e) => setGetAmount(e.target.value)}
                            />
                            <span className="text-white/80 text-sm ml-2 inline-flex whitespace-nowrap">
                              {isSwapFlipped
                                ? "INSCRIPTION ◉"
                                : "CHIMERA•GENESIS ▣"}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          onClick={ordinalAddress ? handleSwap : unisatConnectWallet}
                          className="relative w-full px-6 py-2.5 text-base font-semibold text-white rounded-lg"
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 },
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
                            {loading ? (
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
                                Loading...
                              </>
                            ) : isSwapping ? (
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
                                Swapping...
                              </>
                            ) : (
                              ordinalAddress ? "Swap" : "Connect Wallet"
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
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
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
      <div
        className="fixed top-20 inset-0 pointer-events-none flex items-start justify-center"
        style={{ zIndex: 99999 }}
      >
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
                <p className="text-white/60 text-base inline-flex whitespace-nowrap mb-2">
                  {isSwapFlipped
                    ? `You received 1 INSCRIPTION ◉`
                    : `You received 100,000 CHIMERA•GENESIS ▣`}
                </p>
                <a 
                  href={broadcastTxId}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6B00] hover:text-[#FF3000] text-sm block mt-2 transition-colors"
                >
                  View tx in mempool
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
