const filePath = "./../database.json";
const fileImgPath = "./../imgPaths.json";
const fileResourcesPath = "./../resources.json";
var database;
var item_html;
detectColorScheme();

const signs = [
    "==", "!=", ">=", "<=", ">", "<"
]

function compareByString(first, sign, second) {
    switch (sign) {
        case "==":
            return first == second;
        case "!=":
            return first != second;
        case ">=":
            return first >= second;
        case "<=":
            return first <= second;
        case ">":
            return first > second;
        case "<":
            return first < second;
        default:
            console.log(sign);
            return false;
    }
}

var max_output_modules = 45;
function setMaxOutput(max_out) {
    max_output_modules = max_out;
}

const filter_templates = {
    general: [
        {
            path: "tier",
            name: "Tier",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "rarity",
            name: "Rarity",
            getval: (obj) => obj.val(),
            type: "select",
            options: {
                Common: "Common",
                Uncommon: "Uncommon",
                Rare: "Rare",
                Epic: "Epic",
                Legendary: "Legendary",
                Mythical: "Mythical",
            },
            compare: (data, val, sign) => sign == "==" ? data == val : data != val,
        },
        {
            path: "obtain",
            name: "Obtain",
            getval: (obj) => obj.val(),
            type: "select",
            options: {
                "Joe's Shack": "Joe's Shack",
                Blueprints: "Blueprints",
                Crate: "Crate Drop",
                Unobtainable: "Unobtainable",
                "⭐": "Monthly Reward",
                Incident: "Incidents",
            },
            compare: (data, val, sign) => sign == "==" ? data.includes(val) : !data.includes(val),
        },
        {
            path: "stats.weight",
            name: "Weight",
            getval: (obj) => obj.val(),
            type: "number",
        },
    ],
    hulls: [
        {
            path: "stats.speed.acceleration",
            name: "Acceleration",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.speed.forward",
            name: "Forward Speed",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.speed.backward",
            name: "Backward Speed",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.speed.torque",
            name: "Torque",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.speed.rate",
            name: "Traverse Rate",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.ammo_storage",
            name: "Ammo Storage",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.blowout",
            name: "Blowout",
            getval: (obj) => obj.val(),
            type: "select",
            options: { "-1": "None", 0: "Partial", 1: "Yes" },
            compare: (data, val, sign) => data == val,
        },
        {
            path: "stats.weaponry.hull_aim",
            name: "Hull Aim",
            getval: (obj) => obj.val(),
            type: "select",
            options: { 0: "No", 1: "Suspension only", 2: "Yes" },
            compare: (data, val, sign) => data == val,
        },
        {
            path: "stats.weaponry.aps",
            name: "APS",
            getval: (obj) => obj.is(":checked"),
            type: "checkbox",
        },
        {
            path: "stats.weaponry.have_gun",
            name: "Turretless",
            getval: (obj) => obj.is(":checked"),
            type: "checkbox",
        },
    ],
    turrets: [
        {
            path: "stats.weaponry.ammo_storage",
            name: "Ammo Storage",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.clip",
            name: "Clip",
            getval: (obj) => obj.is(":checked"),
            type: "checkbox",
        },
        {
            path: "stats.weaponry.blowout",
            name: "Blowout",
            getval: (obj) => obj.val(),
            type: "select",
            options: { "-1": "None", 0: "Partial", 1: "Yes" },
            compare: (data, val, sign) => data == val,
        },
        {
            path: "stats.weaponry.stabilizer",
            name: "Stabilizer",
            getval: (obj) => obj.is(":checked"),
            type: "checkbox",
        },
        {
            path: "stats.weaponry.aps",
            name: "APS",
            getval: (obj) => obj.is(":checked"),
            type: "checkbox",
        },
        {
            path: "stats.weaponry.fcs",
            name: "FCS",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.sight.thermal",
            name: "Thermal",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.sight.zoom_lower",
            name: "Zoom Min",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.sight.zoom_upper",
            name: "Zoom Max",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.gun.reload_multiplier",
            name: "Reload Mult.",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.gun.limits.up",
            name: "Up Limit",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.gun.limits.down",
            name: "Down Limit",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.gun.speed.vertical",
            name: "Vertical Speed",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.gun.speed.horizontal",
            name: "Horizontal Speed",
            getval: (obj) => obj.val(),
            type: "number",
        },
    ],
    guns: [
        {
            path: "stats.weaponry.reload",
            name: "Reload",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.clip",
            name: "Clip",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.accuracy",
            name: "Accuracy",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.ammo_volume",
            name: "Ammo Volume",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.caliber:",
            name: "Caliber",
            getval: (obj) => obj.val(),
            type: "number",
        },
        {
            path: "stats.weaponry.ammunition#type",
            name: "Ammo Type",
            getval: (obj) => obj.val(),
            type: "select",
            options: {
                AP: "AP",
                APHE: "APHE",
                APDS: "APDS",
                APFSDS: "APFSDS",
                HEAT: "HEAT",
                ATGM: "ATGM",
                HE: "HE",
                HESH: "HESH",
            },
            compare: function (data, val, sign) {
                val_form = val;

                for (let index = 0; index < data.length; index++) {
                    one = data[index].type
                        .split(" ")[0]
                        .replace("HEATFS", "HEAT");

                    if (val_form == one) return sign == "==" ? true : false;
                }

                return sign == "==" ? false : true;
            },
        },
        {
            path: "stats.weaponry.ammunition#pen",
            name: "Ammo Pen.",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    one = data[index].penetration["0"];

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#vel",
            name: "Ammo Velocity",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    one = data[index].velocity;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#RA",
            name: "Ammo Ricochet Angle",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    one = data[index].ricochet_angle;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#EM",
            name: "Ammo Explosive Mass (kg)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (!data[index].stats.explosive_mass) continue;

                    one = +data[index].stats.explosive_mass
                        .replace("kg", "")
                        .replace("g", "");
                    if (!data[index].stats.explosive_mass.includes("kg"))
                        one = one / 1000;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#FS",
            name: "Ammo Fuse Sensitive (mm)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (!data[index].stats.fuse_sensitive) continue;

                    one = data[index].stats.fuse_sensitive;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#FD",
            name: "Ammo Fuse Delay (m)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (!data[index].stats.fuse_delay) continue;

                    one = data[index].stats.fuse_delay;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#AD",
            name: "Ammo Arming Distance (m)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (
                        !data[index].stats.arming_distance ||
                        data[index].stats.arming_distance == -1
                    )
                        continue;

                    one = data[index].stats.arming_distance;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#FR",
            name: "Ammo Fuse Radius (m)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (
                        !data[index].stats.fuse_radius ||
                        data[index].stats.fuse_radius == -1
                    )
                        continue;

                    one = data[index].stats.fuse_radius;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
        {
            path: "stats.weaponry.ammunition#rng",
            name: "Ammo Range (km)",
            getval: (obj) => obj.val(),
            type: "number",
            compare: function (data, val, sign) {
                for (let index = 0; index < data.length; index++) {
                    if (!data[index].stats.range) continue;

                    one = data[index].stats.range;

                    if (compareByString(one, sign, val)) return true;
                }

                return false;
            },
        },
    ],
};

