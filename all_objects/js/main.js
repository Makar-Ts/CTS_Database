const filePath = "./../database.json";
var database;
var item_html;

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
    item_html = $(".item_container").html();
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

    $('#search').click(function (e) {
        str = "";
        ids = [];
        counter = 0;

        type = $("#type").val();
        tier = $("#tier").val();

        for (var key of Object.keys(database[type])) {
            if (database[type][key].tier == tier) {
                ids.push(key);

                str += item_html.replace("item_container_z", `item_container_${counter}`)

                counter++;
            }
        }

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
            }).attr('src', `./../img/${type}/Tier ${data.tier}/${hull}${plain}.png`);
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
            $(`#item_container_${i} `+"#stats").html(calculateStringForItem(data, type));
            $(`#item_container_${i} `+"#based_on").text(data.based_on);

            count = 1
            for (let key of Object.keys(data.paired)) {
                $(`#item_container_${i} `+`#paired_${count}`).text(data.paired[key]);
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