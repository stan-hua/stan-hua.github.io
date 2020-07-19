---
title: Save the Pandas...library
author: ''
date: '2020-07-11'
slug: useful
categories:
  - Python
tags: [Python Libraries]
subtitle: ''
summary: 'Amassing a collection of useful Python Pandas library commands!'
authors: []
lastmod: '2020-07-18'
featured: no
image:
  caption: ''
  focal_point: ''
  preview_only: no
projects: []
draft: FALSE
---
<style>

.bod{
  font-family: Arial;
  font-size: 11pt;
  display: inline-block;
  margin-left: 10px;
}

h2{
  text-decoration: underline;
  line-height: 5pt;
  text-align: center;
  padding-top: 30px;
}
h3{ 
  display: list-item;
  list-style-type: disc;
  list-style-position: inside;
  font-size:17px;
  font-family:"Cambria";
}
</style>

By convention, "***df***" will refer to a dataframe object, while "***Series***" will refer to a series object.

---

## Importing

### Importing the Libraries

```
import pandas as pd
import numpy as np        #NumPy library required by Pandas library
```

### Read csv file data

```
df = pd.read_csv(file_path, index_col=None)
```

## About dataset

### Check column names

```
df.columns

Series.name
```

### Check shape of object

```
df.shape

Series.shape
```

### Columns of a specific data type type

```
df.dtypes == 'object'
```

### Describe data

```
df.describe()
```



<!-- ### -->

<!-- ``` -->

<!-- ``` -->

<!-- <br> -->

## Handling data

### Apply (a function on a pandas object)

```
df.apply(FUN, axis=0, *args)    #FUN: any (valid) function to apply
                                #axis: axis to assess
                                #*args: additional keyword arguments for FUN
```

### Filter

```
df.filter(items=, like=None)
```

### Get Dummies    (aka One Hot Encoding)

```
df.get_dummies(dummy_na=False, columns=None, sparse=False, drop_first=False, dtype=np.uint8)
        #dummy_na: if True, adds dummy column for NA
        #columns: if !None, columns specified will be one hot encoded
        #sparse: whether resulting columns will be SparseArray objects (True) or NumPy arrays(False) 
        #drop_first: removes first unique dummy variable from unique objects in column
        #dtype: data type for new columns (e.g. float)


Series.get_dummies(dummy_na=False, columns=None, sparse=False, drop_first=False, dtype='np.uint8')
```

### Handling NA

```
#Finding NA and inverse
df.isna()
Series.isna()

df.notna()
Series.isna()


#Dropping NA
df.dropna(axis=0, how='any', thresh=None, subset=None, inplace=False)
        #axis: axis to assess
        #how: when to drop axis (e.g. how='all' drops IFF all values are NA)
        #thresh: number of NAs in axis to drop
        #subset: labels on axis to be considered
        #inplace: by default, returns new object. If True, modifies existing object
        
Series.dropna(axis=0, how=None,inplace=False)


#Filling NA
df.fillna(value=None, method=None, axis=None, inplace=False, limit=None)
        #value: value to fill holes
        #method: method for filling holes.*
        #inplace: by default, returns new object. If True, modifies existing object
        #limit: max number of consecutive NAs to fill. Will be left as NA if value is exceeded

Series.fillna(value=None, method=None, axis=None, inplace=False, limit=None)
```

### Piping data through multiple functions

```
(df.pipe(FUN1)
    .pipe(FUN2, arg1=foo)                  
    .pipe((FUN3, "arg2"), arg1=bar)        #when FUN3's main arg. is not df, supply tuple
                                                where str contains location for df (e.g. "arg2")
)
```

<p class='bod'> <b>NOTE</b>: similar to %>% operation in R. </p>

### Unique vs Nunique

```
for col in df.columns:    #for loop to get column names
  df[col].unique()            #returns unique values in column 'col'
  df[col].nunique()           #returns unique values in column AND drop NAs
```


<!-- ###  -->

<!-- ``` -->

<!-- ``` -->
