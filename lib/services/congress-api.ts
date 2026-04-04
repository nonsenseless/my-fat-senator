import { ICongressMember, ICongressMembersResponse, ICongressRequestParameters } from "../interfaces";

import { HttpService } from "./http.service";

export class CongressionalAPIService {
	private http: HttpService;
	private apiKey: string;

	defaultOffset = 0;
	maxResponseCount = 250;
	format = `format=json`;

	constructor() {
		if (!process.env.CONGRESS_API_KEY) {
			throw new Error("No Congress API key found.");
		}
		this.apiKey = process.env.CONGRESS_API_KEY;
		this.apiKey = `api_key=${this.apiKey}`
		this.http = new HttpService("https://api.congress.gov/v3");
	}

	buildQueryParams = (parameters: ICongressRequestParameters): string => {
		const format = parameters.format ? `format=${parameters.format}` : this.format;
		const offset = parameters.offset ? `offset=${parameters.offset}` : `offset=${this.defaultOffset}`;
		const limit = parameters.limit ? `limit=${parameters.limit}` : `limit=${this.maxResponseCount}`;

		return "?" + [this.apiKey, format, offset, limit].join("&");
	}

	/**
	 * Retrieves the list of members of a given congressional session. If no limit is supplied, will attempt to fetch entire data set in chunks of 250.
	 * - from https://api.congress.gov/#/member/congress_list2
	 * @param parameters
	 */
	getMembersOfCongress = async (parameters: ICongressRequestParameters): Promise<ICongressMember[]> => {
		const queryParams = this.buildQueryParams(parameters);
		console.log(queryParams);
		const congressNumber = parameters.congressNumber;


		const path = `/member/congress/${congressNumber}`;
		let response = await this.http.get<ICongressMembersResponse>(
			`${path}${queryParams}`,
			{ identifier: `congress-${congressNumber}` }
		);

		let members: ICongressMember[] = response.members;

		let nextPage = response.pagination.next;
		while (nextPage) {
			const url = new URL(nextPage);
			const search = url.search;
			response = await this.http.get<ICongressMembersResponse>(
				`${path}${search}&${this.apiKey}`,
				{ identifier: `congress-${congressNumber}` }
			);

			members = members.concat(response.members);
			nextPage = response.pagination.next;
		}

		console.log(`Record Count: ${response.pagination.count}`);
		console.log(`Next Page: ${response.pagination.next || 'None'}`);

		return members;
	}
}