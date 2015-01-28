
Follow
----------------------
Routes that deal with following, followed by, and blocking users

####Get list of followers for a specific user id (:uid) at a specific page#(:page)
#####_Status: Not Developed, Not Tested
GET '/v1/users/:uid/followers/page/:page'

Example Response
```
response:{
   __v: 1,
   _id: '5351fc21740f0fc97f000003',
   follows:
    [ { _id: '5351fc22740f0fc97f000005',
      username: 'jack1985739000update',
      thumbnail:
       { contentType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAI=' 
       } 
      }, {}, {} 
    ],
   followers:
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

####Get list of users you are following for a specific user id (:uid) at a specific page#(:page)
#####_Status: Not Developed, Not Tested
GET '/v1/users/:uid/follows/page/:page'

Example Response
```
response:{
   __v: 1,
   _id: '5351fc21740f0fc97f000003',
   follows:
    [ { _id: '5351fc22740f0fc97f000005',
      username: 'jack1985739000update',
      thumbnail:
       { contentType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAI=' 
       } 
      }, {}, {} 
    ],
   followers:
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

####Follow a user
#####_Status: Not Developed, Not Tested
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

####Block a user who is following you
#####_Status: Not Developed, Not Tested
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
