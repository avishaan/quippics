
User
----------------------
Routes here are related to user registrations, login, etc

####Register a new user
#####_Status: Developed, Tested
POST /v1/register

- User who registers with existing username receives 500 response (tested)
- User who registers with existing username different case receives 500 response (tested)

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
POST /v1/users/:uid

- User can change their profile picture
- User can change their password (tested)
- User can change their username (tested)

Example Request (multipart with images)
```
{
  username: 'jack1985',
  password: 'password',
  newPassword(opt): 'passwordupdate',
  newUsername(opt): 'usernameupdate'
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

####Register the user's device
#####_Status: Developed, Tested
POST /v1/users/:uid/device

- Expecting value in seconds from UTC epoch
- Device tokens remain unique, server will prevent two users from having same token

Example Request
```
request: {
  uuid: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95',
  tokenTimestamp: '1406168673694'
}
```

Example Response
```
response: {
  clientMsg: 'Successfully registered device'
}
```

####Logout user and return if success
#####_Status: Developed, Tested
DELETE /v1/users

- Must wait for ok response before finishing logout of user

Example Request
```
request: {
  id: '52f548514f8c88b137000113',
  uuid: 'a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95'
}
```

Example Response
```
response: {
  _id: '52f548514f8c88b137000113'
}
```

####Send password reset email
#####_Status: Developed, Tested
POST /v1/users/password

- For security, the user must provide email and username

Example Request
```
request: {
  username: 'username'
  email: 'email@email.com'
}
```

Example Response
```
response: {
  clientMsg: 'Password reset sent to email'
}

```
####Authenticate user and return userid
#####_Status: Developed, Tested
POST /v1/users

- Login with incorrect password returns 401 reponse (tested)
- Username is case insensitive during login (tested)

Example Request
```
request: {
  username: 'jill1987',
  password: 'password',
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
  friendStatus: true,
  _id: 52e73b76ca1c1f8202000008,
  thumbnail: {data: 0ad0fdsaf0dadfdffea0} 
},
{
  username: 'jack1985',
  friendStatus: false,
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
