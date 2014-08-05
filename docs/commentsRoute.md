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
#####_Status: Developed, Tested
GET /v1/challenges/:cid/submissions/:sid/comments/:comid

Example Response
```
response.body: {
  comment: 'This is a comment by nerdy',
  commenter: '53d8749e481552d072bc979d',
  _id: '53d8749e481552d072bc97a9',
  modelType: 'Comment',
  date: '2014-07-30T04:29:18.450Z' }
```
