const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Database Connected");
    })
    .catch(err => {
        console.log('Connection Error');
        console.log(err);
    });

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6216447a1ab137205be360c8',
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum impedit, odio distinctio modi consequuntur facilis enim. Inventore cumque, accusamus labore optio iure velit esse quidem recusandae explicabo officiis maiores nemo',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    // longitude must be first and then latitude
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddahyayox/image/upload/v1645983053/YelpCamp/vflaouqut8wlrfyxtijm.jpg',
                    filename: 'YelpCamp/nhrercrkbgvmfgd6iys6',
                },
                {
                    url: 'https://res.cloudinary.com/ddahyayox/image/upload/v1645983397/YelpCamp/krxtibmbdjixilr7asif.jpg',
                    filename: 'YelpCamp/dv5lzdjqbq4nhxehewuc',
                },
                {
                    url: 'https://res.cloudinary.com/ddahyayox/image/upload/v1645983053/YelpCamp/qkzzog3y3faqc5ivalmf.jpg',
                    filename: 'YelpCamp/gofydu0fzrkwpz6rdgzy',
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => mongoose.connection.close());
