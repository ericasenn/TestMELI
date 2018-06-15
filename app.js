var app = require('express')();
var axios = require('axios');
const URL_SEARCH = 'https://api.mercadolibre.com/sites/MLA/search';

app.get('/api/items', function (req, res) {
    axios.get(URL_SEARCH, {
        params: {
            q: req.query.q,
            limit: 4
        }
    })
    .then(function (response) {
        const responseJSON = buildSearchResults(response.data);
        res.send(responseJSON);
    })
    .catch(function (error) {
        return Promise.reject(error);
    });
});

function buildAuthor() {
    return {
        "name": 'Erica Gretel',
        "lastname": 'Senn'
    }
}

function getCategories(filters) {
    var categories = [];
    const categoryFilters = filters.filter(function(filter) {
        return filter.id == "category"
    });

    if(categoryFilters.length > 0) {
        categoryFilters.forEach(function(filter) {
            filter.values.forEach( function (category) {
                var category = category.path_from_root.map(function(category) { return category.name });
                categories.push(category);
            })
        });
    }

    return categories;
}

function getItems(results) {
    return results.map( function(result) {
        return {
            "id": result.id,
            "title": result.title,
            "price": {
                "currency": result.currency_id,
                "amount": result.price,
                "decimals": 2
            },
            "picture": result.thumbnail,
            "condition": result.condition,
            "free_shipping": result.shipping.free_shipping
        };
    });
}

function buildSearchResults(responseData) {
    return {
        "author": buildAuthor(),
        "categories": getCategories(responseData.filters),
        "items": getItems(responseData.results)
    };
}

var server = app.listen(3000, function () {
    var host = server.address().address;
    host = (host === '::' ? 'localhost' : host);
    var port = server.address().port;

    console.log('listening at http://%s:%s', host, port);
});