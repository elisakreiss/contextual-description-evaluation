Evaluation Analysis
================

# Data Setup

``` r
library(tidyverse)
library(here)
library(jsonlite)
library(ggpubr)
library(lme4)
library(lmerTest)
theme_set(theme_bw())
```

``` r
df_clipscores_cosid = read_csv(here("metrics", "clipscore", "results", "cosid-clipscores.csv")) %>% 
  # remove attention checks
  filter(imgstem_version != "guitar",
         imgstem_version != "640px-parc_agen") %>% 
  separate(imgstem_version, into=c("imgstem", "version"), sep="_version") %>% 
  rename(description = texts) %>% 
  select(-text_controls)

df_spurtsmima_cosid = read_csv(here("metrics", "SPURTS", "results", "cosid-spurts-mima.csv")) %>% 
  # TODO: remove attention checks
  # filter(imgstem_version != "guitar",
  #        imgstem_version != "640px-parc_agen") %>%
  rename(description = texts) %>% 
  select(-text_controls)

df_clipscores_cosid_shuffled = read_csv(here("metrics", "clipscore", "results", "cosid-clipscores-shuffled.csv")) %>% 
  # remove attention checks
  filter(imgstem_version != "guitar",
         imgstem_version != "640px-parc_agen") %>% 
  separate(imgstem_version, into=c("imgstem", "version"), sep="_version") %>% 
  rename(description = texts) %>% 
  select(-text_controls)
  
df_blv_ratings = read_csv(here("behavioral_data", "blv_data_criticaltrials.csv"))

df_sighted_ratings = read_csv(here("behavioral_data", "sighted_data_criticaltrials.csv")) %>% 
  filter(description %in% unique(df_blv_ratings$description))
```

``` r
df_blv_avg = df_blv_ratings %>% 
  gather(question, response, q_irrelevance, q_reconstructivity, q_relevance, q_imgfit, q_overall) %>% 
  group_by(description, img_id, context, question) %>% 
  summarize(mean_response = mean(response),
            sd_response = sd(response)) %>% 
  ungroup()

df_sighted_avg = df_sighted_ratings %>% 
  gather(question, response, q_relevance.preimg, q_irrelevance.preimg, q_reconstructivity.preimg, q_overall.preimg, q_relevance.postimg, q_imgfit.preimg, q_imgfit.postimg, q_irrelevance.postimg, q_overall.postimg)  %>% 
  group_by(description, img_id, context, question) %>% 
  summarize(mean_response = mean(response),
            sd_response = sd(response)) %>% 
  ungroup()

df_human_data = df_blv_avg %>%
  rbind(df_sighted_avg)

df_clipscore_human_corr = df_human_data %>% 
  select(description, img_id, context, question, mean_response) %>% 
  merge(df_clipscores_cosid, by=c("description"))

df_spurtsmima_human_corr = df_human_data %>% 
  select(description, img_id, context, question, mean_response) %>% 
  merge(df_spurtsmima_cosid, by=c("description"))
```

# BLV–Sighted Correlation

![](analysis_files/figure-gfm/blv%20sighted%20corr-1.png)<!-- -->

# Human–Length Correlations

