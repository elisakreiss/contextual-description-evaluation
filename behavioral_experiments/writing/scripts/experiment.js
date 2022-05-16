// customize the experiment by specifying a view order and a trial structure
exp.customize = function() {
    // record current date and time in global_data
    this.global_data.startDate = Date();
    this.global_data.startTime = Date.now();
    // specify view order
    this.views_seq = [
        botcaptcha,
        intro,
        instructions,
        main,
        postTest,
        thanks
    ];

    // for each topic, randomly pick one of the images, and one of the contexts to present
    console.log(main_trials);
    specific_trials = [];
    used_contexts = new Set()
    for(let topic of main_trials) {
        let images = topic["images"];
        image = _.shuffle(images)[0];
        topic['image'] = image;

        let contexts = topic["contexts"];
        contexts = _.shuffle(contexts);
        let i = 0;
        while (used_contexts.has(contexts[i])) // Elisa: changed contexts[0] to contexts[i]
            i++;
        context = contexts[i];
        console.log(context)
        topic['context'] = context;

        used_contexts.add(context);

        specific_trials.push(topic);
    }
    
    //confirmed specific trials for this experiment
    console.log(specific_trials)

    // console.log("attention_checks")
    // console.log(attention_checks)

    // // add attention checks
    // // '...' syntax (spread syntax) means break up the list to make its individual components each a parameter of this function
    // main_trials.push(...attention_checks);

    // randomize main trial order, but keep practice trial order fixed
    this.trial_info.main_trials = _.shuffle(main_trials);
    console.log("Number of stimuli");
    console.log(main_trials.length);
    console.log(this.trial_info.main_trials);

    // adds progress bars to the views listed
    // view's name is the same as object's name
    this.progress_bar_in = ["main"];
    // this.progress_bar_in = ['practice', 'main'];
    // styles: chunks, separate or default
    this.progress_bar_style = "default";
    // the width of the progress bar or a single chunk
    this.progress_bar_width = 100;
};
