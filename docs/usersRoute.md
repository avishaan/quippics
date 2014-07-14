
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

- user in {uid} will not be returned (tested)

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