``` r
###
# INDIVIDUAL DATA
###
# df_length_blv = df_blv_ratings %>% 
#   select(description, q_reconstructivity, q_relevance, q_irrelevance, q_overall) %>% 
#   gather(question, value, -description)
# 
# df_length_corr = df_sighted_ratings %>% 
#   select(description, q_reconstructivity.preimg, q_relevance.preimg, q_irrelevance.preimg, q_overall.preimg, q_relevance.postimg, q_irrelevance.postimg, q_overall.postimg) %>% 
#   gather(question, value, -description) %>% 
#   rbind(df_length_blv) %>% 
#   mutate(metric = case_when(
#     str_detect(question, "postimg") ~ "sighted_postimg",
#     str_detect(question, "preimg") ~ "sighted_preimg",
#     TRUE ~ "blv"
#   )) %>% 
#   mutate_at(vars(question), funs(str_replace(., "\\.(post|pre)img", ""))) %>% 
#   mutate_at(vars(value), funs(./5))


###
# AVERAGED DATA
###
df_length_corr = df_human_data %>%
  rename(value = mean_response) %>%
  mutate(metric = case_when(
    str_detect(question, "postimg") ~ "sighted_postimg",
    str_detect(question, "preimg") ~ "sighted_preimg",
    TRUE ~ "blv"
  )) %>%
  mutate_at(vars(question), funs(str_replace(., "\\.(post|pre)img", ""))) %>%
  mutate_at(vars(value), funs(./5))


df_length_corr_overall = df_length_corr %>% 
  filter(question == "q_overall") %>%
  select(description, metric, value) %>% 
  mutate(descr_length = str_length(description)) %>% 
  mutate(facet_cond = "Overall")

df_length_corr_reconstr = df_length_corr %>% 
  filter(question == "q_reconstructivity") %>%
  select(description, metric, value) %>% 
  mutate(descr_length = str_length(description)) %>% 
  mutate(facet_cond = "Imaginability")

df_length_corr_imgfit = df_length_corr %>% 
  filter(question == "q_imgfit") %>%
  select(description, metric, value) %>% 
  mutate(descr_length = str_length(description)) %>% 
  mutate(facet_cond = "Fit")

df_length_corr_rel = df_length_corr %>% 
  filter(question == "q_relevance") %>%
  select(description, metric, value) %>% 
  mutate(descr_length = str_length(description)) %>% 
  mutate(facet_cond = "Relevance")

df_length_corr_irrel = df_length_corr %>% 
  filter(question == "q_irrelevance") %>%
  select(description, metric, value) %>% 
  mutate(descr_length = str_length(description)) %>% 
  mutate(facet_cond = "Irrelevance")

df_length_corr_overall %>% 
  rbind(df_length_corr_reconstr) %>%
  # rbind(df_length_corr_imgfit) %>%
  rbind(df_length_corr_rel) %>%
  rbind(df_length_corr_irrel) %>%
  filter(metric %in% c("blv", "sighted_preimg", "sighted_postimg")) %>%
  # filter(metric %in% c("clipscore", "SPURTS_score")) %>%
  mutate_at(vars(facet_cond), funs(fct_relevel(., c("Overall", "Imaginability", "Relevance", "Irrelevance")))) %>%
  ggplot(., aes(x=descr_length, y=value, color=metric)) +
    facet_wrap(~facet_cond, nrow=2) +
    geom_point(alpha=0.2, position=position_jitter(width=0, height=0.07)) +
    theme(legend.position = "top") +
    geom_line(stat="smooth",method = "lm",
              size = 2,
              alpha = 0.8) +
    scale_color_manual(values=c("#E69F00", "#56B4E9", "#009E73")) +
    # scale_color_manual(values=c("black", "grey")) +
    theme(strip.background =element_rect(color="white", fill="white"),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          panel.spacing = unit(1.5, "lines"),
          axis.title = element_text(size=15),
          axis.text = element_text(size=13),
          strip.text.x = element_text(size = 18),
          legend.title = element_text(size=13),
          legend.text = element_text(size=11)) +
    coord_cartesian(ylim=c(0,1)) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0.3) +
    scale_y_continuous(breaks = c(0, 0.5, 1)) +
    scale_x_continuous(breaks = c(0, 250, 500)) +
    xlab("Description length") +
    ylab("Rating")
```

![](analysis_files/figure-gfm/human%20length%20corr-1.png)<!-- -->

``` r
# ggsave(here("analyses", "figures", "raw", "human_length_corr.png"), height=6.3, width=7.5)
```

# Clipscore Compatibility

