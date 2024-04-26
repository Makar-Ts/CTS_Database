const filePath = "./../database.json";
const fileImgPath = "./../imgPaths.json";
var database;
var item_html;
detectColorScheme();

filter_templates = {
    "hulls": [
        ["tier", "Tier", "number"],
        ["stats.weight", "Weight", "number"],
        ["stats.speed.acceleration",    "Acceleration", "number"],
        ["stats.speed.forward",         "Forward Speed", "number"],
        ["stats.speed.backward",        "Backward Speed", "number"],
        ["stats.speed.torque",          "Torque", "number"],
        ["stats.speed.rate",            "Traverse Rate", "number"],
        ["stats.weaponry.ammo_storage", "Ammo Storage", "number"],
        ["stats.weaponry.aps",          "APS", "checkbox"],
        ["stats.weaponry.have_gun",     "Turretless", "checkbox"],
    ],
    "turrets": [
        ["tier", "Tier", "number"],
        ["stats.weight", "Weight", "number"],
        ["stats.weaponry.aps",          "APS", "checkbox"],
        ["stats.weaponry.fcs",          "FCS", "number"],
        ["stats.weaponry.ammo_storage", "Ammo Storage", "number"],
        ["stats.weaponry.gun.reload_multiplier", "Reload Mult.", "number"],
        ["stats.weaponry.gun.limits.up",        "Up Limit", "number"],
        ["stats.weaponry.gun.limits.down",      "Down Limit", "number"],
        ["stats.weaponry.gun.speed.vertical",   "Vertical Speed", "number"],
        ["stats.weaponry.gun.speed.horizontal", "Horizontal Speed", "number"],
    ],
    "guns": [
        ["tier", "Tier", "number"],
        ["stats.weight", "Weight", "number"],
        ["stats.weaponry.reload",      "Reload", "number"],
        ["stats.weaponry.accuracy",    "Accuracy", "number"],
        ["stats.weaponry.ammo_volume", "Ammo Volume", "number"],
        ["stats.weaponry.caliber:",     "Caliber", "number"],
    ]
}

