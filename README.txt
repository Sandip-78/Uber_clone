npm init -y
npm i epxress
create server in app.js and and start into server.js
for envirnomental variable set up use dotenv and also set up the cors
npm i dotenv cors
create .env file for envirnomental variable
make .gitignore file out of folder and add .env and node_moulde before the git commit
now time to connect to db and make model for it
npm i mongoose bcrypt jsonwebtoken

now create a route in route folder for user api
for frontend user data validation we use package express-validator, use in route folder for validate user inforamtion 

we can read the token from both cookie and header 
for using cookie we used to set token to user when it logins and 
for header we use token like key is Auhtoriztion and value is bearer <token> which we get while login

🔐 Problem with JWT (in one line)

When you log out, the JWT token does NOT automatically stop working.

🧠 What is a Blacklist? (Very simple)

A blacklist is just a list of tokens that are NOT allowed anymore.

Think of it like this:

❌ “This token is cancelled. Don’t accept it.”

🚪 What happens when user logs out?

User clicks Logout

Server:

Removes token from browser (cookie)

Saves the token in blacklist database

Token is now blocked

Even if someone tries to reuse it → ❌ access denied

🛡️ What happens on every request?

Before allowing access:

Server checks:

“Is this token in blacklist?”

If YES → ❌ Unauthorized

If NO → ✅ Continue

⏱ Why expires: 86400?

Token is valid for 1 day

Blacklist entry auto-deletes after 1 day

Database stays clean

👉 MongoDB does this automatically

🧾 In short (one sentence)

Blacklist = a way to immediately block JWT tokens after logout

🧠 Easy example
Situation	Result
Login	Token allowed
Logout	Token saved in blacklist
Use token again	❌ Blocked
Token expires	Blacklist entry removed
