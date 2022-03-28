# YelpCamp
Yelpcamp is a website where a user can create and review the campgrounds.In order to create or review any campground you must have an account.

This project was created using Node.js, Express, Mongoose, MongoDB and Bootstrap.

Passport.js was used to handle authentication.

# Features
- Users can create an account.
- Users can create, edit and delete campgrounds.
- Users can post reviews on campgrounds.
- Users can search campground by name.
- Users can sort the campgrounds by highest rating, most reviewed, highest price or lowest price.

# Run it locally

1. Install <a href="https://www.mongodb.com/">mongodb</a>
2. Create an cloudinary account to make your API key and secret code.
3. Run the below command to install all the necessary packages.

<code>npm install</code>

Create a .env file in the root directory of your project and do the following

CLOUDINARY_CLOUD_NAME= 'name'
  
CLOUDINARY_KEY='key'
  
CLOUDINARY_SECRET='secret'

Run the <code> node app.js </code> in the terminal of project.

Then go to <a href="https://localhost:3000">localhost:3000</a>
