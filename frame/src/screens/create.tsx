import { Button, TextInput } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { type CustomFrameContext } from "../types";
import {
  AddressSchema,
  BetAmountSchema,
  BetIdSchema,
  CreatePageNumSchema,
  DaysValidForSchema,
  EnsNameSchema,
} from "../zodSchemas";
import { mainnetClientFn } from "../viem";
import { normalize } from "viem/ens";
import { Address, parseUnits } from "viem";

export const createScreen = async (
  c: CustomFrameContext<"/bets/:betId/create/:pageNum">
) => {
  // Validate params
  const { betId, pageNum } = c.req.param();
  const { success: betIdSuccess, data: parsedBetId } = BetIdSchema.safeParse(
    Number(betId)
  );
  const { success: pageNumSuccess, data: parsedPageNum } =
    CreatePageNumSchema.safeParse(Number(pageNum));
  const betHomePath = `/bets/${parsedBetId}`;
  const nextPagePath = parsedPageNum
    ? `${betHomePath}/create/${parsedPageNum + 1}`
    : betHomePath;
  const prevPagePath = parsedPageNum
    ? `${betHomePath}/create/${parsedPageNum - 1}`
    : betHomePath;
  if (!betIdSuccess || !pageNumSuccess) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bad url</span>
        </div>
      ),
      intents: [
        <Button
          action={betIdSuccess ? betHomePath : "/home"}
          children={"Back"}
        />,
      ],
    });
  }

  if (parsedPageNum === 1) {
    // Reset state if going forward
    const { buttonValue, deriveState } = c;
    if (buttonValue === "create") {
      const state = deriveState((previousState) => {
        previousState.participant = "";
        previousState.arbitrator = "";
        previousState.amount = 0;
        previousState.message = "";
        previousState.validForDays = 7;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Who are you betting with?</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}>
            ENS name or full address
          </span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. example.eth or 0xabc..." />,
        <Button action={betHomePath} value="back" children={"Back"} />,
        <Button action={nextPagePath} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 2) {
    // Validate address and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const { success: ensNameSuccess, data: parsedEnsName } =
        EnsNameSchema.safeParse(inputText);
      const { success: addressSuccess, data: parsedAddress } =
        AddressSchema.safeParse(inputText);

      let participantAddress: Address;
      if (ensNameSuccess) {
        const mainnetClient = mainnetClientFn(c.env);
        participantAddress = (await mainnetClient.getEnsAddress({
          name: normalize(parsedEnsName),
        })) as Address;
      } else if (addressSuccess) {
        participantAddress = parsedAddress;
      } else {
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>error - Input needs to be a valid address or ens name</span>
            </div>
          ),
          intents: [<Button action={prevPagePath} children="Back" />],
        });
      }
      // Update state
      const state = deriveState((previousState) => {
        previousState.participant = participantAddress;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>How much Arbitrum USDC do you want to bet?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 5" />,
        <Button action={prevPagePath} value="back" children={"Back"} />,
        <Button action={nextPagePath} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 3) {
    // Validate amount and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const { success, data } = BetAmountSchema.safeParse(Number(inputText));
      if (!success)
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>
                {"error - Input needs to be a positive integer <= $5k"}
              </span>
            </div>
          ),
          intents: [<Button action={prevPagePath} children="Back" />],
        });
      // Update state
      const state = deriveState((previousState) => {
        previousState.amount = data;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>What are the terms?</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}>
            You are betting that...
          </span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. ETH price will be $5k by..." />,
        <Button action={prevPagePath} value="back" children={"Back"} />,
        <Button action={nextPagePath} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 4) {
    // Validate message and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      const { inputText, deriveState } = c;
      // Update state
      const state = deriveState((previousState) => {
        previousState.message = inputText ? inputText : "";
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>How many days should your opponent have to accept?</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}>
            Past this point, the offer will expire and you can reclaim your
            wager.
          </span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 7" />,
        <Button action={prevPagePath} value="back" children={"Back"} />,
        <Button action={nextPagePath} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 5) {
    // Validate amount and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;

      const { success, data } = DaysValidForSchema.safeParse(Number(inputText));
      if (!success)
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>
                {"error - Input needs to be a positive integer <= 14"}
              </span>
            </div>
          ),
          intents: [<Button action={prevPagePath} children="Back" />],
        });
      // Update state
      const state = deriveState((previousState) => {
        previousState.validForDays = data;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Who would you like to judge?</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}>
            The judge determines the winner of the bet; This can be you, the
            recipient, or someone else.
          </span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. example.eth or 0xabc..." />,
        <Button action={prevPagePath} value="back" children={"Back"} />,
        <Button action={nextPagePath} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 6) {
    // Validate address and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const { success: ensNameSuccess, data: parsedEnsName } =
        EnsNameSchema.safeParse(inputText);
      const { success: addressSuccess, data: parsedAddress } =
        AddressSchema.safeParse(inputText);

      let arbitratorAddress: Address;
      if (ensNameSuccess) {
        const mainnetClient = mainnetClientFn(c.env);
        arbitratorAddress = (await mainnetClient.getEnsAddress({
          name: normalize(parsedEnsName),
        })) as Address;
      } else if (addressSuccess) {
        arbitratorAddress = parsedAddress;
      } else {
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>error - Input needs to be a valid address or ens name</span>
            </div>
          ),
          intents: [<Button action={prevPagePath} children="Back" />],
        });
      }
      // Update state
      const state = deriveState((previousState) => {
        previousState.arbitrator = arbitratorAddress;
      });
    }
    const { previousState } = c;
    const bigIntAmount = parseUnits(previousState.amount.toString(), 6);
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Authorize moving your wager to the bet contract</span>
        </div>
      ),
      intents: [
        <Button action={prevPagePath} value="back" children={"Back"} />,
        <Button.Transaction
          action={nextPagePath}
          target={`/tx/authorize?spender=${MAINNET_BET_FACTORY_CONTRACT_ADDRESS}&amount=${bigIntAmount}`}
          children={"Authorize"}
        />,
      ],
    });
  } else if (parsedPageNum === 7) {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Deploy your bet</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}></span>
        </div>
      ),
      intents: [
        <Button.Transaction
          action={nextPagePath}
          target="/tx/create"
          children={"Create bet"}
        />,
      ],
    });
  } else {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Bet created!</span>
          <span style={{ ...subTextStyles, marginTop: 20 }}>
            View your recent mentions or @wannabet to see your bet
          </span>
        </div>
      ),
      intents: [<Button action={betHomePath} children={"Finish"} />],
    });
  }
};
