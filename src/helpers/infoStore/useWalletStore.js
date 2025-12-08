import { create } from "zustand";
import { ethers } from "ethers";
import abi from "../../contract/demoDegree.json";

const CONTRACT_ADDRESS = "0x3CA339C60a346167F4c053f43208a25a3FC5A7D9";
// Ganache CLI shows Chain Id: 1337 → hex = 0x539
const CHAIN_ID = "0x539";

const useWalletStore = create((set, get) => ({
    provider: null,
    signer: null,
    contract: null,
    connecting: false,
    error: null,

    // ----------------------------------
    // READ-ONLY connection (students)
    // ----------------------------------
    connectReadOnly: async () => {
        // if already connected with a provider, don't reconnect
        const { provider, contract } = get();
        if (provider && contract && !get().signer) {
            console.log("Already connected in read-only mode.");
            return;
        }

        set({ connecting: true, error: null });

        try {
            // Ganache default RPC
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, provider);

            set({
                provider,
                signer: null, // 🚀 no signer for students
                contract,
            });

            console.log("✅ Connected read-only (student)");
        } catch (e) {
            console.error("❌ Read-only connection failed", e);
            set({ error: "Unable to connect in read-only mode." });
        } finally {
            set({ connecting: false });
        }
    },

    // ----------------------------------
    // WRITE-enabled wallet connect (admin)
    // ----------------------------------
    connectWallet: async (opts = {}) => {
        const { auto = false, role } = opts || {};
        console.log("opts::::::::::::::", role)
        const normalizedRole = (role || "").toString().toLowerCase();
        const isStudent = normalizedRole === "student";

        console.log("connectWallet called with role:", role, "→ normalized:", normalizedRole);

        // If student → force read-only mode
        if (isStudent) {
            return get().connectReadOnly();
        }

        // If admin → full MetaMask signer connection required
        if (typeof window === "undefined" || !window.ethereum) {
            set({
                error:
                    "No Ethereum provider found. Please use Chrome/Brave with MetaMask for admin actions.",
            });
            return;
        }

        if (get().connecting) return;

        set({ connecting: true, error: null });

        try {
            let accounts = [];

            if (auto) {
                accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });

                if (!accounts.length) {
                    set({ connecting: false });
                    return;
                }
            } else {
                accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });

                localStorage.setItem("walletConnected", "true");
            }

            // Chain switch (Ganache)
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: CHAIN_ID }],
                });
            } catch (e) {
                console.warn("Chain switch failed (Ganache):", e);
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

            set({ provider, signer, contract });
            console.log("✅ Admin connected with signer");
        } catch (e) {
            console.error("❌ Wallet connect error:", e);
            set({ error: "Failed to connect wallet." });
        } finally {
            set({ connecting: false });
        }
    },
}));

export default useWalletStore;