``` r
df_clipscores_cosid %>% 
  mutate(condition = "in order") %>% 
  rbind(mutate(df_clipscores_cosid_shuffled, condition = "shuffled")) %>% 
  ggplot(., aes(x=condition, y=clipscore)) +
    geom_point(alpha=0.4, position=position_jitter(height=0, width=0.2)) + 
    stat_summary(fun = "mean", 
                 position = position_dodge(0.7),
                 size = 4,
                 geom = "point") +
    stat_summary(fun.data = "mean_cl_boot",
                 geom = "errorbar",
                 position = position_dodge(0.7),
                 size = .4,
                 width = 0.3) +
    theme(strip.background =element_rect(color="white", fill="white"),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          axis.title = element_text(size=13),
          axis.text = element_text(size=11)) +
    scale_y_continuous(breaks = c(0, 0.5, 1)) +
    coord_cartesian(ylim=c(0,1)) +
    ylab("Clipscore") +
    xlab("Image--Description Pairing")
```

![](analysis_files/figure-gfm/clipscore%20compatibility-1.png)<!-- -->

``` r
df_clipscores_cosid %>% 
  mutate(condition = "in order") %>% 
  rbind(mutate(df_clipscores_cosid_shuffled, condition = "shuffled")) %>% 
  group_by(condition) %>% 
  summarize(avg_rating = mean(clipscore)) %>% 
  ungroup()
```

    ## # A tibble: 2 x 2
    ##   condition avg_rating
    ##   <chr>          <dbl>
    ## 1 in order       0.731
    ## 2 shuffled       0.427

``` r
# ggsave(here("analyses", "figures", "raw", "clipscore-truthfulness.png"), height=2.5, width=2.7)
```

# Human–Clipscore Correlations

``` r
clipscore_blvsighted_corr = df_clipscore_human_corr %>% 
  mutate(participant_group = case_when(
    str_detect(question, "preimg") ~ "sighted\n(image not visible)",
    str_detect(question, "postimg") ~ "sighted\n(image visible)",
    TRUE ~ "BLV"
  )) %>% 
  mutate(question_type = str_replace_all(question, "(.postimg|.preimg)", "")) %>% 
  mutate_at(vars(question_type), funs(case_when(
    . == "q_overall" ~ "Overall",
    . == "q_relevance" ~ "Relevance",
    . == "q_irrelevance" ~ "Irrelevance",
    . == "q_reconstructivity" ~ "Imaginability",
    . == "q_imgfit" ~ "Fit",
    TRUE ~ "FIRE"
  ))) %>% 
  mutate_at(vars(question_type), 
            funs(fct_relevel(., c(
              "Overall", 
              "Imaginability", 
              "Relevance", 
              "Irrelevance", 
              "Fit"
              )))) %>% 
  filter(question_type != "Fit")

clipscore_blvsighted_corr %>% 
  ggplot(., aes(x=mean_response, y=clipscore, color=participant_group)) +
  # ggplot(., aes(x=mean_response, y=clipscore, color=question_type)) +
    facet_wrap(~question_type, nrow=2) +
    # facet_wrap(~participant_group, nrow=1) +
    geom_jitter(alpha=0.1) +
    geom_line(stat="smooth",method = "lm",
              size = 1,
              alpha = 0.8) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0) +
    scale_color_manual(values=c("#E69F00", "#009E73", "#56B4E9")) +
    theme(strip.background =element_rect(color="white", fill="white"),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          panel.spacing = unit(1.5, "lines"),
          axis.title = element_text(size=15),
          axis.text = element_text(size=13),
          strip.text.x = element_text(size = 15),
          legend.title = element_text(size=13),
          legend.text = element_text(size=11)) +
    coord_cartesian(ylim=c(0,1), xlim=c(1,5)) +
    # coord_cartesian(xlim=c(1,5)) +
    theme(legend.position = "top") +
    xlab("Mean participant rating") +
    ylab("Clipscore") +
    labs(color='Participant group')  +
    scale_y_continuous(breaks = c(0, 0.5, 1))
```

![](analysis_files/figure-gfm/human%20clipscore%20corr-1.png)<!-- -->

