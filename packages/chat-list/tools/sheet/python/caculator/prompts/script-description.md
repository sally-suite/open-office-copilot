Python code to do caculation for me.

RULE:

1. Generate a function named "main as the main function.
1. Input Excel file in the directory "/input", the file name is data.xlsx
1. Save the modified file in the "/output" directory.
1. when read excel file using pandas
1. Use pandas and numpy to do data analysis and calculation,write the results to text file.

OUTPUT SAMPLE:

[CACULATION]

```python
# import pacakages

def main():
    file_path = '/input/data.xlsx'
    df = pd.read_excel(file_path,sheet_name="<sheet_name>")

    # other code

    output_file = '/output/<name>.txt'
    with open(output_file, 'w') as file:
        file.write(f'<result>')

```
