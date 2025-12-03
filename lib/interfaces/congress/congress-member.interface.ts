export interface ICongressMember {
  bioguideId: string;
  depiction?: {
    attribution: string;
    imageUrl: string;
  };
  district?: number;
  name: string;
  partyName: string;
  state: string;
  terms: {
    item: ICongressTerm[];
  };
  updateDate: string;
  url: string;
}

export interface ICongressTerm {
  chamber: 'House of Representatives' | 'Senate';
  endYear: number;
  startYear: number;
}

export interface ICongressRequestParameters {
  congressNumber: number;
  offset?: number;
  limit?: number;
  format?: string;
  currentMember: "true" | "false"
}

export interface ICongressMembersResponse {
  members: ICongressMember[];
  pagination: {
    count: number;
    next?: string;
  };
  request: {
    congress: string;
    contentType: string;
    format: string;
  };
}