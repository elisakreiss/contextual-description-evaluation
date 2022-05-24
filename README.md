# Context Matters for Image Descriptions for Accessibility: Challenges for Referenceless Evaluation Metrics

This is the official Github repository for our paper [Context Matters for Image Descriptions for Accessibility: Challenges for Referenceless Evaluation Metrics](https://arxiv.org/abs/2205.10646). We provide the code and data necessary to replicate our results, as well as complimentary analyses.

In this work, we investigate the potentials and limitations of current referenceless metrics for guiding image-based NLG systems to generate useful image descriptions for the purpose of accessibility. To do so, we recruited blind and low vision (BLV) as well as sighted participants and find that the context an image appears in plays a central role in what makes a useful description. However, current referenceless metrics fall short in capturing the human judgments. Our results suggest that (1) context is essential for creating and evaluating what makes an image description useful for accessibility, and (2) this especially poses a challenge for referenceless metrics that future efforts need to address.

## Behavioral Experiments

To understand what exactly participants went through, we make all experiments available, the way they appeared to the participants.

### Studies

We conducted three main experiments. In the first experiment (**contextualized description writing**), we asked participants to provide descriptions that would make images nonvisually accessible. In contrast to much previous work, however, we presented the images within contexts, here Wikipedia articles.
The experiment can be accessed [here](https://elisakreiss.github.io/contextual-description-evaluation/behavioral_experiments/writing/index.html), built from the code in *behavioral_experiments/writing/*.

The other two experiments (**contextualized description evaluation**) were conducted to evaluate the descriptions written in the previous experiment. We conducted similar evluation experiments with sighted participants, as well as blind and low vision (BLV) participants. The evaluation experiment for sighted users was created similarly to the description writing experiment and can be accessed [here](https://elisakreiss.github.io/contextual-description-evaluation/behavioral_experiments/evaluation_sighted/index.html), built from the code in *behavioral_experiments/evaluation_sighted/*.
The evaluation experiment with BLV users was conducted over Google Forms since it provides an interface that works with a variety of screen readers and operating systems. The study was created using Google's Apps Script coding environment, the code base of which is in *behavioral_experiments/evaluation_blv/apps_script_createForm.js*. An example for the resulting Google Form is available [here](https://docs.google.com/forms/d/e/1FAIpQLSc55qTzLRE-vLYf5OmBLc-6VMPq3LN1vo-qtvDcsJXpmZ7mYw/viewform). Due to the Google Form interface and smaller number of available participants, each participant received a unique study link for completion.

### Analyses

The analyses of the three studies reported in the paper are available in *analyses/analysis.Rmd*, as well as in the rendered README. The data exclusions, and further analyses are available in *analyses/additional_analyses/*.

## Referenceless Metrics

The data and code used for getting the referenceless metrics scores for CLIPScore and SPURTS are in *metrics/* (Figure 3 in the paper).

A CLIPScore variant that we're reporting on as a proof of concept for the promise of integrating context is in *analyses/contextclip/* (Table 1 in the paper).

The investigation on the type of textual purpose that CLIPScore seems to track is in *metrics/* using the data in *metrics/clipscore/concadia_purpose_data*.

All figures are generated in *analyses/analysis.Rmd*.
