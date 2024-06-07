import { Button, Env, FrameContext } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumSepoliaClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import {
  TESTNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
  TESTNET_BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import { capitalizeFirstLetter, shortenHexAddress } from "../utils";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";

export const betScreen = async (c: FrameContext<Env, "/bet/:betId">) => {
  const { betId } = c.req.param();
  const BetIdSchema = z.number().positive().int();
  const { success, data: parsedBetId } = BetIdSchema.safeParse(Number(betId));
  if (!success) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bad url</span>
        </div>
      ),
      intents: [<Button action={`/home`} children={"Home"} />],
    });
  }

  const contractAddress = await arbitrumSepoliaClient.readContract({
    address: TESTNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });
  const contractAmount = await arbitrumSepoliaClient.readContract({
    address: TESTNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [contractAddress],
  });
  const [
    _betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "getBetDetails",
    args: [],
  });
  const status = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "getStatus",
  });
  const winner = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "winner",
  });

  const { frameData, url } = c;

  const isCreator = frameData?.address === creator;
  const isParticipant = frameData?.address === participant;
  const isArbitrator = frameData?.address === arbitrator;

  const isTie = winner !== creator && winner !== participant;

  const convertedAmount = Number(amount) / 10 ** 6;

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>
          WannaBet #{betId} - {capitalizeFirstLetter(status)}
        </span>
        <span style={{ ...subTextStyles, marginTop: 20 }}>
          <span style={{ textDecorationLine: "underline", marginRight: 10 }}>
            {shortenHexAddress(creator)}
          </span>
          {" bet "}
          <span
            style={{
              textDecorationLine: "underline",
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            {shortenHexAddress(participant)}
          </span>
        </span>
        <span style={{ ...subTextStyles, marginTop: 10 }}>
          ${convertedAmount} USDC that:
        </span>
        <span
          style={{
            ...subTextStyles,
            marginTop: 30,
            color: "lightBlue",
            paddingLeft: 40,
            borderLeft: "4px",
          }}
        >
          {message}.
        </span>
        {status === "pending" && (
          <span style={{ ...subTextStyles, marginTop: 30 }}>
            ${shortenHexAddress(participant)} can accept or decline
          </span>
        )}
        {status === "expired" && (
          <span style={{ ...subTextStyles, marginTop: 30 }}>
            ${shortenHexAddress(participant)} didn't accept in time. The bet
            creator can retrieve their funds.
          </span>
        )}
        {status === "declined" && (
          <span style={{ ...subTextStyles, marginTop: 30 }}>
            ${shortenHexAddress(participant)} declined the bet
          </span>
        )}
        {status === "accepted" && (
          <span style={{ ...subTextStyles, marginTop: 30 }}>
            ${shortenHexAddress(participant)} accepted! Awaiting the result
          </span>
        )}
        {status === "settled" && (
          <span style={{ ...subTextStyles, marginTop: 30 }}>
            {isTie
              ? "The bet was a tie! The pot was split."
              : `Bet settled! ${shortenHexAddress(winner)} won.`}
          </span>
        )}
      </div>
    ),
    intents: [
      <Button.Link
        href={`https://sepolia.arbiscan.io/address/${contractAddress}`}
        children={"Etherscan"}
      />,
      <Button
        action={`${url}/create/1`}
        value="create"
        children={"Create new"}
      />,
      isParticipant && status === "pending" ? (
        <Button.Transaction
          action={`${url}/accept`}
          target={`/tx/authorize/${contractAddress}`}
          children={"Authorize"}
        />
      ) : null,
      isParticipant && status === "pending" ? (
        <Button.Transaction
          action={url}
          target={`/tx/decline/${contractAddress}`}
          children={"Decline"}
        />
      ) : null,
      isArbitrator && status === "accepted" ? (
        <Button action={`${url}/settle`} children={"Settle"} />
      ) : null,
      isCreator && status === "expired" && Number(contractAmount) > 0 ? (
        <Button.Transaction
          target={`/tx/retrieve/${contractAddress}`}
          children={"Retrieve funds"}
        />
      ) : null,
    ],
  });
};