``` r
# ggsave(here("analyses", "figures", "raw", "human_clipscore_corr.png"), height=5.5, width=6)
```

### Non-Averaged

``` r
df_blv_ratings %>% 
  select(description, q_overall) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  ggplot(., aes(x=q_overall, y=clipscore)) +
    geom_jitter(alpha=0.1) +
    geom_line(stat="smooth",method = "lm",
              size = 1,
              alpha = 0.8) +
    # coord_cartesian(ylim=c(0,1), xlim=c(1,5)) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0)
```

![](analysis_files/figure-gfm/human%20clipscore%20corr%20nonavg-1.png)<!-- -->

``` r
df_sighted_ratings %>% 
  filter(description %in% unique(df_blv_avg$description)) %>% 
  select(description, q_overall.preimg) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  ggplot(., aes(x=q_overall.preimg, y=clipscore)) +
    geom_jitter(alpha=0.1) +
    geom_line(stat="smooth",method = "lm",
              size = 1,
              alpha = 0.8) +
    # coord_cartesian(ylim=c(0,1), xlim=c(1,5)) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0)
```

![](analysis_files/figure-gfm/human%20clipscore%20corr%20nonavg-2.png)<!-- -->

``` r
df_sighted_ratings %>% 
  filter(description %in% unique(df_blv_avg$description)) %>% 
  select(description, q_overall.postimg) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  ggplot(., aes(x=q_overall.postimg, y=clipscore)) +
    geom_jitter(alpha=0.1) +
    geom_line(stat="smooth",method = "lm",
              size = 1,
              alpha = 0.8) +
    # coord_cartesian(ylim=c(0,1), xlim=c(1,5)) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0)
```

![](analysis_files/figure-gfm/human%20clipscore%20corr%20nonavg-3.png)<!-- -->

# Human–SPURTS / MIMA Correlations

``` r
spurtsmima_blvsighted_corr = df_spurtsmima_human_corr %>% 
  mutate(participant_group = case_when(
    str_detect(question, "preimg") ~ "sighted\n(image not visible)",
    str_detect(question, "postimg") ~ "sighted\n(image visible)",
    TRUE ~ "BLV"
  )) %>% 
  mutate(question_type = str_replace_all(question, "(.postimg|.preimg)", "")) %>% 
  mutate_at(vars(question_type), funs(case_when(
    . == "q_overall" ~ "Overall",
    . == "q_relevance" ~ "Relevance",
    . == "q_irrelevance" ~ "Irrelevance",
    . == "q_reconstructivity" ~ "Imaginability",
    . == "q_imgfit" ~ "Fit",
    TRUE ~ "FIRE"
  ))) %>% 
  mutate_at(vars(question_type), 
            funs(fct_relevel(., c(
              "Overall", 
              "Imaginability", 
              "Relevance", 
              "Irrelevance", 
              "Fit"
              )))) %>% 
  filter(question_type != "Fit")

spurtsmima_blvsighted_corr %>% 
  ggplot(., aes(x=mean_response, y=SPURTS_score, color=participant_group)) +
  # ggplot(., aes(x=mean_response, y=clipscore, color=question_type)) +
    facet_wrap(~question_type, nrow=2) +
    # facet_wrap(~participant_group, nrow=1) +
    geom_jitter(alpha=0.1) +
    geom_line(stat="smooth",method = "lm",
              size = 1,
              alpha = 0.8) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0.2) +
    scale_color_manual(values=c("#E69F00", "#009E73", "#56B4E9")) +
    theme(strip.background =element_rect(color="white", fill="white"),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          panel.spacing = unit(1.5, "lines"),
          axis.title = element_text(size=15),
          axis.text = element_text(size=13),
          strip.text.x = element_text(size = 15),
          legend.title = element_text(size=13),
          legend.text = element_text(size=11)) +
    coord_cartesian(ylim=c(0,.6), xlim=c(1,5)) +
    # coord_cartesian(xlim=c(1,5)) +
    theme(legend.position = "top") +
    xlab("Mean participant rating") +
    ylab("SPURTS") +
    labs(color='Participant group')  +
    scale_y_continuous(breaks = c(0, 0.5, 1))
```

