import torch
import clip
from PIL import Image
import editdistance
import pandas as pd
import os
import scipy.stats
import numpy as np

# Calculate cosine similarity between image, description, and context embeddings
def get_sims(image_features, description_features, context_features):
    image_features_norm = image_features / image_features.norm(dim=-1, keepdim=True)
    description_features_norm = description_features / description_features.norm(dim=-1, keepdim=True)
    context_features_norm = context_features / context_features.norm(dim=-1, keepdim=True)

    results = [[
        "contextclip", (
            context_features@description_features_norm.T +
            description_features@(image_features_norm - context_features_norm).T
        ).item()
    ]]

    return results

# Handle slight differences in image names due to different naming conventions, file extensions, and accents
def get_image_approx(filelist, image_name, image_root):
    closest_name = None
    target_name = f"{image_name}_version1.jpg"
    if target_name not in filelist:
        target_name = min(filelist, key=lambda filename: editdistance.eval(
            f'{image_name}_version1.jpg', filename))
    image = Image.open(f"{image_root}/{target_name}")
    return image, closest_name

# Calculate description, context, and image embeddings using a CLIP model
def get_embeddings(model, preprocess, sightedness, metrics, image_root, aggregate=False):
    path = f'context_{sightedness}_data.csv'
    filelist = os.listdir(image_root)
    image_embeddings = {}
    description_embeddings = {}
    context_embeddings = {}

    df = pd.read_csv(path, encoding="utf-8")
    total_results = {}
    with torch.inference_mode():
        for _, row in list(df.iterrows()):
            img = row['imgstem']
            img_description = row['img_id'] + row['description']
            if not aggregate:
                img_description += row['participant']

            if img_description in total_results:
                total_results[img_description]['scores'].append(
                    [row[metric] for metric in metrics])
            else:
                if (row['img_id'] not in image_embeddings):
                    image, _ = get_image_approx(filelist, img, image_root)
                    image = preprocess(image).unsqueeze(0).to(device)
                    image_encoding = model.encode_image(
                        image.to(torch.float16))
                    image_embeddings[row['img_id']] = image_encoding
                else:
                    image_encoding = image_embeddings[row['img_id']]

                if row['description'] not in description_embeddings:
                    description_encoding = clip.tokenize(
                        ["A photo depicts " + row['description']], truncate=True).to(device)
                    description_encoding = model.encode_text(
                        description_encoding)
                    description_embeddings[row['description']
                                           ] = description_encoding
                else:
                    description_encoding = description_embeddings[row['description']]

                if row['article_text'] not in context_embeddings:
                    context_encoding = clip.tokenize(
                        [row['article_text']], truncate=True).to(device)
                    context_encoding = model.encode_text(context_encoding)
                    context_embeddings[row['article_text']] = context_encoding
                else:
                    context_encoding = context_embeddings[row['article_text']]

                total_results[img_description] = {}
                total_results[img_description]['image_embedding'] = image_encoding
                total_results[img_description]['description_embedding'] = description_encoding
                total_results[img_description]['context_embedding'] = context_encoding
                total_results[img_description]['scores'] = [
                    [row[metric] for metric in metrics]]
    return total_results

# Evaluate the predictiveness of a set of score methods
def eval_scores(image_embeddings, description_embeddings, context_embeddings, scores, all_results=None):
    all_scores = []
    for img_enc, desc_enc, wiki_enc, score in zip(image_embeddings, description_embeddings, context_embeddings, scores):
        new_score = get_sims(img_enc, desc_enc, wiki_enc)
        all_scores.append([new_score, score])
    score_types = [score[0:-1] for score in all_scores[0][0]]
    all_scores_overall = [
        [[score[-1] for score in all_score[0]], all_score[-1]] for all_score in all_scores]
    for score_type_idx in range(len(all_scores_overall[0][0])):
        for metric_idx in range(len(all_scores_overall[0][-1])):
            x = []
            y = []
            for example in all_scores_overall:
                x.append(example[0][score_type_idx])
                y.append(example[1][metric_idx])
            if len(np.asarray(x).shape) != 1:
                x = np.asarray(x).mean(1)
            r_value = scipy.stats.linregress(x, y)[2]
            score_name = "@".join(score_types[score_type_idx])
            if score_name not in all_results:
                all_results[score_name] = [r_value]
            else:
                all_results[score_name] += [r_value]
    return all_results

# Convert results to a set of lists
def results_to_row(total_results):
    image_embeddings = []
    description_embeddings = []
    context_embeddings = []
    scores = []

    for _, result in total_results.items():
        image_embeddings.append(result['image_embedding'])
        description_embeddings.append(result['description_embedding'])
        context_embeddings.append(result['context_embedding'])
        scores.append(np.mean(result['scores'], axis=0))

    return image_embeddings, description_embeddings, context_embeddings, scores


def evaluate(model_name):
    model, preprocess = clip.load(model_name, device=device)
    for sightedness in sightednesses:
        if sightedness == "blv":
            metrics = blv_metrics
        if sightedness == "sighted":
            metrics = sighted_metrics
        for cur_metric in metrics:
            all_results = {}
            model.eval()
            total_results = get_embeddings(model, preprocess, sightedness, [cur_metric], image_root, aggregate=True)
            image_embeddings, description_embeddings, context_embeddings, scores = results_to_row(
                total_results)
            eval_scores(image_embeddings, description_embeddings,
                        context_embeddings, scores, all_results)
            print(model_name, sightedness, cur_metric, end=" ")
            for score_type, value in all_results.items():
                print(score_type, "%.3f" % value[0], end=" ")
            print()

if __name__ == "__main__":
    sightednesses = ['blv', 'sighted']  # Sightedness to evaluate

    # Metrics to evaluate for BLV users
    blv_metrics = [
        'q_reconstructivity', 'q_relevance', 'q_irrelevance',
        'q_overall'
    ]

    # Metrics to evaluate for sighted users
    sighted_metrics = [
        'q_reconstructivity.preimg', 'q_relevance.preimg', 'q_irrelevance.preimg',
        'q_overall.preimg',
        'q_relevance.postimg', 'q_irrelevance.postimg',
        'q_overall.postimg',
    ]
    all_metrics = blv_metrics + sighted_metrics

    device = "cuda" if torch.cuda.is_available() else "cpu"
    image_root = "../../metrics/clipscore/cosid_data/cosid_images/"
    if device == 'cpu':
        print("Caution: if you would like to reproduce the paper results exactly, you need to run this on a GPU!")
    evaluate("ViT-B/32")