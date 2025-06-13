import pandas as pd

def convert_to_df(data):
    return pd.DataFrame(data)

def export_to_csv(data, filename="export.csv"):
    df = convert_to_df(data)
    df.to_csv(filename, index=False)
    return filename