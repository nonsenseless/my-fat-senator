export interface IMemberImportTerm {
	chamber: string;
	startYear: number;
	endYear?: number;
}

export interface IMemberImportDepiction {
	attribution?: string;
	imageUrl: string;
}

export interface IMemberImport {
    bioguideId: string;
    depiction?: IMemberImportDepiction;
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