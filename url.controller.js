//import Url model
const Url = require('./url.model.js');
const db = require('./db.js');

//This is basically your domain name
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';


const createShortLink = async (req, res) => {
    //get the originalUrl and unique_name from the request's body
    let {originalUrl, unique_name} = req.body;

    try {
        //check if unique_name alredy exists
        let nameExists = await Url.findOne({unique_name});
        /** if unique_name already exists, send a response with an
         error message, else save the new unique_name and originalUrl */
        if (nameExists) {
            return res.status(403).json({
                error: "Unique name already exists, choose another",
                ok: false
            })
        } else {
            const shortUrl = baseUrl + '/' + unique_name;
            url = new Url({
                originalUrl,
                shortUrl,
                unique_name
            });
            //save
            const saved = await url.save();
            //return success message shortUrl
            return res.json({
                message: 'success',
                ok: true,
                shortUrl
            });
        }
    } catch (error) {
        ///catch any error, and return server error
        return res.status(500).json({ok: false, error: 'Server error'});
    }
};


const openShortLink = async (req, res) => {
    //get the unique name from the req params (e.g olamide from shorten.me/olamide)
    const {unique_name} = req.params;

    try {
        //find the Url model that has that unique_name
        let url = await Url.findOne({unique_name});

        if (url) {
            var d = new Date(Date.now());
            const diffTime = Math.abs((Date.now() - url.dateCreated) / (1000 * 60 * 60));
            // console.log(url.dateCreated);
            // console.log(Date.now())
            console.log(diffTime);
            if (diffTime > 24.0) {
                Url.deleteMany({unique_name: unique_name}).then(function () {
                    //console.log("Data deleted"); // Success
                    return res.send('Error - The page is expired');
                }).catch(function (error) {
                    console.log(error); // Failure
                });
            } else {
                return res.redirect(url.originalUrl);
            }
        } else {
            return res.send('Error 404 - Page Not found');
        }
    } catch (err) {
        //catch any error, and return server error to user
        //console.log(err);
        res.status(500).json({error: 'Server error'});
    }
};

const deleteShortLink = async (req, res) => {
    let {unique_name} = req.body;
    try {
        let url = await Url.findOne({unique_name});
        if (url) {
            Url.deleteMany({unique_name: unique_name}).then(function () {
                //console.log("Data deleted"); // Success
                return res.json({
                    message: 'success',
                    ok: true
                });
            }).catch(function (error) {
                console.log(error); // Failure
            });
        } else {
            return res.status(404).json({error: 'Sorry, Not found'});
        }
    } catch (err) {
        //catch any error, and return server error to user
        console.log(err);
        res.status(500).json({error: 'Server error'});
    }

};

const retrieveOriginalURL = async (req, res) => {
    let {originalUrl} = req.body;
    // const { unique_name } = req.params;

    try {
        let url = await Url.findOne({originalUrl});
        if (url) {
            //return res.redirect(url.originalUrl);
            return res.json({
                message: 'success',
                ok: true,
                url
            });
        } else {
            return res.status(404).json({error: 'Sorry, Not found'});
        }
    } catch (err) {
        //catch any error, and return server error to user
        console.log(err);
        res.status(500).json({error: 'Server error'});
    }
};


module.exports = {
    createShortLink, openShortLink, deleteShortLink, retrieveOriginalURL
}