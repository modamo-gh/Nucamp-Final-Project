const express = require("express");
const cors = require("./cors.js");
const authenticate = require("../authenticate.js");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(
        cors.cors,
        authenticate.verifyUser,
        (req, res, next) => {
            Favorite
                .find({ user: req.user._id })
                .populate("user")
                .populate("campsites")
                .then(favorites => {
                    res.setHeader("Content-Type", "application/json");
                    res.statusCode = 200;
                    res.json(favorites);
                })
                .catch(err => next(err));
        })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
            Favorite
                .findOne({ user: req.user._id })
                .then(favorite => {
                    if (favorite) {
                        req.body.forEach(fav => {
                            if (!favorite.campsites.includes(fav._id)) {
                                favorite.campsites.push(fav._id);
                            }
                        });

                        favorite
                            .save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    } else {
                        Favorite
                            .create({ user: req.user._id })
                            .then(favorite => {
                                req.body.forEach(fav => {
                                    if (!favorite.campsites.includes(fav._id)) {
                                        favorite.campsites.push(fav._id);
                                    }
                                });

                                favorite
                                    .save()
                                    .then(favorite => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite);
                                    })
                                    .catch(err => next(err));

                            })
                            .catch(err => next(err));
                    }
                })
                .catch(err => next(err));
        })
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res) => {
            res.statusCode = 403;
            res.end("PUT operation not supported on /favorites")
        })
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
            Favorite
                .findOneAndDelete({ user: req.user._id })
                .then(favorites => {
                    res.statusCode = 200;

                    if (favorites) {
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    }
                    else {
                        res.setHeader("Content-Type", "text/plain");
                        res.end("You do not have any favorites to delete");
                    }
                })
                .catch(err => next(err));
        });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(
        cors.cors,
        authenticate.verifyUser,
        (req, res) => {
            res.statusCode = 403;
            res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
        }
    )
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
            Favorite
                .findOne({ user: req.user._id })
                .then(favorites => {
                    if (favorites) {
                        if (!favorites.campsites.includes(req.params.campsiteId)) {
                            favorites.campsites.push(req.params.campsiteId);

                            favorites
                                .save()
                                .then(fav => {
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(fav)
                                })
                                .catch(err => next(err));
                        }
                        else {
                            res.statusCode = 200;
                            res.end("That campsite is already in the list of favorites!")
                        }
                    }
                    else {
                        Favorite
                            .create({ user: req.user._id })
                            .then(favorite => {
                                favorite.campsites.push(req.params.campsiteId);

                                favorite
                                    .save()
                                    .then(fav => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(fav);
                                    })
                                    .catch(err => next(err));
                            })
                            .catch(err => next(err));
                    }
                })
                .catch(err => next(err));
        })
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res) => {
            res.statusCode = 403;
            res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
        })
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
            Favorite
                .findOne({ user: req.user._id })
                .then(favoriteDoc => {
                    if (favoriteDoc) {
                        const noLongerFavoriteIndex = favoriteDoc.campsites.indexOf(req.params.campsiteId);
                        favoriteDoc.campsites.splice(noLongerFavoriteIndex, 1);

                        favoriteDoc
                            .save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorite);
                            })
                            .catch(err => next(err));

                    } else {
                        res.setHeader("Content-Type", "text/plain");
                        res.end("There are no favorites to delete");
                    }
                })
                .catch(err => next(err));
        });

module.exports = favoriteRouter;