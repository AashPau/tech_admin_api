# login registration workfloe

The workflow below explains how to build robust robust user registration process step by step.

## Step 1

create user and sending email to user for account verification

1. FE : send user form to backend
2. BE : receive user and do the following:
   -- get the passsword and encrypt
   -- create unique code and store it in the session table
   -- format url like `https://yourdomain.com/verify-user?c=iouajdfkas&e=user@gmail.com`
   -- send the above link to user email
3. BE : insert user in the user table
4. BE : respond user saying check their email to verify the account

## Step 2

for user, opening email and following instructions to click the link received.

1. FE : User clicks on the link in their email and redirected to our webpage `https://yourdomain.com/verify-user?c=iouajdfkas&e=user@gmail.com`
2. FE : Within our `verify user` page grab or recive the `c` & `e` from the query string
3. FE : Send the `c` & `e` to the server
4. BE : create new endpoint and recive the `{c, e}`
5. BE : verify `{c, e}` exists in the session tableand validate
   -- delete the data from session table
   -- if valid, update user status to active also `isEmailVerified : true`
   -- then, send email notifying the account has been activated and they can sign now
   -- response the user the same
   -- else, respond : the link is invalid