![](analysis_files/figure-gfm/human%20spurts%20corr-1.png)<!-- -->

``` r
# ggsave(here("analyses", "figures", "raw", "human_spurts_corr.png"), width = 6, height = 5.5)

###
# MIMA
###

# spurtsmima_blvsighted_corr %>% 
#   ggplot(., aes(x=mean_response, y=MIMA_score, color=participant_group)) +
#   # ggplot(., aes(x=mean_response, y=clipscore, color=question_type)) +
#     facet_wrap(~question_type, nrow=2) +
#     # facet_wrap(~participant_group, nrow=1) +
#     geom_jitter(alpha=0.1) +
#     geom_line(stat="smooth",method = "lm",
#               size = 1,
#               alpha = 0.8) +
#     stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0) +
#     scale_color_manual(values=c("#E69F00", "#009E73", "#0072B2")) +
#     theme(strip.background =element_rect(color="white", fill="white"),
#           panel.grid.major = element_blank(),
#           panel.grid.minor = element_blank(),
#           panel.spacing = unit(1.5, "lines"),
#           axis.title = element_text(size=15),
#           axis.text = element_text(size=13),
#           strip.text.x = element_text(size = 15),
#           legend.title = element_text(size=13),
#           legend.text = element_text(size=11)) +
#     coord_cartesian(ylim=c(0,1), xlim=c(1,5)) +
#     # coord_cartesian(xlim=c(1,5)) +
#     theme(legend.position = "top") +
#     xlab("Mean participant rating") +
#     ylab("MIMA") +
#     labs(color='Participant group')  +
#     scale_y_continuous(breaks = c(0, 0.5, 1))
```

# Metrics–Length Correlations

``` r
df_clips_prep = df_clipscores_cosid %>% 
  rename(value=clipscore) %>% 
  mutate(metric="clipscore") %>% 
  select(description, metric, value)

df_spurtsmima_prep = df_spurtsmima_cosid %>%
  gather(metric, value, SPURTS_score, MIMA_score) %>%
  select(description, metric, value)

df_clips_prep %>% 
  rbind(df_spurtsmima_prep) %>% 
  mutate(descr_length = str_length(description)) %>% 
  filter(metric %in% c("clipscore", "SPURTS_score")) %>% 
  ggplot(., aes(x=descr_length, y=value, color=metric)) +
    geom_point(alpha=0.2) +
    theme(legend.position = "top") +
    geom_line(stat="smooth",method = "lm",
              size = 2,
              alpha = 0.8) +
    scale_color_manual(values=c("black", "grey")) +
    theme(strip.background =element_rect(color="white", fill="white"),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          panel.spacing = unit(1.5, "lines"),
          axis.title = element_text(size=13),
          axis.text = element_text(size=11),
          strip.text.x = element_text(size = 18),
          legend.position = "none") +
    coord_cartesian(ylim=c(0,1)) +
    stat_cor(method = "pearson", label.x.npc = "middle", label.y.npc = 0.01) +
    scale_y_continuous(breaks = c(0, 0.5, 1)) +
    scale_x_continuous(breaks = c(0, 250, 500)) +
    xlab("Description length") +
    ylab("Score")
```

![](analysis_files/figure-gfm/metrics%20length%20corr-1.png)<!-- -->

``` r
# ggsave(here("analyses", "figures", "raw", "metrics_length_corr.png"), height=2.5, width=3)
```

# Stats

### Context Effects in Human Evaluations

