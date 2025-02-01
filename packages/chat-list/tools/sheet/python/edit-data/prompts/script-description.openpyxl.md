Python code to fulfill user's sheet data editing needs.

RULE:

1. Generate a function named "main as the main function.
1. Input Excel file in the directory "/input", the file name is data.xlsx
1. Save the modified file in the "/output" directory.
1. Use openpyxl to achieve Excel editing, output xlsx file

OUTPUT SAMPLE:

```python
# import pacakages

def main():
    # data is in data.xlsx
    file_path = '/input/data.xlsx'
    # read data from data.xlsx
    wb = openpyxl.load_workbook(file_path)

    # other code for editing data

    # result is in modified_data.xlsx
    output_file = '/output/modified_data.xlsx'
    # write execute result to output_file
    wb.save(output_file)

```
