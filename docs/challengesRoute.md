
Challenge
----------------------
Routes here are related to creating, reading challenges.

####Lists the challenges where the user is the owner, invited to, or public
#####_Status: Developed, Partially Tested  
GET '/v1/users/:uid/challenges/page/:page'

- challenges will continue to be returned 24hrs after expiration for voting (not tested)

Example Response
```
response: [ { __v: 1,
    _id: '52fc632f2c769a7503000006',
    owner: { username: 'popular123', _id: '54d03237d8c94aec14c4d6b5' },
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
####Create a new challenge V2
#####_Status: Not Developed, Not Tested 
POST '/v2/challenges'

if privacy is public then followers will constantly be added as they follow no need
to invite people manually
if privacy is private then only those in the invites array will be invited

Example Request
```
request.body:
{
  title: 'sampleChallenge',
  owner: '52f548514f8c88b137000113',
  tags: [ 'tag1', 'tag2', 'tag3' ],
  persisted: true,
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
  persisted: true,
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
  tags: [ 'tag1', 'tag2', 'tag3' ] ,
  privacy: 'public',
  private: 'private'
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
#####_Status: Developed, Tested
GET '/v1/users/:uid/challenges/archive/page/:page'  
GET '/v1/users/:uid/submissions/archive/page/:page' **(depreciated)**

- When user doesn't have a submission, no thumbnail nor submission will be returned

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
#####_Status: Developed, Tested
GET '/v1/challenges/:cid/users/page/:page'

Example Response
```
response:
 [{ user:
     { username: 'nerd314',
       _id: '53c5d5706d2e9dd22de41d13',
       thumbnail:
        { data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAAAAAAdwx7eAAAAB', 
          contentType: 'image/png' } } },
  { user:
     { username: 'user3',
       _id: '53c5d5706d2e9dd22de41d14',
       thumbnail:
        { data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAAAAAAdwx7eAAAAB', 
          contentType: 'image/png' } } } ]
```
