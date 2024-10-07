SELECT vote.*,
	categoryType.name as categoryTypeName, categoryType.slug as categoryTypeSlug,
	chamber.name as chamberName, chamber.slug as ChamberSlug,
	congressionalSession.name as congressionalSessionName, congressionalSession.slug as congressionalSessionSlug,
	requiresType.name as requiresTypeName, requiresType.slug as requiresTypeSlug,
	resultType.name as resultTypeName, resultType.slug as resultTypeSlug,
	voteType.name as voteTypeName, voteType.slug as voteTypeSlug
FROM vote
LEFT OUTER JOIN categoryType ON categoryType.id = vote.categoryId
LEFT OUTER JOIN chamber ON categoryType.id = vote.chamberId
LEFT OUTER JOIN congressionalSession ON categoryType.id = vote.congressionalSessionId
LEFT OUTER JOIN requiresType ON requiresType.id = vote.requiresTypeId
LEFT OUTER JOIN resultType ON resultType.id = vote.resultTypeId
LEFT OUTER JOIN voteType ON voteType.id = vote.voteTypeId