Python code to create chart.

RULE:

1. Generate a function named "main as the main function.
1. Input Excel file in the directory "/input", the file name is data.xlsx
1. Save the modified file in the "/output" directory.
1. Output result should be saved into the "/output" directory, the output result is chart image.
1. when read excel file using pandas
1. Use matplotlib to draw chart

OUTPUT SAMPLE:

```python
# import pacakages
import pandas as pd
import matplotlib.pyplot as plt

def main():
    # data is in data.xlsx
    file_path = '/input/data.xlsx'
    # read data from data.xlsx
    data = pd.read_excel(file_path)

    # chart code


    # write execute result to output_file
    output_file = '/output/<chart name>.png'
    plt.savefig(output_file)
    # plt.close # do not call plt.close functions
```
