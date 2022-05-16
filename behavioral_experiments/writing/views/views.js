var botcaptcha = {
    name: "botcaptcha",
    title: "Are you a bot?",
    buttonText: "Let's go!",
    render: function(){
        var viewTemplate = $("#botcaptcha-view").html();

        // define possible speaker and listener names
        // fun fact: 10 most popular names for boys and girls
        var speaker = _.shuffle(["Liam", "Noah", "Oliver", "Elijah", "Lucas", "Mason", "Levi", "James", "Asher", "Mateo"])[0];
        var listener = _.shuffle(["Olivia", "Emma", "Amelia", "Ava", "Sophia", "Charlotte", "Isabella", "Mia", "Luna", "Harper"])[0];

        var story = speaker + ' asks ' + listener + ': "Don\'t you just love Fridays?"'

        $("#main").html(
            Mustache.render(viewTemplate, {
                name: this.name,
                title: this.title,
                text: story,
                question: "Who is " + speaker + " talking to?",
                button: this.buttonText
            })
        );

        // don't allow enter press in text field
        $('#listener-response').keypress(function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
            }
        });

        // don't show any error message
        $("#error").hide();
        $("#error_incorrect").hide();
        $("#error_2more").hide();
        $("#error_1more").hide();

        // amount of trials to enter correct response
        var trial = 0;

        $("#next").on("click", function() {
            response = $("#listener-response").val().replace(" ","");

            // response correct
            if (listener.toLowerCase() == response.toLowerCase()) {
                exp.global_data.botresponse = $("#listener-response").val();
                exp.findNextView();

            // response false
            } else {
                trial = trial + 1;
                $("#error_incorrect").show();
                if (trial == 1) {
                    $("#error_2more").show();
                } else if (trial == 2) {
                    $("#error_2more").hide();
                    $("#error_1more").show();
                } else {
                    $("#error_incorrect").hide();
                    $("#error_1more").hide();
                    $("#next").hide();
                    $('#quest-response').css("opacity", "0.2");
                    $('#listener-response').prop("disabled", true);
                    $("#error").show();
                };
            };
            
        });

    },
    trials: 1
};

var intro = {
    name: "intro",
    // introduction title
    title: "CoCoLab Stanford",
    // introduction text
    text:
        "Thank you for participating in our study. In this study, you will see 6 article excerpts with a corresponding image for each, and be asked to provide a description of the image. The whole HIT should take about 10 minutes. Please only participate once in this series of HITs.<br>Please do <strong>not</strong> participate on a mobile device since the page won't display properly.<br><small>If you have any questions or concerns, don't hesitate to contact me at ekreiss@stanford.edu</small>",
    legal_info:
        "<strong>LEGAL INFORMATION</strong>:<br><br>We invite you to participate in a research study on language production and comprehension.<br>Your experimenter will ask you to do a linguistic task such as reading sentences or words, naming pictures or describing scenes, making up sentences of your own, or participating in a simple language game.<br><br>You will be paid for your participation at the posted rate.<br><br>There are no risks or benefits of any kind involved in this study.<br><br>If you have read this form and have decided to participate in this experiment, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. You have the right to refuse to do particular tasks. Your individual privacy will be maintained in all published and written data resulting from the study.<br>You may print this form for your records.<br><br>CONTACT INFORMATION:<br>If you have any questions, concerns or complaints about this research study, its procedures, risks and benefits, you should contact the Protocol Director Meghan Sumner at <br>(650)-725-9336<br><br>If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906. You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306 USA.<br><br>If you agree to participate, please proceed to the study tasks.",
    // introduction's slide proceeding button text
    buttonText: "Begin experiment",
    // render function renders the view
    render: function() {
        var viewTemplate = $("#intro-view").html();

        $("#main").html(
            Mustache.render(viewTemplate, {
                picture: "data/stanford-nlp-logo.jpg",
                title: this.title,
                text: this.text,
                legal_info: this.legal_info,
                button: this.buttonText
            })
        );

        var prolificId = $("#prolific-id");
        var IDform = $("#prolific-id-form");
        var next = $("#next");

        var showNextBtn = function() {
            if (prolificId.val().trim() !== "") {
                next.removeClass("nodisplay");
            } else {
                next.addClass("nodisplay");
            }
        };

        if (config_deploy.deployMethod !== "Prolific") {
            IDform.addClass("nodisplay");
            next.removeClass("nodisplay");
        }

        prolificId.on("keyup", function() {
            showNextBtn();
        });

        prolificId.on("focus", function() {
            showNextBtn();
        });

        // moves to the next view
        next.on("click", function() {
            if (config_deploy.deployMethod === "Prolific") {
                exp.global_data.prolific_id = prolificId.val().trim();
            }

            exp.findNextView();
        });
    },
    // for how many trials should this view be repeated?
    trials: 1
};