added_filters = [];

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
</select><input value="0" 
                type="{type}" 
                step="0.01" 
                id="value" 
                class="type_search_select filter_item_option enabled"  
                style="width: 35%;"><div 
                        class="type_search_select filter_item_option toggle-rect" 
                        style=" display: none; 
                                width:fit-content; 
                                padding:0; 
                                width: 35%;
                                text-align: -webkit-center;
                                vertical-align: middle;">
                    <input type="checkbox" class="toggle-rect-input" id="value_check{id}" name="check">
                    <label for="value_check{id}"></label>
                </div><select 
                    id="value" 
                    class="type_search_select filter_item_option"
                    style="width: 35%; display: none;">
</select>
</div>`;

function fetchJSONFile(path, callback) {
    // thx ChatGPT
    fetch(path)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            callback(null, data);
        })
        .catch((error) => {
            callback(error, null);
        });
}

$(document).on("click", ".show_calculated_res", function () {
    $(this).parent().find("#resources_calculated").toggle();
    $(this).parent().find("#resources").toggle();
});

$(document).on("click", ".resource_item", function () {
    if ($(this).css("text-decoration").includes("line-through")) {
        $(this).css("text-decoration", "none");
        $(this).css("color", "var(--main)");
    } else {
        $(this).css("text-decoration", "line-through");
        $(this).css("color", "var(--disb)");
    }

    resources = {};
    $(this)
        .parent()
        .children()
        .each(function (idx, val) {
            if (!$(this).css("text-decoration").includes("line-through")) {
                resources[$(this).data("name")] = $(this).data("val");
            }
        });

    ids = convertNamesToIds(resources);
    console.log(ids);

    calc_res = calculateCost(ids);

    calc_str = "";
    for (let [key, value] of calc_res) {
        calc_str += `${convertIdToName(key)}: ${value}<br>`;
    }
    $(this).parent().parent().find("#resources_calculated").html(calc_str);
});

databases_loaded = [false, false];
function onDatabaseLoad() {
    if (!(databases_loaded[0] && databases_loaded[1])) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("type") == undefined || 
        urlParams.get("filters") == undefined) {
            console.error("Please check your URL parameters");
            
            return;
        }
    
    type = urlParams.get("type");
    $("#type").val(type)

    filters = urlParams.get("filters").split(";");
    console.log(filters)
    filters.forEach((_filter) => {
        filter = _filter.split("|");
        
        filter_path = filter[0];
        filter_sign = filter[1];
        filter_val  = filter[2];

        $("#button_add").click();
        filter_jq = $("#filter_container").children().last()

        temp = filter_templates[type].find(
            (x) => x["path"] == filter_path
        );
        if (!temp) {
            temp = filter_templates["general"].find(
                (x) => x["path"] == filter_path
            );
        }

        filter_jq.find("#option").val(filter_path)
        filter_jq.find("#option").trigger("change")
        
        filter_jq.find("#calc").val(filter_sign)

        if (temp["type"] == "number") {
            filter_jq.find(".enabled").val(filter_val)
        } else if (temp["type"] == "checkbox") {
            if (filter_val === "true") {
                filter_jq.find(".enabled").prop("checked", true);
            } else {
                filter_jq.find(".enabled").prop("checked", false);
            }
        } else if (temp["type"] == "select") {
            filter_jq.find(".enabled").val(filter_val)
        }
    })

    $("#search").click();
}


$(document).ready(function () {
    item_html = $(".item_container").html();
    $("#item_container_z").hide();
    $("#modules_contents_dict").hide();

    max_output = getCookie("max_output");
    if (max_output === "") {
        document.cookie = `max_output=${$("#settings_max_output").val()}`;
    } else {
        $("#settings_max_output").val(max_output);
    }

    max_output_modules = +getCookie("max_output");

    show_data = getCookie("show_data");
    if (show_data === "") {
        document.cookie = `show_data=${$("#settings_show_data").prop(
            "checked"
        )}`;
    } else {
        $("#settings_show_data").prop("checked", JSON.parse(show_data));
    }

    loadResourcesData(fileResourcesPath);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error("Error reading JSON file:", error);
            return;
        } else {
            console.log("JSON file content:", data);

            database = data;

            databases_loaded[0] = true;

            onDatabaseLoad()
        }
    });

    fetchJSONFile(fileImgPath, (error, data) => {
        if (error) {
            console.error("Error reading JSON file:", error);
            return;
        } else {
            console.log("JSON file content:", data);

            img_database = data;

            databases_loaded[1] = true;

            onDatabaseLoad()
        }
    });

    $("#settings_popup").click(function (e) {
        $(".settings_popup").toggle();

        $("#settings_max_output").val(getCookie("max_output"));
        $("#settings_show_data").prop(
            "checked",
            JSON.parse(getCookie("show_data"))
        );
    });

    $("#settings_save").click(function (e) {
        document.cookie = `max_output=${$("#settings_max_output").val()}`;
        document.cookie = `show_data=${$("#settings_show_data").is(
            ":checked"
        )}`;

        max_output_modules = +getCookie("max_output");

        $(".settings_popup").hide();
    });

    $(".item_container").on("click", ".show_stats_button", function (e) {
        $(this).parent().parent().parent().find("> tr:not(.shown)").toggle();

        if ($(this).text() == "Show stats") {
            $(this).text("Hide stats");
        } else {
            $(this).text("Show stats");
        }
    });

    $("#type").on("change", function () {
        $("#filter_container").empty();
    });

    $("#filter_container").on(
        "change",
        "select.filter_item_option#option",
        function () {
            temp = filter_templates[$("#type").val()].find(
                (x) => x["path"] == $(this).val()
            );
            if (!temp) {
                temp = filter_templates["general"].find(
                    (x) => x["path"] == $(this).val()
                );
            }

            if (temp["type"] == "number") {
                $(this).parent().find("input#value").show();
                $(this).parent().find("div.toggle-rect").hide();
                $(this).parent().find("select#value").hide();

                $(this).parent().find("input#value").addClass("enabled");
                $(this).parent().find("input.toggle-rect-input").removeClass("enabled");
                $(this).parent().find("select#value").removeClass("enabled");

                $(this).parent().find("#calc").html(`
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value=">=">>=</option>
                    <option value="<="><=</option>
                    <option value=">"> ></option>
                    <option value="<"> <</option>
                `)
                $(this).parent().find("#calc").removeAttr("disabled");
            } else if (temp["type"] == "checkbox") {
                $(this).parent().find("input#value").hide();
                $(this).parent().find("div.toggle-rect").show();
                $(this).parent().find("select#value").hide();

                $(this).parent().find("input#value").removeClass("enabled");
                $(this).parent().find("input.toggle-rect-input").addClass("enabled");
                $(this).parent().find("select#value").removeClass("enabled");

                $(this).parent().find("#calc").val("==");
                $(this).parent().find("#calc").attr("disabled", "disabled");
            } else if (temp["type"] == "select") {
                $(this).parent().find("input#value").hide();
                $(this).parent().find("div.toggle-rect").hide();
                $(this).parent().find("select#value").show();

                $(this).parent().find("input#value").removeClass("enabled");
                $(this).parent().find("input.toggle-rect-input").removeClass("enabled");
                $(this).parent().find("select#value").addClass("enabled");

                $(this).parent().find("#calc").html(`
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                `)
                $(this).parent().find("#calc").removeAttr("disabled");

                str = "";
                for (let key of Object.keys(temp["options"])) {
                    str += `<option value="${key}">${temp["options"][key]}</option>`;
                }
                $(this).parent().find("select#value").html(str);
            }
        }
    );

    $("#button_add").click(function (e) {
        options = "";

        for (
            let index = 0;
            index < filter_templates["general"].length;
            index++
        ) {
            const element = filter_templates["general"][index];

            options += `<option value="${element["path"]}">${element["name"]}</option>`;
        }

        for (
            let index = 0;
            index < filter_templates[$("#type").val()].length;
            index++
        ) {
            const element = filter_templates[$("#type").val()][index];

            options += `<option value="${element["path"]}">${element["name"]}</option>`;
        }

        $("#filter_container").append(
            filter_item_template
                .replace(
                    /{id}/g,
                    `filter_item_${
                        $("#filter_container").children().length + 1
                    }`
                )
                .replace("{options}", options)
                .replace(
                    "{type}",
                    filter_templates[$("#type").val()][0]["type"]
                )
        );
    });

    $("#button_rem").click(function (e) {
        $("#filter_container").children().last().remove();
    });

    $("#search").click(function (e) {
        str = "";
        ids = [];
        counter = 0;

        type = $("#type").val();

        filters = [];
        url_append = "?type=" + type + "&filters=";
        filters_str = []
        for (
            let index = 0;
            index < $("#filter_container").children().length;
            index++
        ) {
            const filter = $(`#filter_container #filter_item_${index + 1}`);

            temp = filter_templates[$("#type").val()].find(
                (x) => x["path"] == filter.find("#option").val()
            );
            if (!temp) {
                temp = filter_templates["general"].find(
                    (x) => x["path"] == filter.find("#option").val()
                );
            }

            filters.push([
                filter.find("#option").val().split("#")[0],
                filter.find("#calc").val(),
                temp["getval"](filter.find(".enabled")),
                temp["compare"],
            ]);
            
            filters_str.push(`${filter.find("#option").val().replace("#", "%23")}|${filter.find("#calc").val()}|${temp["getval"](filter.find(".enabled"))}`);

            console.log(filters[filters.length - 1]);
        }


        if (filters.length > 0) {
            window.history.pushState("", "why this shit is here", window.location.pathname + url_append + filters_str.join(";"))
        }


        document.getElementById("modules_contents_dict").innerHTML = "";

        for (var key of Object.keys(database[type])) {
            fit_in_filter = true;

            filters.forEach((element) => {
                if (element[3] !== undefined) {
                    fit_in_filter =
                        fit_in_filter &&
                        element[3](
                            getDataByString(database[type][key], element[0]),
                            element[2],
                            element[1]
                        );
                    return;
                }

                fit_in_filter =
                    fit_in_filter &&
                    compareByString(
                        getDataByString(database[type][key], element[0]),
                        element[1],
                        element[2]
                    );
            });

            if (fit_in_filter) {
                ids.push(key);

                str += item_html.replace(
                    "item_container_z",
                    `item_container_${counter}`
                );

                document.getElementById(
                    "modules_contents_dict"
                ).innerHTML += `<li><a href="#item_container_${counter}">${key}</a></li>`;

                counter++;

                if (counter >= max_output_modules) {
                    break;
                }
            }
        }

        console.log(ids);
        if (counter === 0) {
            $("#modules_contents_dict").hide();
        } else {
            $("#modules_contents_dict").show();
        }
        $(".item_container").html(str);

        for (var i = 0; i < ids.length; i++) {
            var hull = ids[i];
            var data = database[type][hull];
            var secondaries_data =
                database.secondaries[
                    hull +
                        "-" +
                        capitalizeFirstLetter(
                            type.substring(0, type.length - 1)
                        )
                ];
            console.log(hull);
            $("#search_input").val(hull);

            plain = "";
            if ((type == "hulls") | (type == "turrets")) {
                plain = " Plain";
            }
            $(`#item_container_${i} ` + "#item_img")
                .on("load", function () {
                    $(this).css("display", "block");
                    console.log("loaded");
                })
                .attr("src", "./." + img_database[type][hull]);
            $(`#item_container_${i} ` + "#item_img").css("display", "none");

            $(`#item_container_${i} ` + "#name").text(hull);
            $(`#item_container_${i} ` + "#description").text(data.description);
            $(`#item_container_${i} ` + "#tier").text(data.tier);
            $(`#item_container_${i} ` + "#rarity").text(data.rarity);
            $(`#item_container_${i} ` + "#obtain").text(data.obtain);

            if (Object.keys(data.resources).length == 0) {
                var tr_show = $(`#item_container_${i} ` + "#resources").closest(
                    "tr"
                );

                tr_show.hide();
                tr_show.addClass("shown");
            } else {
                var tr_show = $(`#item_container_${i} ` + "#resources").closest(
                    "tr"
                );

                tr_show.show();

                str = "";
                for (let key of Object.keys(data.resources)) {
                    str += `<div data-name="${key}" 
                                 data-val="${data.resources[key]}" 
                                 class="resource_item"
                                 title="Click to disable">${key}: ${data.resources[key]}</div>`;
                }
                $(`#item_container_${i} ` + "#resources").html(str);

                resources_ids = convertNamesToIds(data.resources);
                console.log(resources_ids);

                calc_res = calculateCost(resources_ids);

                calc_str = "";
                for (let [key, value] of calc_res) {
                    calc_str += `${convertIdToName(key)}: ${value}<br>`;
                }
                $(`#item_container_${i} ` + "#resources_calculated").html(
                    calc_str
                );
            }

            if (!JSON.parse(getCookie("show_data"))) {
                $(`#item_container_${i} tbody`).find("> tr:not(.shown)").hide();
                $(`#item_container_${i} tr th button.show_stats_button`).text(
                    "Show stats"
                );
            }

            $(`#item_container_${i} ` + "#weight").text(
                data.stats.weight + "t"
            );
            $(`#item_container_${i} ` + "#stats").html(
                calculateStringForItem(
                    data,
                    type,
                    `./../img/aps/${hull}.png`,
                    secondaries_data
                )
            );
            $(`#item_container_${i} ` + "#based_on").text(data.based_on);

            count = 1;
            for (let key of Object.keys(data.paired)) {
                var names = extractWeaponNames(data.paired[key]);
                var html_paired = "";

                console.log(
                    "Paired & extracted: " + data.paired[key] + " | " + names
                );

                for (let index = 0; index < names.length; index++) {
                    const element = names[index];

                    element_format = element.split("[")[0];

                    if (element_format == "None") continue;

                    html_paired += `<a href="${
                        window.location.origin +
                        window.location.pathname +
                        "../"
                    }?type=${
                        key + "s"
                    }&name=${element_format}">${element_format}</a> ${
                        index + 1 != names.length ? "|" : ""
                    } `;
                }

                $(`#item_container_${i} ` + `#paired_${count}`).html(
                    html_paired
                );

                switch (key) {
                    case "hull":
                        $(
                            `#item_container_${i} ` + `#paired_${count}_text`
                        ).text("Hull");
                        break;
                    case "turret":
                        $(
                            `#item_container_${i} ` + `#paired_${count}_text`
                        ).text("Turret");
                        break;
                    case "gun":
                        $(
                            `#item_container_${i} ` + `#paired_${count}_text`
                        ).text("Gun");
                        break;
                    default:
                        console.log(key);
                        break;
                }
                count++;
            }
        }

        
        var pen_graphs = Array.from(document.getElementsByClassName('pen_graf_container'));
        pen_graphs.forEach(el => {
            new PenetrationGraph(
                el,
                parseInt(el.getAttribute("pen-0")),
                parseInt(el.getAttribute("pen-30")),
                parseInt(el.getAttribute("pen-60")),
                parseInt(el.getAttribute("ric_angle"))
            )
        })

        var pen_per_dist_graphs = Array.from(document.getElementsByClassName('pen_per_dist_graf_container'));
        pen_per_dist_graphs.forEach(el => {
            console.log(new PenetrationPerDistanceGraph(
                el,
                parseInt(el.getAttribute("pen")),
                parseInt(el.getAttribute("caliber")),
                parseInt(el.getAttribute("shellSpeed"))
            ))
        })
    });
});
