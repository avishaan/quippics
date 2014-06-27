List of routes, what they do, and example responses.
====================================================

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

####Accept a challenge invite
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/accepts'

####Decline a challenge invite
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/declines'

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

Submission
----------------------
Routes here are related to creating, reading submissions

####Create a new submission (multipart-form)
#####_Status: Developed, Tested
POST '/v1/challenges/:cid/submissions'

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

####Read the top rated submission in a challenge; the one with the highest score
#####_Status: Developed, Tested
GET '/v1/challenges/:cid/submissions/top'

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
####Read all the submissions for a challenge where the user has voted
#####_Status: Not Developed, Not Tested
GET '/v1/challenges/:cid/submissions/users/:uid/voted'

Example Response
```
response: 
[ '52fc2fd313dd08084e000396',
  '52fc2fd313dd08084e00039a' ]
```
####Read the specific user's submission in a challenge
#####_Status: Developed, Tested
GET '/v1/challenges/:cid/submissions/users/:uid'

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
####Read a specific submission
#####_Status: Developed, Tested
GET /v1/challenges/:cid/submissions/:sid

Example Response
```
{
  "__v": 4,
  "_id": "535071535897f4b97500000f",
  "challenge": "535071535897f4b97500000b",
  "rank": 1,
  "owner": {username: 'userid'},
  "score": 9,
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
####Read all the submissions for a specific challenge
#####_Status: Developed, Tested
GET /v1/challenges/:cid/submission/page/:page

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

User
----------------------
Routes here are related to user registrations, login, etc

####Register a new user
#####_Status: Developed, Tested
POST /v1/register

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

####Update an existing user
#####_Status: Developed, Tested
PUT /v1/users/:uid

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

####Authenticate user and return userid
#####_Status: Developed, Tested
POST /v1/users

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

####Return the list of users
#####_Status: Developed, Tested
GET /v1/users/:uid/users/page/:page

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

####Perform a text search of the usernames
#####_Status: Developed, Tested
GET /v1/users/search/:search

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

####Read profile information of a specific user
#####_Status: Developed, Tested
GET /v1/users/:uid

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

####Get list of friends for a specific user id (:uid) at a specific page#(:page)
#####_Status: Developed, Tested
GET '/v1/users/:uid/friends/page/:page'

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

####Accept a pending friend request
#####_Status: Developed, Tested
POST /v1/users/:uid/friends

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####Decline a pending friend request
#####_Status: Developed, Tested
POST /v1/users/:uid/declinedRequests

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####Send a new friend request to a user who is not your friend
#####_Status: Developed, Tested
POST /v1/users/:uid/friendRequests

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```

####Read list of friend requests
#####_Status: Developed, Tested
GET /v1/users/:uid/friendRequests/page/:page

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

Activity
----------------------
Routes here are related to viewing activities

####List activities for all of the user's friends
#####_Status: Developed, Not Tested
GET v1/activities/users/:uid/friends/page/:page (depreciated)
GET v1/users/:uid/friends/activities/page/:page (preferred)

Example Response for Ballots
```
{
  "sentence": "sleepyfloydshaan3069496 voted on, jack19853069496update's photo in, Frisby Challenge 1 a 10/10",
  "object": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFoAAAB
      }
  },
  "subject": {
      "username": "sleepyfloydshaan3069496",
      "_id": "536eab78486cbdb681000006"
  },
  "score": 10,
  "modelType": "Ballot",
  "_id": "536eab7a486cbdb68100001e",
  "owner": null,
  "references": {
      "submission": {
          "_id": "536eab79486cbdb681000010",
          "owner": "536eab78486cbdb681000005"
      },
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      }
  },
  "date": "2014-05-10T22:43:06.033Z"
}
```

Example Response for Comments
```
{
  "sentence": "jill19873069496 commented on, jack19853069496update's photo",
  "modelType": "Comment",
  "object": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo      }
  },
  "subject": {
      "_id": "536eab77486cbdb681000003",
      "username": "jill19873069496",
      "thumbnail": {
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo
          "contentType": "image/png"
      }
  },
  "_id": "536eab7b486cbdb681000022",
  "owner": null,
  "references": {
      "submission": {
          "_id": "536eab79486cbdb681000010",
          "owner": "536eab78486cbdb681000005"
      },
      "comment": "536eab7b486cbdb681000021",
      "challenge": null
  },
  "date": "2014-05-10T22:43:07.237Z"
}
```

Example Response for Submissions
```
{
  "sentence": "jill19873069496 submitted into challenge, Frisby Challenge 1",
  "subject": {
      "_id": "536eab77486cbdb681000003",
      "username": "jill19873069496",
      "thumbnail": {
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo,
          "contentType": "image/png"
      }
  },
  "owner": 536eab77486cbdb681000003,
  "modelType": "Submission",
  "_id": "536eab79486cbdb681000014",
  "object": null,
  "references": {
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      },
      "submission": {
          "_id": "536eab79486cbdb681000011",
          "owner": "536eab77486cbdb681000003"
      }
  },
  "date": "2014-05-10T22:43:05.245Z"
}
```

Example Response for Challenge
```
{
  "sentence": "jack19853069496update created a challenge, Frisby Challenge 1",
  "subject": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAAHdihOkAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAEklEQVQ4y2NgGAWjYBSMgsECAASSAAEg+JsVAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE0LTA1LTEwVDE1OjQzOjA0LTA3OjAw+/vvZQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNC0wNS0xMFQxNTo0MzowNC0wNzowMIqmV9kAAAAASUVORK5CYII="
      }
  },
  "modelType": "Challenge",
  "_id": "536eab78486cbdb68100000c",
  "object": null,
  "owner": null,
  "references": {
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      },
      "submission": null
  },
  "date": "2014-05-10T22:43:04.923Z"
},
```

####List activities specific to the user
#####_Status: Developed, Tested
GET v1/activities/users/:uid/page/:page (depreciated)
GET v1/users/:uid/activities/page/:page (preferred)

Example Response
(same as above for activities of all the user's friends)
[Linky](list-activities-for-all-of-the-user's-friends)

Comment
----------------------
Routes related to reading and creating comments

####Create a comment on a specified submission
#####_Status: Developed, Tested
POST /v1/challenges/:cid/submissions/:sid/comments

Example Request
```
request.body: {
  commenter: '5306920683c324ce4b000004',
  comment: 'This is a comment'
}
```

Example Response
```
response.body: {
  comment: 'This is a comment by nerdy',
  _id: '53aba7341a1afb0000b31e8d',
  date: 1403758388611,
   {}, {}

```

####Read all the comments for a specific submission
#####_Status: Developed, Tested
GET /v1/challenges/:cid/submissions/:sid/comments/page/:page

Example Response
```

response.body: [ { 
  _id: '5306950fadebc6224c000031',
      comment: 'This is a comment',
      commenter: {
        username: 'sleepyfloydshaan',
        thumbnail: 'iVBORw0KGgoAAAANSUh',
        _id: '538a689d08bbf2d14100000e'
       },
      date: '2014-02-20T23:51:43.621Z' }
   ],[ { 
  _id: '5306950fadebc6224c000032',
      comment: 'This is another comment',
      commenter: {
        username: 'sleepyfloydshaan',
        thumbnail: 'iVBORw0KGgoAAAANSUh',
        _id: '538a689d08bbf2d14100000e'
       },
      date: '2014-02-21T23:51:43.621Z' }
   ]
```

####Read one of the comments for a specific submission
#####_Status: Not Developed, Not Tested
GET /v1/challenges/:cid/submissions/:sid/comments/:comid
