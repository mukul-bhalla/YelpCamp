const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Mongo Connection Open !!")
    })
    .catch((err) => {
        console.log("Oh no Mongo Error");
        console.log(err);
    })

const sample = (array1, array2) => {
    const random18 = Math.floor(Math.random() * 18);
    const random182 = Math.floor(Math.random() * 18);
    return `${array1[random18]} ${array2[random182]}`

}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20) + 10;
        const camps = new Campground({
            title: sample(places, descriptors),
            location: `${cities[random1000].city},${cities[random1000].state}`,
            // image: 'htunstp://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, doloribus rem. Eos sunt odit laborum deserunt expedita quasi obcaecati incidunt odio, exercitationem numquam optio dicta. Consectetur iusto minus atque ipsa.',
            price: randomPrice,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            author: '64b3bdacc9201e9f999896ab',
            images: [
                {
                    url: 'https://res.cloudinary.com/ddhks1nqp/image/upload/v1689743585/YelpCamp/vkr8bw5hicjrgf4c6jwf.jpg',
                    filename: 'YelpCamp/vkr8bw5hicjrgf4c6jwf',
                },
                {
                    url: 'https://res.cloudinary.com/ddhks1nqp/image/upload/v1689743746/YelpCamp/hqzawaqqynrmzdoc2hab.jpg',
                    filename: 'YelpCamp/hqzawaqqynrmzdoc2hab',

                }
            ]

        })
        await camps.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })
    .catch(e => {
        console.log("Error closing db")
    })