var instructions = {
    name: "instructions",
    render: function(CT) {
        var viewTemplate = $("#instructions-view").html(); // don't think we even need mustache yet

        $("#main").html(
            Mustache.render(viewTemplate, {})
        );

        var next_button = $("#next");
        var first_instructions = $("#first-instructions");
        var second_instructions = $("#second-instructions");


        var STATES = {
            FIRST_INSTRUCTION: 0,
            SECOND_INSTRUCTION: 1
        };
        var state = STATES.FIRST_INSTRUCTION;
        next_button.on('click', function () {
            if (state == STATES.FIRST_INSTRUCTION) {
                console.log("we're in here");
                first_instructions.hide();
                second_instructions.show();
                next_button.text("Let's go!");
                window.scrollTo(0,0);
                state = STATES.SECOND_INSTRUCTION;
            } else {
                exp.findNextView();
            }
        });

    },
    trials: 1
};

var main = {
    name: "main",
    render: function(CT) {
        // fill variables in view-template
        var viewTemplate = $("#main-view").html();

        console.log('current trial: ')
        console.log(exp.trial_info.main_trials[CT])

        //get current trial data loaded into variables
        let topic = exp.trial_info.main_trials[CT]['topic'];
        let category = contexts[exp.trial_info.main_trials[CT]['context']];
        let title = category['title'];
        let context = category['context'];
        let image_file = exp.trial_info.main_trials[CT]["image"];

        //send some of that data to mustache to render on html
        $("#main").html(
            Mustache.render(viewTemplate, {
                title: title,
                critical_text: context,
                picture: "data/" + image_file
            })
        );

        window.scrollTo(0,0);


        //minimum number of chars user must type as description
        const min_chars = 5

        //variables referencing elements in html
        var instructions = $("#instructions");
        var img_to_descr = $("#img-to-descr");
        var user_descr = $("#user-description-area");
        var char_count = $("#char-count");
        var char_count_text = $("#char-count-text");
        var text_area = $("#user-description");
        var help_button = $("#help");
        var help_text = $("#helpText");
        var too_short_warning = $("#too-short");
        var check_description_area = $("#check-descr-area");
        var check_description_text = $("#check-descr-text");
        var next_button = $("#next");
        var back_button = $("#back");

        var states = {
            ARTICLE: 0,
            DESCRIPTION: 1,
            CHECK: 2
        };

        var article_to_description = () => {
            instructions.text('Scroll down to write a description of this image!');
            img_to_descr.show();
            user_descr.show();
            char_count.show();
            help_button.show();

            next_button.html('Done writing! Show preview.'); // change button text
        };

        var description_to_check = () => {
            inputted_description = text_area.val();
            window.scroll(0, 0);

            instructions.text('Are you satisfied with your description replacing the image?');
            img_to_descr.hide();
            user_descr.hide();
            char_count.hide();
            help_button.hide();
            too_short_warning.hide();
            help_text.hide();

            check_description_text.text(inputted_description);
            check_description_area.show();

            back_button.show();
            next_button.html('Looks great! Next article, please.');
            next_button.css('display', 'inline-block');
            back_button.css('display', 'inline-block');

        };

        var check_to_description = () => {
            check_description_area.hide();

            img_to_descr.show();
            user_descr.show();
            char_count.show();
            help_button.show();
            
            next_button.html("Done writing!");
            back_button.hide();
        };

        var state = states.ARTICLE;

        var inputted_descriptions = []; // keep track of each description the user writes
        var starting_time, reaction_time;
        var reaction_times = [];
        //event listener for next button
        next_button.on("click", function() {
            console.log('button clicked!')
            console.log('state is: ', state)
            console.log(user_descr.html())
            if (state == states.ARTICLE) {
                article_to_description();
                state = states.DESCRIPTION;
                starting_time = Date.now(); // get starting time of first draft
            } else if (state == states.DESCRIPTION) {
                var num_chars = text_area.val().length;
                if (num_chars < min_chars) {
                    too_short_warning.show();
                }
                else {
                    inputted_descriptions.push(text_area.val());
                    description_to_check();
                    state = states.CHECK;
                    reaction_time = Date.now() - starting_time; // get reaction time for this current draft
                    reaction_times.push(reaction_time)
                }
            } else if (state== states.CHECK) {
                // Shayan: do we need to measure time here?
                var trial_data = {
                    trial_number: CT,
                    topic: topic,
                    category: title,
                    image: image_file,
                    descriptions: inputted_descriptions,
                    reaction_times: reaction_times
                }
                exp.trial_data.push(trial_data);
                exp.findNextView();

            }
        });

        //event listener for back button
        back_button.on('click', function () {
            check_to_description();
            state = states.DESCRIPTION;
            starting_time = Date.now(); // record start of new drafting time
        });

        help_text.css('display', 'none');
        
        // event listener for help button
        var active = false;
        help_button.on('click', function () {
            // console.log("clicked");
            if (!active) {
                help_text.css('display','block')
                active = true;
                help_button.html('Hide');
            } else {
                help_text.css('display','none')
                active = false;
                help_button.html('?');
            }
        })

        //event listener for text area ; ie to make the character counter
        text_area.keyup(function() {
            char_count_text.text(text_area.val().length + " characters");
        })

        // record trial starting time
        var startingTime = Date.now();
    },
    trials: 6
};

