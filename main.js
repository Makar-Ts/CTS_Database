const filePath = "./database.json";
var database;

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
    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            database = data;

            console.log(data.hulls["TKS"]);
        }
    });

    $('#search_input').bind('input', function (e) {
        $("#search_results").show();
        var search_for = $('#search_input').val().toLowerCase()
        
        str = ""

        count = 5;
        for (let key of Object.keys(database.hulls)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="hulls"><td>Hull: &nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 5;
        for (let key of Object.keys(database.turrets)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="turrets"><td>Turret: ${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        count = 5;
        for (let key of Object.keys(database.guns)) {
            if (key.toLowerCase().includes(search_for)) {
                str += `<tr class="search_result_item" data-item="${key}" data-type="guns"><td>Gun: &nbsp;&nbsp;&nbsp;${key}</td></tr>`
                count--;
            }

            if (count <= 0) { break; }
        }

        $('#search_results').html(str);
    });

    $(document).on('click', '.search_result_item', function() {
        $("#search_results").hide();
        var hull = $(this).data("item");
        var data = database[$(this).data("type")][hull]
        console.log(hull);
        $('#search_input').val(hull);
        
        $("#name").text(hull);
        $("#description").text(data.description);
        $("#tier").text(data.tier);
        $("#rarity").text(data.rarity);
        $("#obtain").text(data.obtain);

        if (data.resources.length == 0) {
            $("#resources").closest('tr').hide();
        } else {
            $("#resources").closest('tr').show();

            str = ""
            for (let key of Object.keys(data.resources)) {
                str += `${key}: ${data.resources[key]}<br>`;
            }
            $("#resources").html(str);
        }

        $("#weight").text(data.stats.weight+"kg");
        $("#based_on").text(data.based_on);

        count = 1
        for (let key of Object.keys(data.paired)) {
            console.log(count);
            $(`#paired_${count}`).text(data.paired[key]);
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
                    break;
            }
            count++;
        }
    }); 
})