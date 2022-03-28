const Campground = require('../models/campground.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN; // storing our env variable
const geocoder = mbxGeocoding({ accessToken: mbxToken }); // this has two methods forwardGeocode and reverseGeocode
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    let noResult = null;
    if (req.query.search) {
        // regex will search a pattern string
        // -1 sorts in descending
        // 1 sorts in ascending
        const campgrounds = await Campground.find({ title: { $regex: req.query.search } }).populate('reviews');
        if (campgrounds.length === 0) {
            noResult = req.query.search;
        }
        res.render('campgrounds/index', { campgrounds, noResult });
    }
    else if (req.query.sortby === 'rateAvg') {
        await Campground.find({})
            .sort({ rateAvg: -1, rateCount: -1 })
            .populate('reviews')
            .exec((err, campgrounds) => {
                res.render('campgrounds/index', { campgrounds, noResult });
            });
    }
    else if (req.query.sortby === 'rateCount') {
        await Campground.find({})
            .sort({ rateCount: -1 })
            .populate('reviews')
            .exec((err, campgrounds) => {
                res.render('campgrounds/index', { campgrounds, noResult });
            })
    }
    else if (req.query.sortby === 'priceLow') {
        await Campground.find({})
            .sort({ price: 1 })
            .populate('reviews')
            .exec((err, campgrounds) => {
                res.render('campgrounds/index', { campgrounds, noResult });
            })
    }
    else if (req.query.sortby === 'priceHigh') {
        await Campground.find({})
            .sort({ price: -1 })
            .populate('reviews')
            .exec((err, campgrounds) => {
                res.render('campgrounds/index', { campgrounds, noResult });
            })
    }
    else {
        const campgrounds = await Campground.find({}).populate('reviews');
        res.render('campgrounds/index', { campgrounds, noResult });
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; // this return coordinates in [longitude,latitude] format
    campground.images = req.files.map((f) => {
        return { url: f.path, filename: f.filename }
    });
    campground.author = req.user._id; // req.user will give us the current user
    await campground.save();
    req.flash('success', 'SUCCESSFULLY MADE A NEW CAMPGROUND!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews', // this review is for a camground
            populate: {
                path: 'author' // this author is for the review
            }
        })
        .populate('author'); // this author is for campground
    campground.rateAvg = campground.ratingAvg;
    campground.rateCount = campground.ratingCount;
    await campground.save();
    if (!campground) {
        req.flash('error', 'CAMPGROUND NOT FOUND');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'CAMPGROUND NOT FOUND');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map((f) => {
        return { url: f.path, filename: f.filename }
    });
    campground.images.push(...imgs);
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    // bcz we have already found that camp so no need to find it again
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename); // deleting the images from cloud
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }); // deleting the images from mongo
    }
    req.flash('success', 'SUCCESSFULLY UPDATED CAMPGROUND!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'SUCCESSFULLY DELETED CAMPGROUND!');
    res.redirect('/campgrounds');
}