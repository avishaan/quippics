
Challenge
----------------------
Routes here are related to creating, reading challenges.

####Lists the challenges where the user is the owner, invited to, or public
#####_Status: Developed, Partially Tested  
GET '/v1/users/:uid/challenges/page/:page'

Example Response
```
response: [ { __v: 1,
    _id: '52fc632f2c769a7503000006',
    owner: '52fc632f2c769a7503000003',
    title: 'Frisby Challenge 2',
    submissions: 
          [{thumbnail: '01021fda0sfs0fdsadsfdf0eefe0' }],
    createdOn: '2014-02-13T06:16:15.462Z',
    expiration: '2014-02-13T06:16:15.462Z',
    unscored: 99,
    numParticipants: 10,
    inviteStatus: 'invited'
}, {}, {}, ]
```
####Create a new challenge
#####_Status: Developed, Partially Tested 
POST '/v1/challenges'

Example Request
```
request.body:
{
  title: 'sampleChallenge',
  owner: '52f548514f8c88b137000113',
  tags: [ 'tag1', 'tag2', 'tag3' ],

  privacy: 'public',
  expiration: new Date(2014, 10, 15),
  description: 'Description for challenge',
  invites: [ '530ae320b5e51b420300010f' ]
}
```
Example Response
```
{ __v: 0,
  title: 'sampleChallenge',
  owner: '52f548514f8c88b137000113',
  _id: '52f548514f8c88b137000116',
  submissions: [],
  createdOn: '2014-02-07T20:55:45.259Z',
  tags: [ 'tag1', 'tag2', 'tag3' ],
  expiration: '2014-04-15T04:00:00.000Z',
  description: 'Description for challenge',
  invites: [ '530ae320b5e51b420300010f' ]
}
```
####Read a specific challenge
#####_Status: Developed, Not Tested
GET '/v1/challenges/:cid'

Example Response
```
{ __v: 0,
  title: 'sampleChallenge',
  owner: '52f548514f8c88b137000113',
  _id: '52f548514f8c88b137000116',
  description: 'Challenge Description',
  createdOn: '2014-02-07T20:55:45.259Z',
  tags: [ 'tag1', 'tag2', 'tag3' ] 
}
```
####Accept a challenge invite
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/accepts'

Example Request
```
request: {
  user: '52f548514f8c88b137000116'
}
```
Example Response
```
response: {
  clientMsg: 'Challenge Accepted!'
}
```

####Decline a challenge invite
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/declines'

Example Request
```
request: {
  user: '52f548514f8c88b137000116'
}
```
Example Response
```
response: {
  clientMsg: 'Challenge Declined'
}
```

####Get list of expired/archived challenges for a specific user
#####_Status: Developed, Partially Tested
GET '/v1/users/:uid/challenges/archive/page/:page'

Example Response
```
response:
[ { _id: '530c90d04ddf54a809000022',
    expiration: '2014-04-15T00:00:00.000Z',
    numParticipants: 2
    title: 'Frisby Challenge 2',
    submissions: {
          _id: '',
          thumbnail: '',
          score: '',
          rank: ''
          },
   },{},{}]
```
####Hide an Archived Challenge
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/hidden'

Example Request
```
request: {
  user: '52f548514f8c88b137000116'
}
```
Example Response
```
response: {
  clientMsg: 'Challenge Hidden'
}
```

####Get list of users participating in a challenge
#####_Status: Developed, Not Tested
GET '/v1/challenges/:cid/users/page/:page'

Example Response
```
response:

```
