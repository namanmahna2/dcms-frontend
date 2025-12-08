import Server from "../server";
import moment from "moment";

export const logTransaction = async ({
    degree_token_id,
    functionName,
    contract,
    metadataCid
}) => {
    try {
        if (!contract) {
            console.warn("⚠ logTransaction skipped: contract is null");
            return;
        }

        // ✔ ethers v6 signer
        const signer = contract.runner;

        if (!signer) {
            console.warn("⚠ logTransaction skipped: signer missing (runner null)");
            return;
        }

        const wallet = await signer.getAddress();

        const payload = {
            degree_token_id,
            wallet,
            tx_hash: "",
            timestamp: moment().valueOf(),
            gas_price: 0,
            gas_used: 0,
            block_number: 0,
            block_time_diff: 0,
            nonce: 0,
            function: functionName,
            metadata_cid: metadataCid || "",
        };
        // console.log("paylaod:::::::        ", payload)
        await Server.insertLog(payload);
    } catch (err) {
        console.error("ML Log Error →", err);
    }
};
