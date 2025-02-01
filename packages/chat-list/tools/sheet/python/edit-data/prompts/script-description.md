Python code to fulfill user's sheet data editing needs.

RULE:

1. Generate a function named "main as the main function.
1. Input Excel file in the directory "/input", the file name is data.xlsx
1. Save the modified file in the "/output" directory.
1. Use pandas to achieve Excel editing, output xlsx file
1. when read excel file using pandas, consider header parameter is from 0

OUTPUT SAMPLE:

```python
# import pacakages

def main():
    # data is in data.xlsx
    file_path = '/input/data.xlsx'
    # read data from data.xlsx
    df = pd.read_excel(file_path,sheet_name="<sheet_name>")

    # other code

    # result is in modified_data.xlsx
    output_file = '/output/modified_data.xlsx'
    # write execute result to output_file
    df.to_excel(output_file, index=False,sheet_name="<sheet_name>")

```
