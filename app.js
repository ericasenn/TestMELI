var app = require('express')();
var axios = require('axios');

const URL_SEARCH = 'https://api.mercadolibre.com/sites/MLA/search';
const URL_ITEM = 'https://api.mercadolibre.com/items/';
const DESCRIPTION = '/description';

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

function buildItem(itemResponse, descriptionResponse) {
    return {
        "id": itemResponse.id,
        "title": itemResponse.title,
        "price": {
            "currency": itemResponse.currency_id,
            "amount": itemResponse.price,
            "decimals": 2
        },
        "picture": itemResponse.thumbnail,
        "condition": itemResponse.condition,
        "free_shipping": itemResponse.shipping.free_shipping,
        "sold_quantity": itemResponse.sold_quantity,
        "description": descriptionResponse.plain_text
    };
}

function buildSearchResults(responseData) {
    return {
        "author": buildAuthor(),
        "categories": getCategories(responseData.filters),
        "items": getItems(responseData.results)
    };
}

function getSearchPromise(query) {
    return axios.get(URL_SEARCH, {
        params: {
            q: query,
            limit: 4
        }
    });
}

function getItemPromise(id) {
    return axios.get(URL_ITEM, {
        params: {
            id: id
        }
    });
}

function getItemDescriptionPromise(id) {
    return axios.get(URL_ITEM + id + DESCRIPTION)
}

app.get('/api/items', function (req, res) {
    getSearchPromise(req.query.q)
    .then(function (response) {
        const responseJSON = buildSearchResults(response.data);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(responseJSON);
    })
    .catch(function (error) {
        return Promise.reject(error);
    });
});

app.get('/api/items/:id', function (req, res) {
    axios.all([
        getItemPromise(req.params.id),
        getItemDescriptionPromise(req.params.id)])
    .then(function (responses) {
        var itemResponse = responses[0];
        var descriptionResponse = responses[1];
        var responseJSON = buildItem(itemResponse.data, descriptionResponse.data);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(responseJSON);
    })
    .catch(function (error) {
        return Promise.reject(error);
    });
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    host = (host === '::' ? 'localhost' : host);
    var port = server.address().port;

    console.log('listening at http://%s:%s', host, port);
});