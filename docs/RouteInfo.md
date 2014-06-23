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

####POST '/api/v1/challenges/:cid/submissions'
Create a new submission (multipart-form)

Example Request
```
request.body:
{ 
  owner: '52f548514f8c88b137000113',                
}
request.files:
{
  images: 
    { contentType: 'png',
      data: '010100001111000100100…'
      filename: 'name.png'
    }
}
```
Example Response
```
response:
{
 __v: 0,
  owner: '52f548514f8c88b137000113',
  _id: '52f548514f8c88b137000118',
  ballots: [],
  createdOn: '2014-02-07T20:55:45.282Z',
  image: 
  {
     buffer: '0101011111…'
  } 
}
```

####GET '/v1/challenges/:cid/submissions/top'
Read the top rated submission in a challenge; the one with the highest score

Example Response
```
response.body: 
{ 
  __v: 3,
  _id: '52fec7b4cb9c788b1b00001c',
  owner: 'Jack1234',
  score: 9,
  createdOn: '2014-02-15T01:49:40.564Z',
  image: '01021000sf0fs0er0ew0rqgfsgaffdasfeq'
}
```
####GET '/v1/challenges/:cid/submissions/users/:uid/voted'
Read all the submissions for a challenge where the user has voted

Example Response
```
response: 
[ '52fc2fd313dd08084e000396',
  '52fc2fd313dd08084e00039a' ]
```
####GET '/v1/challenges/:cid/submissions/users/:uid'
Read the specific user's submission in a challenge

Example Response
```
response: 
{ __v: 3,
  _id: '52fc36b8014f010102000036',
  owner: '52fc36b8014f010102000031',
  rank: 1,
  score: 9,
  thumbnail: 'iVBORw0KGgoAAAANSUh', 
 }
```
####GET /api/v1/challenges/:cid/submissions/:sid
Read a specific submission

Example Response
```


{
    "__v": 4,
    "_id": "535071535897f4b97500000f",
    "challenge": "535071535897f4b97500000b",
    "rank": 1,
    "owner": {username: 'userid'},
    "score": 9,
    "comments": [
        {
            "_id": "535071565897f4b97500001f",
            "comment": "Another Comment",
            "commenter": "535071535897f4b975000006",
            "date": "2014-04-18T00:27:02.136Z"
        }
    ],
    "thumbnail": {
        "data": "iVBORw0KGg",
        "contentType": "image/png"
    },
    "image": {
        "data": "iVBORw0KGgoAAAANSUhEUgAAA",
        "contentType": "image/png"
    },
    "createdOn": "2014-04-18T00:26:59.816Z"
}
```
