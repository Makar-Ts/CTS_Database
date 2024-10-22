const filePath = "./database.json";
const fileImgPath = "./imgPaths.json";
const fileResourcesPath = "./resources.json";
var database, img_database;
var database_loaded = false, img_database_loaded = false;
detectColorScheme();

var ammo_stats_titles = {
    "fuse_sensitive": ["Fuse Sensitive", "mm"],
    "fuse_delay": ["Fuse Delay", "m"],
    "explosive_mass": ["Explosive Mass", ""],
    "fuse_radius": ["Fuse Radius", "m"],
    "arming_distance": ["Arming Distance", "m"],
    "range": ["Range", "km"]
};


$("#item_container").hide();

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

$(document).ready(function() {
    
    loadResourcesData(fileResourcesPath)

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            database = data;

            console.log(data.hulls["TKS"]);

            database_loaded = true;

            if (database_loaded & img_database_loaded) whenDatabasesLoaded();
        }
    });

    fetchJSONFile(fileImgPath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            img_database = data;

            console.log(data.hulls["TKS"]);

            img_database_loaded = true;

            if (database_loaded & img_database_loaded) whenDatabasesLoaded();
        }
    });

    $('#search_input').bind('input', function (e) {
        $("#search_results").show();
        var search_for = $('#search_input').val().toLowerCase().replace("-", "").replace(" ", "");
        var greek_search_for = replaceGreekNumerals($('#search_input').val()).toLowerCase().replace("-", "").replace(" ", "");
        
        str = ""

        count = 12;
        for (let key of Object.keys(database.hulls)) {
            var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
            var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                str += `<tr class="search_result_item" data-item="${key.replace(/\"/g, "&quot;")}" data-type="hulls"><td>Hull: &nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 12;
        for (let key of Object.keys(database.turrets)) {
            var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
            var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                str += `<tr class="search_result_item" data-item="${key.replace(/\"/g, "&quot;")}" data-type="turrets"><td>Turret: ${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 12;
        for (let key of Object.keys(database.guns)) {
            var greek_search_key = replaceGreekNumerals(key).toLowerCase().replace("-", "").replace(" ", "")
            var orig_search_key = key.toLowerCase().replace("-", "").replace(" ", "")

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                str += `<tr class="search_result_item" data-item="${key.replace(/\"/g, "{quot")}" data-type="guns"><td>Gun: &nbsp;&nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        $('#search_results').html(str);
    });

    $(document).on('click', '.search_result_item', function() {
        var hull = $(this).data("item");
        var type = $(this).data("type");
        var data = database[type][hull];

        setSearchOutput(hull, type, data, database.secondaries[hull+"-"+capitalizeFirstLetter(type.substring(0, type.length - 1))]);
    }); 

    $('#item_img').on('load', function() {
        $("#item_img_container").text("")
        $('#item_img').css('display', 'block');
        console.log('loaded');
    }).attr('src', imgUrl);
})

$("#show_calculated_resources").click(function() {
    $("#resources_calculated").toggle();
    $("#resources").toggle();
});

function whenDatabasesLoaded() {
    const urlParams = new URLSearchParams(window.location.search);

    console.log(urlParams.get("name") + " | " + urlParams.get("type"));
    if (urlParams.get("type") != undefined && urlParams.get("name") != undefined) {
        setSearchOutput(urlParams.get("name"), urlParams.get("type"), database[urlParams.get("type")][urlParams.get("name")], database.secondaries[urlParams.get("name")+"-"+capitalizeFirstLetter(urlParams.get("type").substring(0, urlParams.get("type").length - 1))]);
    }
}

$(document).on('click', '.resource_item', function() {
    if ($(this).css('text-decoration').includes('line-through')) {
        $(this).css('text-decoration', 'none');
        $(this).css('color', 'var(--main)');
    } else {
        $(this).css('text-decoration', 'line-through');
        $(this).css('color', 'var(--disb)');
    }


    resources = {};
    $(this).parent().children().each(function(idx, val){
        if (!$(this).css('text-decoration').includes('line-through')) {
            resources[$(this).data("name")] = $(this).data("val");
        }
    })

    ids = convertNamesToIds(resources);
    console.log(ids);   

    calc_res = calculateCost(ids);

    calc_str = "";
    for (let [key, value] of calc_res) {
        calc_str += `${convertIdToName(key)}: ${value}<br>`;
    }
    $(this).parent().parent().find("#resources_calculated").html(calc_str);
}); 

function setSearchOutput(hull, type, data, secondary_data) {
    if (!database_loaded) {
        alert('Database is not loaded, please wait...');
        return;
    } else if (!img_database_loaded) {
        alert('Image Database is not loaded, please wait...')
        return;
    }

    console.log(window.location);
    window.history.pushState(
        "", 
        "why this shit is here", 
        `${window.location.pathname}?type=${type}&name=${hull.replace("+", "%2B")}`
    )

    $("#search_results").hide();
    console.log(hull);
    $('#search_input').val(hull);

    plain = type == "hulls" | type == "turrets" ? " Plain" : ""
    $("#item_img_container").text("Image loading...");
    document.getElementById('item_img').onerror = function(event) {
        $("#item_img_container").text("No img, sorry Т_Т");
    };
    $("#item_img").attr('src', img_database[type][hull]);
    $('#item_img').css('display', 'none');
    
    $("#name").text(hull);
    $("#description").text(data.description);
    $("#tier").text(data.tier);
    $("#rarity").text(data.rarity);
    $("#obtain").text(data.obtain);
    if (data.requires.type === "None") {
        $("#requires").closest('tr').hide();
    } else {
        $("#requires").closest('tr').show();

        $("#requires").html(`<a href="${window.location.origin+window.location.pathname}?type=${data.requires.type}&name=${data.requires.name}">${data.requires.name}</a>`)
    }
    
    if (Object.keys(data.resources).length == 0) {
        $("#resources").closest('tr').hide();
    } else {
        $("#resources").closest('tr').show();

        str = ""
        for (let key of Object.keys(data.resources)) {
            str += `<div data-name="${key}" 
                                 data-val="${data.resources[key]}" 
                                 class="resource_item"
                                 title="Click to disable">${key}: ${data.resources[key]}</div>`;
        }
        $("#resources").html(str);

        ids = convertNamesToIds(data.resources);
        console.log(ids);   

        calc_res = calculateCost(ids);

        calc_str = "";
        for (let [key, value] of calc_res) {
            calc_str += `${convertIdToName(key)}: ${value}<br>`;
        }
        $("#resources_calculated").html(calc_str);

        $("#resources_calculated").hide();
        $("#resources").show();
    }


    console.log(secondary_data);
    $("#weight").text(data.stats.weight+"t");
    $("#stats").html(calculateStringForItem(data, type, `./img/aps/${hull}.png`, secondary_data));
    $("#based_on").text(data.based_on);


    count = 1
    for (let key of Object.keys(data.paired)) {
        var names = extractWeaponNames(data.paired[key]);
        var html_paired = "";

        console.log("Paired & extracted: "+data.paired[key]+" | "+names);

        for (let index = 0; index < names.length; index++) {
            const element = names[index];
            
            element_format = element.split('[')[0];

            html_paired += `<a href="${window.location.origin+window.location.pathname}?type=${key+'s'}&name=${element_format}">${element_format}</a> ${index+1 != names.length ? "|" : ""} `;
        }

        $(`#paired_${count}`).html(html_paired);
        switch (key) {
            case "hull":
                $(`#paired_${count}_text`).text("Hull");
                break;
            case "turret":
                $(`#paired_${count}_text`).text("Turret");
                break;
            case "gun":
                $(`#paired_${count}_text`).text("Gun");
                break;
            default:
                console.log(key);
                break;
        }
        count++;
    }


    $("#item_container").show();


    if (type == "guns") {
        console.warn("Check")
        var pen_graphs = Array.from(document.getElementsByClassName('pen_graf_container'));
        pen_graphs.forEach(el => {
            console.log(new PenetrationGraph(
                el,
                parseInt(el.getAttribute("pen-0")),
                parseInt(el.getAttribute("pen-30")),
                parseInt(el.getAttribute("pen-60")),
                parseInt(el.getAttribute("ric_angle"))
            ))
        })
    }
}