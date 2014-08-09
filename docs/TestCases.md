Test Cases
----------------------------------------
The following will outline the test plan at a high level. Since this test plan
is being written well into development, only test plans added at this point forward
will be included in this document under the appropriate header. The point of this
document is to come up with highlevel test plans that cover any logic that the app
will be responsible for. Any trivial test cases should be avoided, focus on business
logic that is specific to the requirements documents.

####Activities
#####Friend Activities
1. User should see activities of his friends who are in challenges with him. (tested)  
(share challenge, share friend, then show activity)
2. User should NOT see activities of his friends who are in other challenges. (tested)  
(don't share challenge, share friend, hide activity)
3. User should see activities of his friends who are in challenges where user is the owner. (tested)  
(share challenge, share friend(as owner), then show activity)
4. User should NOT see activities of other users (not his friends) who are in his challenge. (tested)  
(share challenge, don't share friend, hide activity)
5. User should not see activities of other non-friend users who are not in his challenge. (tested)  
(don't share challenge, don't share friends, hide activity)
