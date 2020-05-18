const Apify = require('apify');

const { utils: { log } } = Apify;
const { getReviews, getReviewTags } = require('./general');

function getHours(placeInfo) {
    const placeHolder = [];

    if (!placeInfo.hours) {
        return placeHolder;
    }

    if (!placeInfo.hours.week_ranges) {
        return placeHolder;
    }

    return placeInfo.hours.week_ranges.map(wR => wR.map(day => ({ open: day.open_time, close: day.close_time })));
}


async function processRestaurant(placeInfo, client, dataset) {
    const { location_id: id } = placeInfo;
    let reviews = [];
    if (global.INCLUDE_REVIEWS) {
        try {
            reviews = await getReviews(id, client);
        } catch (e) {
            log.error('Could not get reviews', e);
        }
    }
    if (!placeInfo) {
        return;
    }const place = placeInfo;
    if (global.INCLUDE_REVIEW_TAGS) {
        place.reviewTags = await getReviewTags(id);
    }
    log.debug('Data for restaurant: ', place);

    if (dataset) {
        await dataset.pushData(place);
    } else {
        await Apify.setValue('OUTPUT', JSON.stringify(place), { contentType: 'application/json' });
    }
}

module.exports = {
    processRestaurant,
};
