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
####GET /v1/challenges/:cid/submissions/:sid
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
####GET /v1/challenges/:cid/submission/page/:page
Read all the submissions for a specific challenge

Example Response
```
response: [ {
  __v: 3,
  _id: '52fc0d5713dd08084e0002ab',
  owner: '52fc0d5613dd08084e0002a6',
  "thumbnail": {
    "data": "iVBORw0KGgoAAAANSUhEUgAAACMAAAAjAQAAAAA2oCYII",
    "contentType": "image/png"
  }, {}, {}, {}]
```

Ballot
----------------------
Routes here are related to voting/scoring a submission

#####POST /v1/challenges/:cid/submissions/:sid/ballots
Create a new ballot; have a user vote on a submission

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

User
----------------------
Routes here are related to user registrations, login, etc

####POST /v1/register
Register a new user

Example Request (multipart with images)
```
request.body:
{
  username: 'jack1985',
  password: 'password',
  email: 'jack1985@gmail.com'
};
```
Example Response
```
request.files:
{
  images: 
  {
contentType: 'png',
   data: '010100001111000100100…'
   filename: 'name.png'
  }
}
response:
{ 
  __v: 0,
  username: 'jack1985',
  _id: '52f548514f8c88b137000113'
}
```

####PUT /v1/users/:uid
Update an existing user

Example Request (multipart with images)
```
{
  username: 'jack1985',
  password: 'password',
  newPassword(opt): 'passwordupdate',
  email(opt): 'jack1985@gmail.com'
};
```

Example Response
```
request.files:
{
  images: 
  {
  contentType: 'png',
     data: '010100001111000100100…'
     filename: 'name.png'
  }
}
response:
{ 
  __v: 0,
  username: 'jack1985',
  _id: '52f548514f8c88b137000113',
}
```

####POST /v1/users
Authenticate user and return userid

Example Request
```
request: {
  username: 'jill1987'
  password: 'password'
}
```

Example Response
```
response: {
  _id: '52f548514f8c88b137000113'
}
```

####GET /v1/users/:uid/users/page/:page
Return the list of users

Example Response
```
response: [{
  username: 'jill1987',
  friend: true,
  _id: 52e73b76ca1c1f8202000008,
  thumbnail: {data: 0ad0fdsaf0dadfdffea0} 
},
{
  username: 'jack1985',
  friend: false,
  _id:52f548514f8c88b137000113,
  thumbnail: {data: 0ad0fdsaf0dadfdffea0}
}]
```

####GET /v1/users/search/:search
Perform a text search of the usernames

Example Response
```
response: [{
username: 'jill1987'
_id: 52e73b76ca1c1f8202000008,
thumbnail: {data: 0ad0fdsaf0dadfdffea0} 
},
{
username: 'jack1985',
_id:52f548514f8c88b137000113,
thumbnail: {data: 0ad0fdsaf0dadfdffea0}
}]
```

####GET /v1/users/:uid
Read profile information of a specific user

Example Response
```
  username: 'jill1987',
  _id: 52f548514f8c88b137000113,
  email: 'jill1987@gmail.com',
  thumbnail: {data: 0ad0fdsaf0dadfdffea0},
  rank: 'Novice'
}
```

Friendship
----------------------
Routes that deal with requesting, adding, declining friends

####GET '/v1/users/:uid/friends/page/:page'
Get list of friends for a specific user id (:uid) at a specific page#(:page)

Example Response
```
response:{
   __v: 1,
   _id: '5351fc21740f0fc97f000003',
   friends:
    [ { _id: '5351fc22740f0fc97f000005',
      username: 'jack1985739000update',
      thumbnail:
       { contentType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAI=' 
       } 
      }, {}, {} 
    ],
  }
```

####POST /v1/users/:uid/friends
Accept a pending friend request

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####POST /v1/users/:uid/declinedRequests
Decline a pending friend request

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####POST /v1/users/:uid/friendRequests
Send a new friend request to a user who is not your friend

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####GET /v1/users/:uid/friendRequests/page/:page
Read list of friend requests

Example Response
```
response:{
 __v: 1,
  _id: '5351fc21740f0fc97f000003',
  requests:
   [ { _id: '5351fc22740f0fc97f000005',
       username: 'jack1985739000update',
       thumbnail:
       {  contentType: 'image/png',
          data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAI=' 
       } 
    }],
}

