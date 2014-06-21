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
      _id: null,
      numParticipants: {$sum: 1}
    }
  }
],
function(err, results){
  console.log(results);
});
