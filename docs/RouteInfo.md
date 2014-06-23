List of routes, what they do, and example responses.
====================================================

Challenge
----------------------
Routes here are related to creating, reading challenges.

####GET '/v1/users/:uid/challenges/page/:page'
Lists the challenges where the user is the owner, invited to, or public

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
####POST '/v1/challenges'
Create a new challenge

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

####POST '/v1/challenges/:cid/accepts'
Accept a challenge invite

####POST '/v1/challenges/:cid/declines'
Decline a challenge invite

####GET '/v1/users/:uid/challenges/archive/page/:page'
Get list of expired/archived challenges for a specific user

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

Submission
----------------------
Routes here are related to creating, reading submissions