filter_item_template = `<div class="filter_item" id="{id}">
<select id="option" class="type_search_select filter_item_option">
    {options}
</select><select id="calc" class="type_search_select filter_calc_option">
    <option value="==">==</option>
    <option value="!=">!=</option>
    <option value=">=">>=</option>
    <option value="<="><=</option>
    <option value=">"> ></option>
    <option value="<"> <</option>
</select><input value="0" type="{type}" step="0.01" id="value" class="type_search_select filter_item_option" style="width: 35%;">
</div>`

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
    item_html = $(".item_container").html();
    $("#item_container_z").hide();
    console.log(item_html);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            database = data;

            console.log(database.hulls["TKS"]);
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
        }
    });

    $("#type").on( "change", function() {
        $("#filter_container").empty();
    });

    $("#filter_container").on('change', 'select.filter_item_option', function() {
        temp = filter_templates[$("#type").val()].find(x => x[0] == $(this).val())

        $(this).parent().find("#value").attr("type", temp[2]);

        if (temp[2] != "number") {
            $(this).parent().find("#calc").val("==");
            $(this).parent().find("#calc").attr("disabled", "disabled");
        } else {
            $(this).parent().find("#calc").removeAttr("disabled");
        }
    });

    $('#button_add').click(function(e) {
        options = "";

        for (let index = 0; index < filter_templates[$("#type").val()].length; index++) {
            const element = filter_templates[$("#type").val()][index];
            
            options += `<option value="${element[0]}">${element[1]}</option>`;
        }

        $("#filter_container").append(
            filter_item_template
               .replace("{id}", `filter_item_${$("#filter_container").children().length+1}`)
               .replace("{options}", options)
               .replace("{type}", filter_templates[$("#type").val()][0][2])
        );
    });

    $('#button_rem').click(function(e) {
        $("#filter_container").children().last().remove();
    });


    $('#search').click(function (e) {
        str = "";
        ids = [];
        counter = 0;

        type = $("#type").val();
        
        filters = []
        for (let index = 0; index < $("#filter_container").children().length; index++) {
            const filter = $(`#filter_container #filter_item_${index+1}`);

            if( filter.find('#value').attr( 'type' ) === 'checkbox' ) {
                value = +filter.find('#value').is( ':checked' );
            } else {
                value = filter.find('#value').val();
            }
            
            filters.push([filter.find('#option').val(), filter.find('#calc').val(), value])
            console.log(filters[filters.length-1]);
        }

        for (var key of Object.keys(database[type])) {
            fit_in_filter = true;
            filters.forEach(element => {
                switch (element[1]) {
                    case "==":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0]) == element[2];
                        break;
                    case "!=":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0])!= element[2];
                        break;
                    case ">=":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0]) >= element[2];
                        break;
                    case "<=":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0]) <= element[2];
                        break;
                    case ">":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0]) > element[2];
                        break;
                    case "<":
                        fit_in_filter = fit_in_filter && getDataByString(database[type][key], element[0]) < element[2];
                        break;
                    default:
                        console.log(element[1]);
                        break;
                }
            });

            if (fit_in_filter) {
                ids.push(key);

                str += item_html.replace("item_container_z", `item_container_${counter}`)

                counter++;

                if (counter >= 30) {
                    break;
                }
            }
        }

        console.log(ids);
        $(".item_container").html(str);

        for (var i = 0; i < ids.length; i++) {
            var hull = ids[i];
            var data = database[type][hull]
            console.log(hull);
            $('#search_input').val(hull);

            plain = ""
            if (type == "hulls" | type == "turrets") { plain = " Plain"; }
            $(`#item_container_${i} `+'#item_img').on('load', function() {
                $(this).css('display', 'block');
                console.log('loaded');
            }).attr('src', "./."+img_database[type][hull]);
            $(`#item_container_${i} `+'#item_img').css('display', 'none');
            
            $(`#item_container_${i} `+"#name").text(hull);
            $(`#item_container_${i} `+"#description").text(data.description);
            $(`#item_container_${i} `+"#tier").text(data.tier);
            $(`#item_container_${i} `+"#rarity").text(data.rarity);
            $(`#item_container_${i} `+"#obtain").text(data.obtain);

            if (data.resources.length == 0) {
                $(`#item_container_${i} `+"#resources").closest('tr').hide();
            } else {
                $(`#item_container_${i} `+"#resources").closest('tr').show();

                str = ""
                for (let key of Object.keys(data.resources)) {
                    str += `${key}: ${data.resources[key]}<br>`;
                }
                $(`#item_container_${i} `+"#resources").html(str);
            }

            $(`#item_container_${i} `+"#weight").text(data.stats.weight+"t");
            $(`#item_container_${i} `+"#stats").html(calculateStringForItem(data, type, `./../img/aps/${hull}.png`));
            $(`#item_container_${i} `+"#based_on").text(data.based_on);

            count = 1
            for (let key of Object.keys(data.paired)) {
                var names = extractWeaponNames(data.paired[key]);
                var html_paired = "";

                console.log("Paired & extracted: "+data.paired[key]+" | "+names);

                for (let index = 0; index < names.length; index++) {
                    const element = names[index];
                    
                    element_format = element.split('[')[0];

                    if (element_format == "None") continue;

                    html_paired += `<a href="${window.location.origin+window.location.pathname+"../"}?type=${key+'s'}&name=${element_format}">${element_format}</a> ${index+1 != names.length ? "|" : ""} `;
                }

                $(`#item_container_${i} `+`#paired_${count}`).html(html_paired);
                switch (key) {
                    case "hull":
                        $(`#item_container_${i} `+`#paired_${count}_text`).text("Hull");
                        break;
                    case "turret":
                        $(`#item_container_${i} `+`#paired_${count}_text`).text("Turret");
                        break;
                    case "gun":
                        $(`#item_container_${i} `+`#paired_${count}_text`).text("Gun");
                        break;
                    default:
                        console.log(key);
                        break;
                }
                count++;
            }
        }
    })
})