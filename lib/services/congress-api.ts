import axios from "axios";

import { ICongressMember, ICongressMembersResponse, ICongressRequestParameters } from "../interfaces";

export class CongressionalAPIService {
	private rootURL = "https://api.congress.gov/v3/";
	private apiKey: string;

	defaultOffset = 0;
	maxResponseCount = 250;
	format = `format=json`;
	get apiParam() {
		return `api_key=${this.apiKey}`
	}

	// TODO: Could validate params.
	buildQueryParams = (parameters: ICongressRequestParameters) => {
		const apiParam = this.apiParam;
		const format = parameters.format ? `format=${parameters.format}` : this.format;
		const offset = parameters.offset ? `offset=${parameters.offset}` : this.defaultOffset;
		const limit = parameters.limit ? `limit=${parameters.limit}` : this.maxResponseCount;

		return [apiParam, format, offset, limit].join("&");
	}


	constructor() {
		if (!process.env.CONGRESS_API_KEY) {
			throw new Error("No Congress API key found.");
		}
		this.apiKey = process.env.CONGRESS_API_KEY
	}

	/**
	 * Retrieves the list of members of a given congressional session. If no limit is supplied, will attempt to fetch entire data set in chunks of 250.
	 * - from https://api.congress.gov/#/member/congress_list2
	 * @param parameters
	 */
	getMembersOfCongress = async (parameters: ICongressRequestParameters): Promise<ICongressMembersResponse> => {
		try {
			const queryParams = this.buildQueryParams(parameters);
			const congressNumber = parameters.congressNumber;

			const response = await axios.get(`${this.rootURL}/member/congress/${congressNumber}?${queryParams}`);

			if (response.status == 200) {
				console.log(`
					Success response: ${response.statusText};
				`)
				// TODO: Not sure what the archetypal way to ensure type safety is here
				// But I also need to stop overcomplicating things on this project and finish it.
				const data = response.data as ICongressMembersResponse;
				const legislators = data.members;
				const hasNextPage = data.pagination.next
				const recordCount = data.pagination.count;
				console.log(`
					Record Count: ${recordCount};
					Next Page: ${hasNextPage}
				`)
			}

			console.log(response);

			// TODO Check for more statuses, 300 redirects, etc
		} catch (error) {
			console.error(error);
		}
		return [];
	}
}