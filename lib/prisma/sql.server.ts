import { Prisma, PrismaClient } from "@prisma/client";
import invariant from 'tiny-invariant';

export interface IQuerySpecification {
	fields: Prisma.VoteFieldRefs;
	params: Map<string, string>;
	query: string;
}

export interface IWhere {
	sql: string;
	values: string[];
}

export class SqlBuilder {
	constructor(private db: PrismaClient){
		invariant(db, "SqlBuilder requires a db instance");
	};

	async executeRawUnsafe(specification: IQuerySpecification) {
		const fields = specification.fields;
		const params = specification.params;
		const query = specification.query;
		invariant(fields, 'fields required for query.');
		invariant(params, 'params required');
		invariant(query, 'query required');

		const where = this.unsafeBuildWhere(fields, params);
		return await this.db.$queryRawUnsafe(`${query} ${where.sql}`, ...where.values);
	};

	unsafeBuildWhere(fields: Prisma.VoteFieldRefs, params: Map<string, string>): IWhere {
		const clauses: string[] = [];
		const values: string[] = [];

		if (params.size == 0) {
			return {
				sql: ``,
				values: []
			};
		}

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
		const sql = `WHERE ${clauses.join(" AND ")}`;

		return {
			sql,
			values
		}
	}

}