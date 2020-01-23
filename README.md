# Social Suite

Social Suite is an open source alternative to HootSuite and similar services.

# Status: Unfinished
I have too much going on in my life right now, so I've decided to let this project go. Perhaps someone will find it useful.

**Where did I leave off?**
Twitter should work just fine for the unit tests, but I didn't get around to extracting the access tokens from the `accounts` table to use that to send a tweet.

As for Linkedin, it has the same situation, but you'll need to catch the author's `urn` in the PassportJS callback to store it for use. It's in the `profile` variable, but I just never extracted that for use. (See "[Create a Text Share](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin?context=linkedin/consumer/context#create-a-text-share)" in the Linkedin docs to see why that's necessary.) You'll also want to finish out the driver to post to the endpoint. Linkedin doesn't have any unit tests for the driver.

### What can it do?

* Post on your Twitter feed
* Post on your Linkedin feed

### No Facebook?

Nope! Why? It's because Facebook makes their platform far too convoluted with far to much bureaucracy involved to just simply post to a page. Wow... just wow... For the record, the integration was almost complete before I pulled it along with Instagram for the same reason.

[![Ain't nobody got time for dat!](https://img.youtube.com/vi/waEC-8GFTP4/0.jpg)](https://www.youtube.com/watch?v=waEC-8GFTP4)
**Ain't nobody got time for dat!**

If you'd like to waste at least an entire week on verification processes to have page posting access, feel free to write your own FB integration for Social Suite. After all, that's why it's open source!

### Why should I use it instead of throwing loads of money at HootSuite?

Why would you want to throw all of your money away when you can use an open source solution? If something doesn't work the way you'd like, then you can simply modify it and make it do what you want. Plus, there's no monthly subscription and you fully control how the software works with your information.

### Alright, I'm interested. Where can I host it?

The most simple solution is to use [Heroku](https://www.heroku.com/pricing) as the hosting provider. The free plan should work, but keep in mind that the free plan doesn't allow for HTTPS, so once you're done testing it out, you may consider upgrading as you see fit.

As for MongoDB, MongoDB provides a free database service through their Atlas program. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/general/try) is hosted through AWS.

## Cool. I have my Heroku and MongoDB accounts now. How do I install everything?

**A Word on configuration...**  Clone this repository locally on your computer using Git. You'll now have a `/config` directory where you cloned the program. Open that up and you'll find `sample.env`. Copy that file to `dev.env` if you'd like to do any development work. Also copy it to `test.env` if you plan to run the unit tests. Heroku manages your production.env, so it never will appear in `/config`. You can use [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) to push your environment variables, or use the Heroku website to set that up after you create a new Heroku project. To better understand each variable in the .env files, see the breakout below.

**Step By Step Instructions**

* Log into Heroku and create a new project there. Open that project on your dashboard and click the "Settings" tab.
* Using the `/config/sample.env` file as a guide, as well as the list of ".env Configuration Options" below, add each one into the "Config Vars" section on your Heroku settings. (This part may take a while, as you'll need to create an app on each social network.)
* Now you have several options to deploy your program to Heroku. See the "Deploy" tab on your Heroku project.
* (Optional) If you'd like to use a custom domain, you can set that up on the "Settings" tab for your Heroku project.

If all went well, your bright, shiny new Social Suite installation is up and running! Check it out. Just register your account on there and start using it.

**Want to hide your Social Suite from prying eyes?**
If you don't want anyone to know it exists, a quick and dirty way to prevent most people from finding it is to never tell anyone it exists, and use the default Heroku domain. Don't link to it from anywhere search engines can find it either, and you'll be all set.

## Front End Options

Social Suite is designed to make it easy for anyone who prefers working with a particular front end, to use that particular frontend. This repository only contains the code for the back end, but by default it's `package.json` file is configured to use the Angular framework for the frontend, complete with NGRX and more. As this project grows, it'll have more frontend options. Be sure to set `APP_FRONTEND` to the appropriate frontend if you install a different frontend!

* [Angular Front End](https://github.com/rickmacgillis/social-suite-angular) - This is the default front end. (`APP_FRONTEND="angular"`)

## .env Configuration Options

`PORT` - This variable must ONLY exist in your .env files in `/config` and not get added to the Heroku interface! It gets set to the port number your app will run on. Heroku sets this port for you automatically, but in your local environment, you must set it.

`APP_ENV` - This variable denotes the environment that you're using to run your app. For `dev.env` set it to `dev` and for `test.env` you'll set it to `test`. Your `package.json` file has a `scripts` section which has items that use these .env files, and that's how Social Suite knows in which environment it's running. Production should have it set to `prod`.

`APP_URL` - This is the URL where you plan to access your site in a browser. If you're changing your frontend or building a new one, you can set an entirely different URL here than where your API server is running. Don't worry; in `dev` the script enables a wildcard CORS policy so you can talk to your API server on a different port or domain. The CORS policy doesn't get applied in `test` or in `prod`. In production mode, set `APP_URL` to whatever the URL is that you gave Heroku to use. (Ex. `http://social-suite.example.com`)

`API_URL` - This is the URL for your Node.js API. It should end with `/api/v1` without the trailing `/`. This may use the same domain and optional port as the `APP_URL`, but it can also be entirely different outside of production. In production, the `APP_URL` and `API_URL` must use the same domain. (Ex. `http://social-suite.example.com/api/v1`)

`APP_FRONTEND` - By default, Social-Suite uses Angular for its frontend, but as the project grows, more frontends will appear and you can set it here. `angular` is the default value for this variable.

`MONGODB_URL` - This URL is the connection string for your MongoDB installation. In `dev` it might be something like `mongodb://127.0.0.1:27017/social-suite`, and in test it might be `mongodb://127.0.0.1:27017/social-suite-test`. For production, you'll want to make sure you have credentials set up on your DB, so it might look like `mongodb+srv://myuser:mypass@clusterinfo.mongodb.net/social-suite?configvar=configval`. If you're using Atlas, then it should give you the string to use.

`MONGOOSE_ENCRYPTION_KEY` - To keep your access tokens safe in your database, Social Suite uses two-way encryption. The system needs to know the keys to send requests to the service providers, so they get encrypted using `AES-256-CBC` using [Mongoose Field Encryption](https://github.com/wheresvic/mongoose-field-encryption). I reccommend using a strong password generator to generate a key for use. (Ex. [LastPass](https://lastpass.com/))

`SESSION_SECRET` - [PassportJS](http://www.passportjs.org/) uses [Express Session](https://www.npmjs.com/package/express-session) to manage its sessions. Set this value to a strong randomly-generated string.

`JWT_SECRET` - Same principle. Just generate a strong random string. All of your secrets should be different.

`MAIL_DRIVER` - Set this to the name of a driver in `/src/emails/drivers`. Currently only the `sendgrid` driver is available.

`MAIL_FROM` - What's the email address where system-generated emails should come from?

**The following keys are used for connecting to various social networks. You'll need to create an app for each rovider in order to get these keys.**

*[Create a Twitter app](https://developer.twitter.com/en/apps) before preceding. Also be sure to set your Redirect URL for your app!*
`TWITTER_CONSUMER_KEY` - This is your "API Key" listed on the "Keys and tokens" tab of your Twitter app's page.
`TWITTER_CONSUMER_SECRET` - This is your "API secret key" listed on the "Keys and tokens" tab of your Twitter app's page.
`TWITTER_ACCESS_TOKEN_KEY` - This key is used by the unit tests. It does post to your account if you enable the tests that send requests to Twitter. If you don't plan on testing these, you can leave it blank. If you'd like to use it, set it to the "Access token" listed on the "Keys and tokens" tab of your Twitter app's page.
`TWITTER_ACCESS_TOKEN_SECRET` - Same premise as with `TWITTER_ACCESS_TOKEN_KEY` - if you want to use it, it's on the same page.

*[Create a Linkedin app](https://www.linkedin.com/developers/apps/) before preceding. Also be sure to set your Redirect URL for your app!*
`LINKEDIN_CONSUMER_ID` - This is the "Client ID" located on the "Auth" tab for your Linkedin app.
`LINKEDIN_CONSUMER_SECRET` - This is the "Client Secret" located on the "Auth" tab for your Linkedin app.
`LINKEDIN_ACCESS_TOKEN` - If you plan to run the unit tests, you'll need to supply an access token.
