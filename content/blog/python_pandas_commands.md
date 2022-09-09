---
title: "Save the Pandas ... Library!"
summary: 'Amassing a collection of useful Python Pandas library commands!'
tags: ["ml", "data-science"]

date: 2020-08-01T16:11:56-07:00
draft: true
---

<style>
.note {
  background-color: #f7e6c8;
  border-left: 6px solid #edc57e;
  margin-bottom: 10px;
}
</style>

{{< table_of_contents >}}

# Importing

### Importing the Libraries

```python
import pandas as pd
import numpy as np        #NumPy library required by Pandas library
```

### Read csv file data

```python
df = pd.read_csv(file_path, index_col=None)
```

<br><br>

# About dataset

### Check column names

```python
df.columns

Series.name
```

### Check shape of object

```python
df.shape

Series.shape
```

### Columns of a specific data type type

```python
df.dtypes == 'object'
```

### Describe data

```python
df.describe()
```

### Unique vs Nunique

```python
for col in df.columns:    # for loop to get column names
  df[col].unique()            # returns unique values in column 'col'
  df[col].nunique()           # returns unique values in column AND drop NAs
```

<br><br>

# Slicing and Filtering

### Filter

```python
df.filter(items=, like=None)
```

### <a href="https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.iloc.html" target="_blank">Iloc </a>

```python
df.iloc[row_position, col_position]    # general format
```

<p class='note'>
<b>Note</b>: Copy of dataframe is slice is returned. This CANNOT be used in assignment. Also, note that only integers, its derivations and boolean arrays can be used to index.
</p>

### <a href="https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.loc.html" target="_blank">Loc</a>

```python
index = (df.Color=="Red") & (df.Item=="Shirt")        # produces a boolean array
df.loc[index]        # returns original dataframe sliced


df.loc[row_indexer, col_indexer]        #general format
```

<p class='note'>
<b>Note</b>: colon ":"  is not needed by col_indexer like in *df.loc[index, :]* to choose all columns, and slice of ORIGINAL dataframe is returned. This can be used for assignment.
</p>

### Query (columns)

```python
df.query('expression')    # expression must be conditional using column variable/s
                          # prefix "@" before variable name if outside of dataframe env.
                          # prefix ` ` to encapsulate variable name with spaces
```

<p class='note'>
<b>Note</b>: Can be used to filter rows.
</p>


<br><br>
# Data Processing

### Apply (a function on a pandas object)

```python
df.apply(FUN, axis=0, *args)    # FUN: any (valid) function to apply
                                # axis: axis to assess
                                # *args: additional keyword arguments for FUN
```

### Assign (new columns)

```python
df.assign(col_4 = col_1*col_2/col_3)
```

<p class='note'> 
<b>Note</b>: Used to create new columns. Similar to "mutate" in R. 
</p>



### Get Dummies (One Hot Encoding)

```python
df.get_dummies(dummy_na=False, columns=None, sparse=False, drop_first=False, dtype=np.uint8)
        # dummy_na: if True, adds dummy column for NA
        # columns: if !None, columns specified will be one hot encoded
        # sparse: whether resulting columns will be SparseArray objects (True) or NumPy arrays(False) 
        # drop_first: removes first unique dummy variable from unique objects in column
        # dtype: data type for new columns (e.g. float)


Series.get_dummies(dummy_na=False, columns=None, sparse=False, drop_first=False, dtype='np.uint8')
```

### Group by, then Transform

```python
df.groupby(by=category).transform(FUN)

```

<p class='note'>
<b>Note</b>: Grouping a dataframe then transforming it is a very common operation. A dataframe is converted into a "GroupBy" object depending on *category*, which may be a string or list of strings representing column names. Then the resulting object's values are passed into *FUN* by the transform function and a column of the same size is returned.
</p>

### Handling NA

```python
# Finding NA and inverse
df.isna()
Series.isna()

df.notna()
Series.isna()


# Dropping NA
df.dropna(axis=0, how='any', thresh=None, subset=None, inplace=False)
        # axis: axis to assess
        # how: when to drop axis (e.g. how='all' drops IFF all values are NA)
        # thresh: number of NAs in axis to drop
        # subset: labels on axis to be considered
        # inplace: by default, returns new object. If True, modifies existing object
        
Series.dropna(axis=0, how=None,inplace=False)


# Filling NA
df.fillna(value=None, method=None, axis=None, inplace=False, limit=None)
        # value: value to fill holes
        # method: method for filling holes.*
        # inplace: by default, returns new object. If True, modifies existing object
        # limit: max number of consecutive NAs to fill. Will be left as NA if value is exceeded

Series.fillna(value=None, method=None, axis=None, inplace=False, limit=None)
```

### Mapping

```python
df.applymap(FUN)
Series.map(FUN)
```
<p class='note'> 
<b>Note</b>: Iterates by rows (for Series) and cell (for DataFrame), passing cell value into function with the output value replacing its input value.
</p>

### Piping Data (through multiple functions)

```python
df.pipe(FUN1).pipe(FUN2, arg1=foo).pipe((FUN3, "arg2"), arg1=bar)        
    # when FUN3's main arg. is not df, supply tuple
      where str contains location for df (e.g. "arg2")
)
```

<p class='note'> <b>NOTE</b>: similar to %>% operation in R. </p>


### Rolling

```python
df.rolling(num_observations).FUN()
Series.rolling(num_observations).FUN()


# Example of counting observations every 7 days past
Series.rolling('7d').count()-1        # subtraction excludes day 
```

<p class='note'>
<b>Note</b>: This is similar to GroupBy then Transform, but function is applied to "rolls" going down a specific column/index.
</p>


<br>

<hr>

# Additional Resources

* A great resource for comparing df.**agg**(), df.**apply**(), df.**applymap**() and df.**transform**() can be found <a href="https://stackoverflow.com/questions/46210678/whats-the-difference-between-transform-vs-applymap-for-pandas-dataframe">here</a>.