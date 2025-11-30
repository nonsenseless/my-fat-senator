import axios from "axios";

import { ICongressMember } from "../interfaces";

export class CongressionalAPIService {
	private rootURL = "https://api.congress.gov/v3/";
	private apiKey: string;

	get apiParam() {
		return `api_key=${this.apiKey}`
	}

	constructor() {
		if (!process.env.CONGRESS_API_KEY) {
			throw new Error("No Congress API key found.");
		}
		this.apiKey = process.env.CONGRESS_API_KEY
	}

	/**
	 * Retrieves the list of members of a given congressional session
	 * - from https://api.congress.gov/#/member/congress_list2
	 * @param congressNumber e.g. The 118 congress
	 */
	getMembersOfCongress = async (congressNumber: number): Promise<ICongressMember[]> => {
		try {
			const response = await axios.get(`${this.rootURL}/member/congress/${congressNumber}?${this.apiParam}`);
			console.log(response);
			if (response.status == 200) {
				// TODO: Not sure what the archetypal way to ensure type safety is here
				// But I also need to stop overcomplicating things on this project and finish it.
				return response.data as ICongressMember[];
			}

			// TODO Check for more statuses, 300 redirects, etc
		} catch (error) {
			console.error(error);
		}
		return [];
	}
}