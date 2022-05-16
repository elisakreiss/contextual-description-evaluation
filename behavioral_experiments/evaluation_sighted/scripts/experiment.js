// customize the experiment by specifying a view order and a trial structure
exp.customize = function() {
    // record current date and time in global_data
    this.global_data.startDate = Date();
    this.global_data.startTime = Date.now();
    // specify view order
    this.views_seq = [
        intro,
        botcaptcha,
        instructions,
        main,
        postTest,
        thanks
    ];

    // pick the description we'll display for each image-context pair
    main_trials = _.shuffle(main_trials);
    var used_context_index = 0
    let used_contexts = new Set()
    for(let image in main_trials) {
        let descriptions_by_context = main_trials[image]['descriptions'];
        let contexts = Object.keys(descriptions_by_context);
        contexts = _.shuffle(contexts);
        console.log("contexts: ", contexts)

        // only want to pick a context that has not been used yet
        let i = 0;
        while (used_contexts.has(contexts[i]))
            i++;

        // if all have been used
        if (i >= contexts.length) {
            console.log("nothing");
            used_context_index = image;
            i--;
        }
 
        let context = contexts[i];
        main_trials[image]['context'] = context;
        // console.log('context chosen: ');
        // console.log(context);
        // console.log(contexts)
        // console.log(i);
        used_contexts.add(context); // need to fix this ; sometimes, there will def be an overlap!

        // randomly select a description from this context
        descriptions = descriptions_by_context[context];
        description = _.shuffle(descriptions)[0];
        main_trials[image]['description'] = description;
    };

    main_trials.splice(used_context_index, 1)

    main_trials = main_trials.concat(attention_checks);
    this.trial_info.main_trials = _.shuffle(main_trials);
    console.log(this.trial_info.main_trials);

    // sample question order
    let questions = _.shuffle(["reconstructive", "image_fit", "all_relevant", "no_irrelevant"]);
    console.log(questions)

    this.trial_info.q1 = questions[0];
    this.trial_info.q2 = questions[1];
    this.trial_info.q3 = questions[2];
    this.trial_info.q4 = questions[3];
    console.log(this.trial_info.q1);
    console.log(this.trial_info.q2);
    console.log(this.trial_info.q3);

    // this.trial_info.first_notfitin_q = notfitin[0];
    // console.log(this.trial_info.first_notfitin_q);

    // adds progress bars to the views listed
    // view's name is the same as object's name
    this.progress_bar_in = ["main"];
    // this.progress_bar_in = ['practice', 'main'];
    // styles: chunks, separate or default
    this.progress_bar_style = "default";
    // the width of the progress bar or a single chunk
    this.progress_bar_width = 100;
};
