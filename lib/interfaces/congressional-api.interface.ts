import { LegislatorDepiction } from "@prisma/client";

export interface IMemberImportTerm {
	chamber: string;
	startYear: number;
	endYear?: number;
}

export interface IMemberImport {
    bioguideId: string;
    depiction: LegislatorDepiction;
    district: number | null;
    name: string;
    partyName: string;
    state: string;
    terms: {
        item: IMemberImportTerm[];
    };
    updateDate: string;
    url: string;
}