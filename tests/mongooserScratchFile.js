Challenge.aggregate(
[
  {$match: {privacy: 'private'}},
  {$project: {bigTitle: {$toUpper: '$title'}, _id:0}}
],
function(err, results){
  console.log(results);
});

Challenge.aggregate(
[
  {$unwind: '$participants'}
],
function(err, results){
  console.log(results);
});

Challenge.aggregate(
[
  {$match: {privacy: 'private'}},
  {$project:{title:1, participants:1}},
  {$unwind: '$participants'},
  {
    $group: {
      _id: '$_id',
      numParticipants: {$sum: 1}
    }
  }
],
function(err, results){
  console.log(results);
});

  Challenge.find({}, {participants: {$elemMatch: {user: '53a54d8fef9e460000c98d66'}}}).select('_id owner title createdOn expiration participants invites').exec(p);
