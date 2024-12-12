import { Prisma, PrismaClient } from "@prisma/client";
import { RawValue } from "@prisma/client/runtime/library";
import invariant from 'tiny-invariant';

export interface IQuerySpecification {
	db: PrismaClient;
	fields: Prisma.VoteFieldRefs;
	params: Map<string, string>;
	query: string;
}

export interface IWhere {
	sql: Prisma.Sql;
	values: string[];
}

export class SqlBuilder {

	static async executeRawUnsafe(specification: IQuerySpecification) {
		const fields = specification.fields;
		const params = specification.params;
		const query = specification.query;
		const db = specification.db;
		invariant(db);
		invariant(fields, 'fields required for query.');
		invariant(params, 'params required');
		invariant(query, 'query required');

		const where = this.unsafeBuildWhere(fields, params);
		const sql = Prisma.join([
			Prisma.raw(`${query}`),
			Prisma.raw(`${where.sql.sql}`)
		], " ");

		return await db.$queryRawUnsafe(`${query} ${where.sql.sql}`, ...where.values);
	};
	
	static unsafeBuildWhere(fields: Prisma.VoteFieldRefs, params: Map<string, string>): IWhere {
		const clauses: RawValue[] = [];
		const values: string[] = [];

		if (params.size == 0) {
			return {
				sql: Prisma.empty,
				values: [] 
			};
		}
	
		for (const field of Object.keys(fields)) {
			const param = params.get(field);
			if (param) {
				const clause = Prisma.raw(`Vote.${field} = ?`);
				clauses.push(clause);
				values.push(param);
			}

			if (params.get(field + "_LIKE")) {
				const clause = Prisma.raw(`Vote.${field} LIKE %?%`);
				clauses.push(clause);
				values.push(`${"%" + params.get(field) + "%"}`);
			}
		}
		const sql = Prisma.join(
			[
				Prisma.sql`WHERE`, 
				Prisma.join([...clauses], " AND ")
			], " "); 
		return {
			sql,
			values
		} 
	}

}