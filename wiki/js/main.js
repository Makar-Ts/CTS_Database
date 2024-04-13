$(document).ready(function() {
    $(".show_button").click(function () {
        var elem = $($(this).attr("data"));
        var deg = 90;
        if (elem.is(':visible')) {
            elem.hide();
        } else {
            deg = 270;
            elem.show();  
        }

        var rotate = 'rotate(' + deg + 'deg)';
        $(this).children(0).css({
            '-webkit-transform': rotate,
            '-moz-transform': rotate,
            '-o-transform': rotate,
            '-ms-transform': rotate,
            'transform': rotate
        });
    });

    $("#reload_button").click(function () {
        var caliber = $("#reload_input_cal").val();
        var init_reload = $("#reload_input_init_rel").val();
        var reload_mult = $("#reload_input_rel_mult").val();

        if (caliber === undefined || caliber <= 0 || 
            init_reload === undefined || init_reload <= 0 || 
            reload_mult === undefined || reload_mult <= 0) {
                $("#reload_answer_container").html("Please enter valid values for caliber, initial reload and reload multiplier");
                return;
        }

        var penalty = calculateCaliberPenalty(caliber, reload_mult);
        var reload = init_reload / penalty;

        $("#reload_answer_container").html(`
        Your reload will be <strong>${reload.toFixed(2)}s</strong> (penalty is ${penalty.toFixed(2)}).
        `);
    });
});