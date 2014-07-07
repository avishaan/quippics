
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
  friend: 52e73b76ca1c1f8202000008
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
```
