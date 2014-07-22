
Apple Push Notifications "apn(s)"
----------------------
Routes here are related to the Apple Push Notification service.
Note: these exposed routes are mainly for testing and development purposes. The internal server
will handle challenge and invite requests. The structure of the requests in the debug route will
remain consistent when the server spawns the request.

####Debug a general request
#####_Status: Developed, Not Tested
POST /v1/apns/debug

**Notes:**
- It is **extremely important** to understand that the alert may not be delivered for a significant
  amount of time depending on Apple's load
- A successful http response without err means the message was parsed and accepted
  by Apple. It doesn't mean that the message was successfully delivered nor received by user

Example Request
```
request.body:
{
  uuid: '<a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95>'
};
```
Example Http Response
```
response:
{ 
  clientMsg: 'Attempting',
  err: 'Gateway Error'
}
```
Example iOS Response
```
response:
alert: "Hello Jello!"
```

####Debug a challenge invite request
#####_Status: Developed, Not Tested
POST /v1/apns/challenges/debug

**Notes:**
- A successful http response without err means the message was parsed and accepted
  by Apple. It doesn't mean that the message was successfully delivered nor received by user

Example Request
```
request.body:
{
  uuid: '<a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95>'
};
```
Example Http Response
```
response:
{ 
  clientMsg: 'Attempting',
  err: 'Gateway Error'
}
```
Example iOS Response
```
response:
{ 
  _id: '52fc632f2c769a7503000003',
  title: 'Challenge 1 title',
  type: 'challenge',
  alert: {
    body: 'You were invited to a new challenge',
    action-loc-key: 'accepted challenge!'
  }
}
```

####Debug a submission notifcation request
#####_Status: Not Developed, Not Tested
POST /v1/apns/submissions/debug

**Notes:**
- A successful http response without err means the message was parsed and accepted
  by Apple. It doesn't mean that the message was successfully delivered nor received by user

Example Request
```
request.body:
{
  uuid: '<a591bde2 720d89d4 086beaa8 43f9b061 a18b36b4 8cd0008a 1f347a5a d844be95>'
};
```
Example Http Response
```
response:
{ 
  clientMsg: 'Attempting',
  err: 'Gateway Error'
}
```
Example iOS Response
```
response:
{ 
  _id: '52fc632f2c769a7503000003',
  type: 'submission',
  alert: {
    body: 'There was a new submission!',
    action-loc-key: 'rate submission!'
  }
}
```
