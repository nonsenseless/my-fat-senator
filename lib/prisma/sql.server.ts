import { Prisma, PrismaClient } from "@prisma/client";
import invariant from 'tiny-invariant';

export interface IQuerySpecification {
	fields: Prisma.VoteFieldRefs;
	select: string;
	from: string;
	params: Map<string, string>;
	orderBy: string;
}

export interface IQueryResult<T> {
	results: T[];
	count: number;
}

export interface IWhere {
	sql: string;
	values: string[];
}

export interface IQueryCount {
	count: number;
} 

export class SqlBuilder {
	constructor(private db: PrismaClient){
		invariant(db, "SqlBuilder requires a db instance");
	};

	async executeRawUnsafe<T>(specification: IQuerySpecification): Promise<IQueryResult<T>> {
		const fields = specification.fields;
		const params = specification.params;
		const select = specification.select;
		const from = specification.from;
		invariant(fields, 'fields required for query.');
		invariant(params, 'params required');
		invariant(select, 'select required');
		invariant(from, 'from required');

		const where = this.unsafeBuildWhere(fields, params);
		let sql = `
			${select}
			${from}
			${where.sql} 
			${specification.orderBy}
			`; 
		const results = await this.db.$queryRawUnsafe(sql, ...where.values) as T[];
		
		sql = `
			SELECT COUNT(*) as count
			${from}
			${where.sql}`; 

		const count = await this.db.$queryRawUnsafe(sql, ...where.values) as IQueryCount[];
		
		return {
			results,
			count: Number(count[0].count)
		}

	};

	unsafeBuildWhere(fields: Prisma.VoteFieldRefs, params: Map<string, string>): IWhere {
		const clauses: string[] = [];
		const values: string[] = [];

		for (const field of Object.keys(fields)) {
			const param = params.get(field);
			if (param) {
				const key = (field as keyof typeof fields);
				const clause = `${fields[key].modelName}.${field} = ?`;
				clauses.push(clause);
				values.push(param);
			}

			if (params.get(field + "_LIKE")) {
				const clause = `Vote.${field} LIKE %?%`;
				clauses.push(clause);
				values.push(`${"%" + params.get(field) + "%"}`);
			}
		}

		if (clauses.length == 0) {
			return {
				sql: ``,
				values: []
			};
		}

		const sql = `WHERE ${clauses.join(" AND ")}`;

		return {
			sql,
			values
		}
	}

}