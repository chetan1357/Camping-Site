const mongoose = require('mongoose');
const Review = require('./review');
const { cloudinary } = require('../cloudinary');
const Schema = mongoose.Schema;

// https://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/r_max/c_scale,w_200/lady.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    // this will refer to the particular image instance
    // to derive something from existing things we use virtuals
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    phone: String,
    rateAvg: Number,
    rateCount: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    booking: {
        start: String,
        end: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.virtual('ratingAvg').get(function () {
    const ratingsArray = [];
    this.reviews.forEach(function (rating) {
        ratingsArray.push(rating.rating);
    });
    if (ratingsArray.length) {
        const totalRating = ratingsArray.reduce((totalRating, currentRating) => {
            return totalRating + currentRating;
        })
        const ratingAvg = totalRating / ratingsArray.length;
        return Math.round(ratingAvg);
    }
    return 0;
})

CampgroundSchema.virtual('ratingCount').get(function () {
    return this.reviews.length;
})

// findByIdAndDelete(id) is a shorthand of findOneAndDelete({_id:id})
// so findByIdAndDelete(id) triggers the following middleware "findOneAndDelete()"

// here campground is the campground which is been deleted
// post method run after the hooked method i.e it runs after the findByIdAndDelete
CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews } });
    }
    if (campground.images) {
        for (let img of campground.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