``` r
df_stats_blv_overall = df_blv_ratings %>% 
  select(description, q_overall, q_reconstructivity, q_relevance, q_irrelevance, participant) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  merge(df_spurtsmima_cosid, by=c("description")) %>% 
  mutate(description_length = str_length(description)) %>%
  mutate(description_length_scaled = description_length / max(description_length)) %>%
  mutate(overall_rating = ((q_overall - 1) / 4)) %>% 
  mutate_at(vars(q_reconstructivity, q_relevance, q_irrelevance), funs(((. - 1) / 4))) %>% 
  mutate_at(vars(q_reconstructivity, q_relevance, q_irrelevance), funs(. - mean(.)))

f = overall_rating ~ q_irrelevance + q_reconstructivity + q_relevance + (1|participant) + (1|description)

m = lmer(f, df_stats_blv_overall)
summary(m)
```

    ## Linear mixed model fit by REML. t-tests use Satterthwaite's method [
    ## lmerModLmerTest]
    ## Formula: f
    ##    Data: df_stats_blv_overall
    ## 
    ## REML criterion at convergence: -42.7
    ## 
    ## Scaled residuals: 
    ##      Min       1Q   Median       3Q      Max 
    ## -3.01300 -0.55167  0.05034  0.66173  2.29789 
    ## 
    ## Random effects:
    ##  Groups      Name        Variance Std.Dev.
    ##  description (Intercept) 0.004223 0.06498 
    ##  participant (Intercept) 0.011257 0.10610 
    ##  Residual                0.039379 0.19844 
    ## Number of obs: 272, groups:  description, 68; participant, 16
    ## 
    ## Fixed effects:
    ##                     Estimate Std. Error        df t value Pr(>|t|)    
    ## (Intercept)          0.54044    0.03017  15.78816  17.911 6.54e-12 ***
    ## q_irrelevance        0.04123    0.04816 266.79624   0.856    0.393    
    ## q_reconstructivity   0.42069    0.05853 265.74745   7.188 6.65e-12 ***
    ## q_relevance          0.43989    0.05400 261.49858   8.146 1.56e-14 ***
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Correlation of Fixed Effects:
    ##             (Intr) q_rrlv q_rcns
    ## q_irrelevnc  0.000              
    ## q_rcnstrctv  0.000 -0.047       
    ## q_relevance  0.000 -0.349 -0.493

``` r
df_stats_sighted_overall = df_sighted_ratings %>% 
  select(description, q_overall.preimg, q_reconstructivity.preimg, q_relevance.preimg, q_irrelevance.preimg, anon_worker_id) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  merge(df_spurtsmima_cosid, by=c("description")) %>% 
  mutate(description_length = str_length(description)) %>%
  mutate(description_length_scaled = description_length / max(description_length)) %>%
  mutate(overall_rating = ((q_overall.preimg - 1) / 4)) %>% 
  mutate_at(vars(q_reconstructivity.preimg, q_relevance.preimg, q_irrelevance.preimg), funs(((. - 1) / 4))) %>% 
  mutate_at(vars(q_reconstructivity.preimg, q_relevance.preimg, q_irrelevance.preimg), funs(. - mean(.)))

f = overall_rating ~ q_reconstructivity.preimg + q_relevance.preimg + q_irrelevance.preimg + (1|anon_worker_id) + (1|description)

m = lmer(f, df_stats_sighted_overall)
```

    ## boundary (singular) fit: see ?isSingular

