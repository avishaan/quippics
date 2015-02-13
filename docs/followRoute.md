
Follow
----------------------
Routes that deal with following, followed by, and blocking users

####Get list of followers for a specific user id (:uid) at a specific page#(:page)
#####_Status: Developed, Partially Tested
GET '/v1/users/:uid/followers/page/:page'

Example Response
```
response:{
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

####Get list of peeps (followers and follows) for a specific user id (:uid) at a specific page#(:page)
#####_Status: Not Developed, Not Tested
GET '/v1/users/:uid/peeps/page/:page'

Example Response
```
response:{
    [ { _id: '5351fc22740f0fc97f000005',
      username: 'jack1985739000update',
      isFollower: true,
      isFollows: false
      thumbnail:
       { contentType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAI=' 
       } 
      }, {}, {} 
    ],
  }
```

####Get list of users you are following for a specific user id (:uid) at a specific page#(:page)
#####_Status: Developed, Partially Tested
GET '/v1/users/:uid/follows/page/:page'

Example Response
```
response:{
    [ { _id: '5351fc22740f0fc97f000005',
      username: 'jack1985739000update',
      thumbnail:
       { contentType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAI=' 
       } 
      }, {}, {} 
    ]
  }
```

####Follow a user
#####_Status: Developed, Partially Tested
The user defined here is the user who is doing the following. The user in the request
body is the user you want to follow.
POST /v1/users/:uid/follows

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```
Example Response
```
request.body: {
  clientMsg: User followed!
}
```

####Stop following a user
#####_Status: Developed, Partially Tested
Note: If you are following this user, you will stop following them.
DELETE /v1/users/:uid/follows

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```
Example Response
```
request.body: {
  clientMsg: User blocked!
}
```

####Block a user who is following you
#####_Status: Developed, Partially Tested
Note: if you are following a user, pass in the user you want to block and they will stop following you
DELETE /v1/users/:uid/followers

Example Request
```
request.body: {
  user: 52e73b76ca1c1f8202000008
}
```
Example Response
```
request.body: {
  clientMsg: User blocked!
}
```
