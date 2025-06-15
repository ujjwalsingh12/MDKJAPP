import pandas as pd
from io import StringIO

def df_to_csv(df: pd.DataFrame) -> str:
    output = StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def df_to_excel(df: pd.DataFrame) -> bytes:
    output = StringIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False)
    return output.getvalue()