var postTest = {
    name: "postTest",
    title: "Additional Info",
    text:
        "Answering the following questions is optional, but will help us understand your answers.",
    buttonText: "Continue",
    render: function() {
        var viewTemplate = $("#post-test-view").html();
        $("#main").html(
            Mustache.render(viewTemplate, {
                title: this.title,
                text: this.text,
                buttonText: this.buttonText
            })
        );

        $("#next").on("click", function(e) {
            // prevents the form from submitting
            e.preventDefault();

            // records the post test info
            exp.global_data.HitCorrect = $("#HitCorrect").val();
            exp.global_data.age = $("#age").val();
            // exp.global_data.gender = $("#gender").val();
            // exp.global_data.education = $("#education").val();
            exp.global_data.languages = $("#languages").val();
            // exp.global_data.enjoyment = $("#enjoyment").val();
            exp.global_data.usefulness = $("#usefulness").val().trim();
            exp.global_data.difficulties = $("#difficulties").val().trim();
            exp.global_data.past_experience = $("#past-experience").val();
            exp.global_data.comments = $("#comments")
                .val()
                .trim();
            exp.global_data.endTime = Date.now();
            exp.global_data.timeSpent =
                (exp.global_data.endTime - exp.global_data.startTime) / 60000;

            // moves to the next view
            exp.findNextView();
        });
    },
    trials: 1
};

var thanks = {
    name: "thanks",
    message: "Thank you for taking part in this experiment!",
    render: function() {
        var viewTemplate = $("#thanks-view").html();

        // what is seen on the screen depends on the used deploy method
        //    normally, you do not need to modify this
        if (
            config_deploy.is_MTurk ||
            config_deploy.deployMethod === "directLink"
        ) {
            // updates the fields in the hidden form with info for the MTurk's server
            $("#main").html(
                Mustache.render(viewTemplate, {
                    thanksMessage: this.message
                })
            );
        } else if (config_deploy.deployMethod === "Prolific") {
            $("main").html(
                Mustache.render(viewTemplate, {
                    thanksMessage: this.message,
                    extraMessage:
                        "Please press the button below to confirm that you completed the experiment with Prolific<br />" +
                        "<a href=" +
                        config_deploy.prolificURL +
                        ' class="prolific-url">Confirm</a>'
                })
            );
        } else if (config_deploy.deployMethod === "debug") {
            $("main").html(Mustache.render(viewTemplate, {}));
        } else {
            console.log("no such config_deploy.deployMethod");
        }

        exp.submit();
    },
    trials: 1
};
