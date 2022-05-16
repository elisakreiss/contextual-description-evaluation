function createForm() {  

  // Load data
  var sheet = SpreadsheetApp.openById("1CvTJFzBB54n9rdKKOMssiigB77di4-oqflsUBLKJqmg");
  var data = sheet.getDataRange().getValues();
  var trials = [];
  for (var i = 1; i < data.length; i++) {
    var dict_data = {};
    dict_data["description"] = data[i][0];
    dict_data["article"] = data[i][2];
    dict_data["paragraph"] = data[i][7];
    q1 = data[i][3].split(":::");
    q2 = data[i][4].split(":::");
    q3 = data[i][5].split(":::");
    q4 = data[i][6].split(":::");
    dict_data["q1"] = q1[0];
    dict_data["q1_left"] = q1[1];
    dict_data["q1_right"] = q1[2];
    dict_data["q2"] = q2[0];
    dict_data["q2_left"] = q2[1];
    dict_data["q2_right"] = q2[2];
    dict_data["q3"] = q3[0];
    dict_data["q3_left"] = q3[1];
    dict_data["q3_right"] = q3[2];
    dict_data["q4"] = q4[0];
    dict_data["q4_left"] = q4[1];
    dict_data["q4_right"] = q4[2];

    trials.push(dict_data);
    // Logger.log('Article: ' + data[i][0]);
    // Logger.log('Paragraph: ' + data[i][1]);
    // Logger.log('Description: ' + data[i][2]);
    // Logger.log('Question: ' + data[i][3]);
  }
  

   // create & name Form  
   var item = "Image Accessibility Study";  
   var form = FormApp.create(item)  
       .setTitle(item);  
    var about = form.addSectionHeaderItem();
    about.setTitle("About the study")
              .setHelpText("Thank you for your participation in this study! After submitting your response, we will check your responses and reach out to you within 3 days to send you your compensation in the form of a $50 Amazon coupon over email. If you cannot accept an Amazon gift card, please contact stanfordstudyhelp@icloud.com and we will try to purchase a different gift card. The survey should take about 60 minutes to complete.");
    
    var startTime = form.addTextItem();
    startTime.setTitle("Please enter your start time! What time is it for you right now?")
             .setRequired(true);

    var testinfo = form.addSectionHeaderItem();
    testinfo.setTitle("Accessibility Information")
              .setHelpText("This survey has been tested and works with the latest versions of the Chrome and Firefox browsers on Windows with the JAWS and NVDA screen readers, and with the Safari browser with the VoiceOver screen reader on MacOS and iOS. Since there will be more open-ended questions, we recommend using a keyboard for completing the survey. Please email stanfordstudyhelp@icloud.com if you have questions or if you need assistance completing the survey.");
    
    var orientationinfo = form.addSectionHeaderItem();
    orientationinfo.setTitle("Survey Orientation Information")
              .setHelpText("This paragraph explains the structure of this survey. Please read it so you do not miss any information as you are taking the survey. This survey is divided into 3 introductory pages, 19 pages of the main survey, and 1 page with post-survey questions. Each page has a few types of information. Titles will be marked as headings. Instructions are preceded by heading level 2 and questions are preceded by heading level 3. Please read the paragraphs under each heading. Finally, most pages of the survey will contain some multiple choice and some open ended questions. Each page of the survey will reveal how many questions you can expect to find on that page of the survey.");

    var legal_info = form.addSectionHeaderItem();
    legal_info.setTitle("Legal Information")
              .setHelpText("We invite you to participate in a research study on language production and comprehension.\nThis experiment will ask you to do linguistic tasks requiring you to read sentences or words, and answer questions about them.\n\nYou will be paid for your participation at the posted rate.\n\nThere are no risks or benefits of any kind involved in this study.\n\nIf you have read this form and have decided to participate in this experiment, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. You have the right to refuse to do particular tasks. Your individual privacy will be maintained in all published and written data resulting from the study.\nYou may print this form for your records.\n\nCONTACT INFORMATION:\nIf you have any questions, concerns or complaints about this research study, its procedures, risks and benefits, you should contact the Protocol Director Meghan Sumner at \n(650)-725-9336\n\nIf you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906. You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306 USA.\n\nIf you agree to participate, please proceed to the study tasks by pressing the 'next' button.");
  

    var eligibility = form.addMultipleChoiceItem()
       .setTitle("Eligibility")  
       .setHelpText("Please only participate in this study if all of the following three statements are true for you.\n(1) You have low vision or are blind and you complete most computer and smartphone tasks with a screen reader,\n(2) you are proficient in English,\n(3) you are located within the US.")
       .setRequired(true);
    var yesChoice = eligibility.createChoice("Yes, this applies to me.", FormApp.PageNavigationType.CONTINUE);
    var noChoice = eligibility.createChoice("No, this doesn't apply to me.", FormApp.PageNavigationType.SUBMIT);
    eligibility.setChoices([yesChoice, noChoice]);
  
   // radiobuttons  
   item = "Please read the following paragraph and select the statement that is correct according to the paragraph from the five statements listed below.";  
   var paragraph = "Images are pervasive across the Web -- they're embedded in news articles, tweets, and shopping websites but most of them are not accessible to people who rely on screen readers such as blind users. For instance, much less than 6% of all images on English-language Wikipedia have useful descriptions that would make them accessible. Recent work in computer science is trying to combat this issue.";
   var choices = ["Image accessibility has been solved in recent years.", "6% of all images are uploaded by English-language speaking users.", "Blind people make up 6% of Wikipedia's daily users.", "Recent research is trying to figure out how to make images accessible.", "Wikipedia has the least amount of images compared to other popular websites."];  

   var i, j, temp;
   for (i = choices.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = choices[i];
      choices[i] = choices[j];
      choices[j] = temp;
   }

   form.addPageBreakItem();
  //  langcomp.setTitle("Language comprehension");
   langcomp = form.addMultipleChoiceItem()
       .setTitle(item)  
       .setHelpText(paragraph)
       .setChoiceValues(choices)  
       .setRequired(true);  
    
    var intro_view = form.addPageBreakItem();
    intro_view.setTitle('Introduction')
           .setHelpText("The images in Wikipedia articles often have image descriptions to make them more accessible in case they can't be seen (such as being read aloud by screen readers for blind and low vision users). In this study, you're given several articles that are paired with image descriptions written to make an image accessible. You'll be asked to rate the image descriptions by answering questions. The first 5 questions will be multiple choice, and the remaining 4 questions can be answered in free text. There will be two carefully-written image descriptions posed as questions to check that you are paying attention.");

    for (var trial_id = 0; trial_id < trials.length; trial_id++) {
    // for (var trial_id = 0; trial_id < 1; trial_id++) {
      Logger.log("Trial_id: " + trial_id);
      var trial_one = form.addPageBreakItem();
      trial_one.setTitle("Evaluation " + String(parseInt(trial_id) + 1) + "/19")
              .setHelpText("Please, read the following introductory paragraph of a Wikipedia article and the associated image description. Then answer the 9 questions.");
      trial_one = form.addSectionHeaderItem();
      trial_one.setTitle("Wikipedia article: " + trials[trial_id]["article"])
              .setHelpText(trials[trial_id]["paragraph"]);
      
      trial_one = form.addSectionHeaderItem();
      trial_one.setTitle("Image Description: " + trials[trial_id]["description"])

      var helptext = "As a reminder, here are again the title of the Wikipedia article and the image description." + "\nWikipedia article: " + trials[trial_id]["article"] + "\nImage Description: " + trials[trial_id]["description"]

      trial_one = form.addScaleItem();
      trial_one.setTitle("1) " + trials[trial_id]["q1"] + "\n(Scaled from 1, " + trials[trial_id]["q1_left"] + ", to 5, "  + trials[trial_id]["q1_right"] + ")")
              .setHelpText(helptext)
              .setBounds(1, 5)
              .setLabels(trials[trial_id]["q1_left"], trials[trial_id]["q1_right"])
              .setRequired(true);

      trial_one = form.addScaleItem();
      trial_one.setTitle("2) " + trials[trial_id]["q2"] + "\n(Scaled from 1, " + trials[trial_id]["q2_left"] + ", to 5, "  + trials[trial_id]["q2_right"] + ")")
              .setHelpText(helptext)
              .setBounds(1, 5)
              .setLabels(trials[trial_id]["q2_left"], trials[trial_id]["q2_right"])
              .setRequired(true);
      
      trial_one = form.addScaleItem();
      trial_one.setTitle("3) " + trials[trial_id]["q3"] + "\n(Scaled from 1, " + trials[trial_id]["q3_left"] + ", to 5, "  + trials[trial_id]["q3_right"] + ")")
              .setHelpText(helptext)
              .setBounds(1, 5)
              .setLabels(trials[trial_id]["q3_left"], trials[trial_id]["q3_right"])
              .setRequired(true);

      trial_one = form.addScaleItem();
      trial_one.setTitle("4) " + trials[trial_id]["q4"] + "\n(Scaled from 1, " + trials[trial_id]["q4_left"] + ", to 5, "  + trials[trial_id]["q4_right"] + ")")
              .setHelpText(helptext)
              .setBounds(1, 5)
              .setLabels(trials[trial_id]["q4_left"], trials[trial_id]["q4_right"])
              .setRequired(true);
      
      trial_one = form.addScaleItem();
      // trial_one.setTitle("5) For accessibility, how good is the description overall?\n(Scaled from 1, Not good, to 5, Very good)")
      trial_one.setTitle("5) How good is the description for overall nonvisual accessibility?\n(Scaled from 1, Not good, to 5, Very good)")
              .setHelpText(helptext)
              .setBounds(1, 5)
              .setLabels("Not good", "Very good")
              .setRequired(true);
      
      trial_one = form.addParagraphTextItem();
      trial_one.setTitle("6) Write any remaining questions that you would ask about this image, which would help you to understand it in the context of the Wikipedia article.")
               .setHelpText(helptext);

      trial_one = form.addParagraphTextItem();
      trial_one.setTitle("7) Write anything that you found particularly good about the description.")
               .setHelpText(helptext);

      trial_one = form.addParagraphTextItem();
      trial_one.setTitle("8) Write anything that you found particularly bad about the description.")
               .setHelpText(helptext);
      
      Logger.log("Done writing!")

      trial_one = form.addParagraphTextItem();
      trial_one.setTitle("9) Write any additional comments about this image description here.")
               .setHelpText(helptext);
    };

    Logger.log('Postview!');

    var postquest_view = form.addPageBreakItem();
    postquest_view.setTitle('Final Questions')
           .setHelpText("Finally, please answer the following 9 questions about the study and yourself.");
    
    Logger.log('Q1');
    
    postquest_view = form.addTextItem();
    postquest_view.setTitle('1) Please describe your level of vision.')
           .setRequired(true);
    
    Logger.log('Q2');

    postquest_view = form.addMultipleChoiceItem();
    postquest_view.setTitle('2) How often do you rely on screen readers?')
          //  .setHelpText("Some followups")
           .setChoices([
              postquest_view.createChoice('Always (More than 95% of the time you use computers)'),
              postquest_view.createChoice('Very often (Between 75 and 95% of the time you use computers)'),
              postquest_view.createChoice('Often (Between 35 and 75% of the time you use computers)'),
              postquest_view.createChoice('Rarely (Between 5 and 35% of the time you use computers)'),
              postquest_view.createChoice('Never (Less than 5% of the time you use computers)')
            ])
    // .showOtherOption(true)
    .setRequired(true);

    Logger.log('Q3');

    postquest_view = form.addTextItem();
    postquest_view.setTitle('3) If you used a screen reader, which screen reader did you use to access this study?');

    Logger.log('Q4');

    postquest_view = form.addTextItem();
    postquest_view.setTitle('4) Which internet browser and operating system did you use?');

    Logger.log('Q5');

    postquest_view = form.addTextItem();
    postquest_view.setTitle('5) What is your age?');

    Logger.log('Q6');

    postquest_view = form.addTextItem();
    postquest_view.setTitle('6) What is your gender?');

    Logger.log('Q7');

    postquest_view = form.addMultipleChoiceItem();
    postquest_view.setTitle('7) Was the study clear?')
           .setChoices([
              postquest_view.createChoice('Study was clear'),
              postquest_view.createChoice('Some confusions about the study'),
              postquest_view.createChoice('Major confusions about the study'),
              postquest_view.createChoice('Prefer not to respond')
            ])
            .showOtherOption(false);
    
    Logger.log('Q8');

    postquest_view = form.addTextItem();
    postquest_view.setTitle('8) Write any additional feedback here.');

    Logger.log('Q9');

    var endTime = form.addTextItem();
    endTime.setTitle("9) Finally, enter your end time! What time is it for you right now?")
           .setRequired(true);

    Logger.log('Almost done!');

    Logger.log('Published URL: ' + form.getPublishedUrl());
    Logger.log('Editor URL: ' + form.getEditUrl());
 }