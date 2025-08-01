SELECT State.name, State.shortName, StateCensus.population, sum(population) over () as PopMax
, ROUND( CAST(population as FLOAT) / (sum(population) over ()) * 100, 5)
FROM State 
JOIN StateCensus ON StateCensus.stateId = State.id
JOIN Census on StateCensus.censusId = Census.id
WHERE Census.year = 2020;	

SELECT ballot.*, 
legislator.bioguideid, legislator.displayName, Legislator.firstName, Legislator.lastName ,
state.name, state.shortName, 
BallotChoiceType.name, BallotChoiceType.slug,
census.year, StateCensus.population,
sum(population) OVER ()
FROM Ballot 
JOIN Legislator ON Ballot.legislatorId = Legislator.id
JOIN State on Legislator.stateId = State.id
JOIN BallotChoiceType ON BallotChoiceType.id = Ballot.ballotChoiceTypeId
JOIN Vote ON Vote.id = Ballot.voteId
JOIN CongressionalSession ON CongressionalSession.id = Vote.congressionalSessionId
JOIN Census ON CongressionalSession.censusId = Census.id
JOIN StateCensus ON StateCensus.censusId = Census.id AND StateCensus.stateId = State.id
WHERE Vote.chamberId = 1 AND Vote.id = 1445;

