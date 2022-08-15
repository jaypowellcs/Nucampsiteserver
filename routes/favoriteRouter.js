const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate("user")
    .populate("campsites")
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites: req.body })
            .then(favorite => {
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        if ( favorite ) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite); 
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200; 
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite);
                })
                .catch(err => next(err))
            } else {
                Favorite.create({user: req.user._id, campsite: [req.params.campsiteId]})
                .then(favorite => {
                    res.statusCode = 200; 
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err))
            }
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   Favorite.findOne({user: req.user._id})
   .then(favorite => {
    if (favorite) {
        if (favorite.campsites.indexOf(req.params.favoriteId !== 1)) {
            favorite.campsites.splice(favorite.campsites.indexOf(req.params.favoriteId), 1)
            .then(favorite => {
                favorite.save()
                res.statusCode = 200; 
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err))
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.send('You do not have any favorites to delete.')
        } 
        }
   })
});

module.exports = favoriteRouter;
