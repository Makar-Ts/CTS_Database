let res_database;


function fetchJSONFile(path, callback) { // thx ChatGPT
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
}

function loadResourcesData(filePath) {
    console.log(window.location);
    $("#url_container").attr("href", window.location.origin+window.location.pathname);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            res_database = data;
            console.log(res_database);
        }
    });
};

function calculate_cost_recursion (id, count, cost) {
    if (res_database[id].primary) {
        if (cost.has(id)) {
            cost.set(id, cost.get(id) + count);
        } else {
            cost.set(id, count);
        }
        return;
    } else {
        var components = res_database[id].craft;

        for (let key of Object.keys(components)) {
            calculate_cost_recursion(key, count * components[key], cost);
        }

        return;
    }
}

function calculateCost(resources) {
    var cost = new Map();

    for (let key of Object.keys(resources)) {
        calculate_cost_recursion(key, resources[key], cost);
    }

    console.log(cost);
    return cost;
}

function convertNamesToIds(names) {
    var ids = {};

    for (let key of Object.keys(names)) {
        id = "";

        for (let key_res of Object.keys(res_database)) {
            if (key.includes(res_database[key_res].names[0])) {
                id = key_res;
                break;
            }
        }

        if (id != "") {
            ids[id] = names[key];
        }
    };

    return ids;
}

function convertIdToName(id) {
    return res_database[id].names[0];
}