``` r
summary(m)
```

    ## Linear mixed model fit by REML. t-tests use Satterthwaite's method [
    ## lmerModLmerTest]
    ## Formula: f
    ##    Data: df_stats_sighted_overall
    ## 
    ## REML criterion at convergence: -236
    ## 
    ## Scaled residuals: 
    ##     Min      1Q  Median      3Q     Max 
    ## -3.8723 -0.5268  0.0560  0.5334  4.0460 
    ## 
    ## Random effects:
    ##  Groups         Name        Variance Std.Dev.
    ##  description    (Intercept) 0.000000 0.00000 
    ##  anon_worker_id (Intercept) 0.006765 0.08225 
    ##  Residual                   0.029154 0.17075 
    ## Number of obs: 449, groups:  description, 68; anon_worker_id, 58
    ## 
    ## Fixed effects:
    ##                            Estimate Std. Error        df t value Pr(>|t|)    
    ## (Intercept)                 0.60915    0.01358  55.84246  44.849  < 2e-16 ***
    ## q_reconstructivity.preimg   0.31024    0.03788 444.43531   8.189 2.82e-15 ***
    ## q_relevance.preimg          0.58613    0.03402 444.95210  17.231  < 2e-16 ***
    ## q_irrelevance.preimg        0.08078    0.02555 440.95733   3.161  0.00168 ** 
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Correlation of Fixed Effects:
    ##             (Intr) q_rcn. q_rlv.
    ## q_rcnstrct. -0.007              
    ## q_rlvnc.prm  0.004 -0.394       
    ## q_rrlvnc.pr  0.002  0.034 -0.412
    ## optimizer (nloptwrap) convergence code: 0 (OK)
    ## boundary (singular) fit: see ?isSingular

``` r
df_stats_sighted_overall = df_sighted_ratings %>% 
  select(description, q_overall.postimg, q_reconstructivity.preimg, q_relevance.postimg, q_irrelevance.postimg, anon_worker_id) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  merge(df_spurtsmima_cosid, by=c("description")) %>% 
  mutate(description_length = str_length(description)) %>%
  mutate(description_length_scaled = description_length / max(description_length)) %>%
  mutate(overall_rating = ((q_overall.postimg - 1) / 4)) %>% 
  mutate_at(vars(q_reconstructivity.preimg, q_relevance.postimg, q_irrelevance.postimg), funs(((. - 1) / 4))) %>% 
  mutate_at(vars(q_reconstructivity.preimg, q_relevance.postimg, q_irrelevance.postimg), funs(. - mean(.)))

f = overall_rating ~ q_reconstructivity.preimg + q_relevance.postimg + q_irrelevance.postimg + (1|anon_worker_id) + (1|description)

m = lmer(f, df_stats_sighted_overall)
summary(m)
```

    ## Linear mixed model fit by REML. t-tests use Satterthwaite's method [
    ## lmerModLmerTest]
    ## Formula: f
    ##    Data: df_stats_sighted_overall
    ## 
    ## REML criterion at convergence: -222.6
    ## 
    ## Scaled residuals: 
    ##     Min      1Q  Median      3Q     Max 
    ## -3.2247 -0.5427  0.0333  0.5050  4.2680 
    ## 
    ## Random effects:
    ##  Groups         Name        Variance Std.Dev.
    ##  description    (Intercept) 0.001439 0.03794 
    ##  anon_worker_id (Intercept) 0.009237 0.09611 
    ##  Residual                   0.028003 0.16734 
    ## Number of obs: 449, groups:  description, 68; anon_worker_id, 58
    ## 
    ## Fixed effects:
    ##                            Estimate Std. Error        df t value Pr(>|t|)    
    ## (Intercept)                 0.62250    0.01573  57.68708  39.572  < 2e-16 ***
    ## q_reconstructivity.preimg   0.23179    0.03687 444.70594   6.286 7.79e-10 ***
    ## q_relevance.postimg         0.58772    0.03136 430.56769  18.742  < 2e-16 ***
    ## q_irrelevance.postimg       0.16240    0.02734 354.97726   5.940 6.79e-09 ***
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Correlation of Fixed Effects:
    ##             (Intr) q_rcn. q_rlv.
    ## q_rcnstrct. -0.011              
    ## q_rlvnc.pst  0.011 -0.263       
    ## q_rrlvnc.ps -0.004 -0.026 -0.428

### Clipscore Compatibility

