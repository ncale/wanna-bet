import type { Address } from "viem";
import type { RawBet, RawBets } from "./types";

/** Response type for if there is a graph ql error */

export type GqlErrorResponse = {
  errors: {
    message: string;
    locations: { line: number; column: number }[];
  }[];
};

/** Queries and response type for single bets */

export type BetQueryResponse = { data: { bet: RawBet } };

export const generateBetQuery = (betId: number) => `
query MyQuery {
	bet(id: "${betId}") {
		id
		contractAddress
		creator
		participant
		amount
		token
		message
		judge
		createdTime
		validUntil
	}
}
`;

/** Queries and response type for multiple bets */

export type BetsQueryResponse = { data: { bets: RawBets } };

export const generateBetsQuery = (betIds: number[]) => `
query MyQuery {
  bets(where: {id_in: [${betIds.map((id) => `"${id}"`).join(",")}]}) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
  }
}
`;

export const generateRecentBetsQuery = (
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		orderBy: "id", 
		limit: ${numBets}, 
		orderDirection: "desc",
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{judge: "${user.toLowerCase()}"}, 
			{creator: "${user.toLowerCase()}"}, 
			{participant: "${user.toLowerCase()}"}
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsAsPartyQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{creator: "${user.toLowerCase()}"}, 
			{participant: "${user.toLowerCase()}"}
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsAsJudgeQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{judge: "${user.toLowerCase()}"}, 
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateMostRecentBetIdQuery = () => `
query MyQuery {
  bets(
		orderBy: "id", 
		limit: 1, 
		orderDirection: "desc",
	) {
    items {
      id
    }
  }
}
`;
