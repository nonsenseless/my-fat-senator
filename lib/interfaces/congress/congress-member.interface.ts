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