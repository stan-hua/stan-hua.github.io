---
title: Principle Component Analysis for Dummies
author: 
date: '2020-10-10'
slug: PCA_for_dummies
categories: []
tags:
  - Data Science
subtitle: ''
summary: 'Looking to get your feet wet but not looking to drown in all the new information? This is a brief overview on what PCA is and how it is used!'
authors: []
lastmod: '2020-10-10T19:59:31-04:00'
featured: no
image:
  caption: ''
  focal_point: ''
  preview_only: no
projects: []
---
<style>
body {background-color: #476e52 !important;}
h3,h4{color: #e3e0bc !important;}
.note{font-size: 10pt;
      line-height: 20pt;
      padding-bottom: 10px}
p{text-indent: 2em;}

details{font-size: 10pt;}
summary{font-size: 100% !important;}
</style>

<div class="note">
<b>DISCLAIMER</b>: This article is an introduction into PCA and does not go into depth into the statistics and code. Tread carefully! 
</div>

---

<h3>OVERVIEW</h3>

PCA or Principle Component Analysis is known for two things: 1) Dimensionality Reduction, and 2) Structure Analysis. However more generally, it is used for **factor extraction**, which is needed in Factor Analysis. 

<div class="note">
<b>NOTE</b>: There are plenty of resources online if you wish to learn more about Factor Analysis, but they will not be covered here!
</div>
<br><br>

<h4>TERMINOLOGY</h4>

So as not to lose anyone, let's define some useful terminology! 
<br><br>

**Features** are what we are measuring. 

<details>
<summary>Example</summary>
<p>Say we have a table with <i>y</i> rows and <i>x</i> columns, then we have <i>x</i> features. Imagine each row being the names of someone you know, and each column measure something distinct about all persons listed (e.g. their height, weight, deepest darkest secrets, etc.). These things we're measuring are the features.</p>
</details>
<br>

**Dimensionality Reduction** is exactly what it sounds like. The goal is to reduce the number of dimensions (i.e. number of features), while retaining *most* information from the original data. Using this to understand underlying structures in the data is the idea behind **Structure Analysis**.

<details>
<summary>Example and Enrichment</summary>
<p>Say you wish to visualize your data, in order to get an understanding of the relationships between each feature. But you have too many features that it becomes impossible to plot them on an x-y graph. How do you visualize without destroying your computer let alone your mind? Simple, you reduce the number of dimensions to 2, so that you can plot it on an x-y graph. </p>
<br><br>
<div class="note">
<b>NOTE</b>: Dimensionality Reduction is different from <i>Feature Selection</i> (e.g. L1 Regularization, L2 Regularization, etc.). The goal of feature selection is to select the most important features. Meanwhile, dimensionality reduction is used to lessen the number of dimensions while capturing the variation in the original data as much as possible.
</div>
</details>
<br>

**Principal Components** are the [1, n] factors extracted from n features using Principal Component Analysis. You can think of them as new axes to view the original data. However, you can no longer interpret the principal components with the same interpretation of the previous features.
<details>
<summary>Enrichment</summary>
If you have 10 features and you do PCA to get 10 factors, they are not the same. If you previously had age, weight, etc., now you simply have axes for data points with no semantic meaning.
</details>




