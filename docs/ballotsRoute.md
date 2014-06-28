
Ballot
----------------------
Routes here are related to voting/scoring a submission

####Create a new ballot; have a user vote on a submission
#####_Status: Developed, Tested
POST /v1/challenges/:cid/submissions/:sid/ballots

Example Request
```
request.body: 
{
  score: 8,
  voter: '52f548514f8c88b137000113',
}
response.body:
{
  owner: '52f548514f8c88b137000115',
  _id: '52f548514f8c88b13700011c',
  __v: 1 
}
```
