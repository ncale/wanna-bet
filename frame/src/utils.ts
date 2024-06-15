import { Address } from "viem";
import { mainnetClient } from "./viem";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getPreferredAlias(address: Address) {
  let preferredAlias: string;
  const ensName = await mainnetClient.getEnsName({ address });
  if (ensName) {
    // <- most preferred: ens name
    preferredAlias = ensName;
  } else {
    // <- 2nd most preferred: shortened address
    preferredAlias = shortenHexAddress(address);
  }
  return preferredAlias;
}

async function fetchUser(apiKey: string, fid: number) {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", api_key: apiKey },
  };

  return (await fetch(url, options).then((res) => res.json())) as UserData;
}
type UserData = {
  users: {
    object: string;
    fid: number;
    custody_address: Address;
    username: string;
    display_name: string | null;
    pfp_url: string | null;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: Address[];
    verified_addresses: {
      eth_addresses: Address[];
      sol_addresses: Address[];
    };
    active_status: string;
    power_badge: boolean;
  }[];
};

export {
  shortenHexAddress,
  capitalizeFirstLetter,
  getPreferredAlias,
  fetchUser,
};
