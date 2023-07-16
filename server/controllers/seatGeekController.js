const { seatgeek } = require('../models/secrets.js');

const seatGeekController = {};

//add this to end of any request url
// `?client_id=${seatgeek.client_id}&client_secret=${seatgeek.client_secret}`

//get request to SeatGeek based on user artist preferences
seatGeekController.getArtistEvents = async (req, res, next) => {
  try {
    const eventsArray = [];
    const artists = res.locals.userInfo.artists;
    const city = res.locals.userInfo.location.city;
    // const artists = ['clutch', 'drake'];
    // const city = 'Denver';

    //generating constants for todays date and date three months from now in API format
    const date = new Date();
    const today = date.toJSON().slice(0, 10);
    const threeMonths = new Date(date.setMonth(date.getMonth() + 3))
      .toJSON()
      .slice(0, 10);

    //itterating through each artist in array and fetching Event data
    for (i = 0; i < artists.length; i++) {
      /*fetch to seatgeek API 
      query based on City, Artist, and date range of 3 Months
      */
      const response = await fetch(
        `https://api.seatgeek.com/2/events/?client_id=${seatgeek.client_id}&client_secret=${seatgeek.client_secret}&performers.slug=${artists[i]}&venue.city=${city}&datetime_utc.gte=${today}&datetime_utc.lte=${threeMonths}`
      );
      const { events } = await response.json();
      //making a separate object for each event returned back for an artist
      events.forEach((el) => {
        const event = {
          artist: el.performers[0].name,
          genre: el.performers[0].genres[1].name,
          price: el.stats.lowest_price,
          date: el.datetime_local,
          venue: el.venue.name,
          eventUrl: el.url,
          imgUrl: el.performers[0].image,
        };
        eventsArray.push(event);
      });
    }
    //attaching Array of objects to send as response to front end
    res.locals.artistEvents = eventsArray;
    return next();
  } catch (err) {
    return next({
      log: `seatGeekController.getEvents ERROR: trouble fetching seatgeek artist events`,
      message: {
        err: `seatGeekController.getEvents: ERROR: ${err}`,
      },
    });
  }
};

module.exports = seatGeekController;
