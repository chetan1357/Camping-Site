const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id); // we dont have access to the id's so we have to set mergeParams as true
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'SUCCESSFULLY CREATED NEW REVIEW!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // removing the reviewId from the particular campground
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'SUCCESSFULLY DELETED REVIEW!');
    res.redirect(`/campgrounds/${id}`);
}