``` r
df_clipscorecomp_model = df_clipscores_cosid %>% 
  mutate(condition = "in order") %>% 
  rbind(mutate(df_clipscores_cosid_shuffled, condition = "shuffled")) %>% 
  mutate(cond_enc = ifelse(condition=="in order", 1, 0))

f = cond_enc ~ clipscore

m = lm(f, df_clipscorecomp_model)
summary(m)
```

    ## 
    ## Call:
    ## lm(formula = f, data = df_clipscorecomp_model)
    ## 
    ## Residuals:
    ##      Min       1Q   Median       3Q      Max 
    ## -1.22104 -0.14592  0.05425  0.20897  0.49727 
    ## 
    ## Coefficients:
    ##             Estimate Std. Error t value Pr(>|t|)    
    ## (Intercept) -0.66944    0.08443  -7.929 7.69e-13 ***
    ## clipscore    2.02072    0.13834  14.607  < 2e-16 ***
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Residual standard error: 0.3129 on 134 degrees of freedom
    ## Multiple R-squared:  0.6142, Adjusted R-squared:  0.6114 
    ## F-statistic: 213.4 on 1 and 134 DF,  p-value: < 2.2e-16

### SPURTS Effect of Description Length

``` r
df_stats_blv_overall = df_blv_ratings %>% 
  select(description, q_overall, participant) %>% 
  merge(df_clipscores_cosid, by=c("description")) %>% 
  merge(df_spurtsmima_cosid, by=c("description")) %>% 
  mutate(description_length = str_length(description)) %>%
  mutate(description_length_scaled = description_length / max(description_length)) %>%
  mutate(overall_rating = ((q_overall - 1) / 4))

f = overall_rating ~ clipscore + (1|participant) + (1|description)
f = overall_rating ~ description_length_scaled + SPURTS_score + (1|participant) + (1|description)
# f = overall_rating ~ description_length_scaled + MIMA_score + (1|participant+description)

m = lmer(f, df_stats_blv_overall)
summary(m)
```

    ## Linear mixed model fit by REML. t-tests use Satterthwaite's method [
    ## lmerModLmerTest]
    ## Formula: f
    ##    Data: df_stats_blv_overall
    ## 
    ## REML criterion at convergence: 103.5
    ## 
    ## Scaled residuals: 
    ##      Min       1Q   Median       3Q      Max 
    ## -2.40409 -0.66385  0.08392  0.69046  2.36476 
    ## 
    ## Random effects:
    ##  Groups      Name        Variance Std.Dev.
    ##  description (Intercept) 0.012570 0.11212 
    ##  participant (Intercept) 0.008711 0.09333 
    ##  Residual                0.069124 0.26291 
    ## Number of obs: 272, groups:  description, 68; participant, 16
    ## 
    ## Fixed effects:
    ##                           Estimate Std. Error       df t value Pr(>|t|)    
    ## (Intercept)                0.05814    0.18123 68.98341   0.321   0.7493    
    ## description_length_scaled  0.64027    0.14641 64.36529   4.373 4.57e-05 ***
    ## SPURTS_score               0.79164    0.44190 66.59507   1.791   0.0778 .  
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Correlation of Fixed Effects:
    ##             (Intr) dscr__
    ## dscrptn_ln_  0.297       
    ## SPURTS_scor -0.972 -0.451

``` r
f = overall_rating ~ description_length_scaled + SPURTS_score
f = overall_rating ~ description_length_scaled
f = overall_rating ~ SPURTS_score

m = lm(f, df_stats_blv_overall)
summary(m)
```

    ## 
    ## Call:
    ## lm(formula = f, data = df_stats_blv_overall)
    ## 
    ## Residuals:
    ##     Min      1Q  Median      3Q     Max 
    ## -0.6819 -0.2170  0.0258  0.2289  0.6440 
    ## 
    ## Coefficients:
    ##              Estimate Std. Error t value Pr(>|t|)    
    ## (Intercept)   -0.1910     0.1537  -1.243    0.215    
    ## SPURTS_score   1.6950     0.3534   4.796 2.68e-06 ***
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## Residual standard error: 0.3149 on 270 degrees of freedom
    ## Multiple R-squared:  0.07851,    Adjusted R-squared:  0.07509 
    ## F-statistic:    23 on 1 and 270 DF,  p-value: 2.678e-06
