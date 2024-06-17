import express, { Express, Request, Response } from "express";
import { Address, getAddress } from "viem";
import { publishCast } from "./neynar";
import { arbitrumClient } from "./viem";
import { betAbi } from "./contracts/betAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
  FRAME_BASE_URL,
} from "./config";
import { addAddress, removeAddress } from "./webhook";
import { shortenHexAddress } from "./utils";

const bot: Express = express();

bot.use(express.json());

bot.get("/", (req: Request, res: Response) => {
  res.send("WannaBet Bot Express Server");
});

const castMap = new Map();

bot.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logData = eventData.event.data.block.logs;

  logData.forEach(async (log) => {
    const eventSignature = log.topics[0];
    if (eventSignature === BET_CREATED_EVENT_SIGNATURE) {
      // HANDLE BET CREATION
      try {
        // -> parse new contract address
        const newContractAddress = getAddress(log.topics[1]);
        // -> add new contract address to webhook
        addAddress(newContractAddress);
        // -> get bet info
        const { betId, creator, participant, amount } = await getBetDetails(
          newContractAddress
        );
        // -> cast about the bet creation
        const formattedCreator = shortenHexAddress(creator);
        const formattedParticipant = shortenHexAddress(participant);
        const castMessage = `${formattedCreator} offered a new ${amount} USDC bet to ${formattedParticipant}`;
        const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
        const parentHash = await publishCast(castMessage, { frameUrl });
        // -> add to cast directory
        castMap.set(betId, parentHash);
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else if (eventSignature === BET_ACCEPTED_EVENT_SIGNATURE) {
      // HANDLE BET ACCEPTED
      try {
        // -> parse contract address
        const betAddress = log.account.address;
        // -> get bet info
        const { betId, participant } = await getBetDetails(betAddress);
        // -> cast about the bet acceptance
        const formattedParticipant = shortenHexAddress(participant);
        const castMessage = `${formattedParticipant} accepted the bet! Awaiting the results...`;
        const castHash = castMap.get(Number(betId));
        publishCast(castMessage, { replyToCastHash: castHash });
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else if (eventSignature === BET_DECLINED_EVENT_SIGNATURE) {
      // HANDLE BET DECLINED
      try {
        // -> parse contract address
        const betAddress = log.account.address;
        // -> remove contract address from webhook
        removeAddress(betAddress);
        // -> get bet info
        const { betId, participant } = await getBetDetails(betAddress);
        // -> cast about bet decline
        const formattedParticipant = shortenHexAddress(participant);
        const castMessage = `${formattedParticipant} declined the bet! Funds have been returned.`;
        const castHash = castMap.get(Number(betId));
        publishCast(castMessage, { replyToCastHash: castHash });
        // -> remove from cast directory
        castMap.delete(betId);
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else if (eventSignature === BET_SETTLED_EVENT_SIGNATURE) {
      // HANDLE BET SETTLED
      try {
        // -> parse contract address
        const betAddress = log.account.address;
        // -> remove contract address from webhook
        removeAddress(betAddress);
        // -> get bet info
        const { betId, arbitrator } = await getBetDetails(betAddress);
        const winner = await getBetWinner(betAddress);
        const isTie = winner === "0x0000000000000000000000000000000000000000";
        // -> cast about bet settled
        const formattedArbitrator = shortenHexAddress(arbitrator);
        const formattedWinner = shortenHexAddress(winner);
        const castMessage = `${formattedArbitrator} settled the bet. ${
          isTie ? "Both parties tied!" : `${formattedWinner} won!`
        }`;
        const castHash = castMap.get(Number(betId));
        publishCast(castMessage, { replyToCastHash: castHash });
        // -> remove from cast directory
        castMap.delete(betId);
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else {
      // handle error... unexpected scenario
    }
  });

  res.status(200).send("Received");
});

export default bot;

type EventData = {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    data: {
      block: {
        number: number;
        timestamp: number;
        logs: Log[];
      };
    };
    sequenceNumber: string;
  };
};
type Log = {
  data: string;
  topics: string[];
  index: number;
  account: {
    address: Address;
  };
  transaction: {
    hash: string;
    nonce: number;
    index: number;
    from: {
      address: Address;
    };
    to: {
      address: Address;
    };
    value: string;
  };
};

async function getBetDetails(betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "betDetails",
    args: [],
  });
  return {
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  };
}
async function getBetWinner(betContractAddress: Address) {
  const winner = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "winner",
  });
  return winner;
}