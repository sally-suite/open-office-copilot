Generate python to fulfill user's sheet data editing and analysis requirements,This field must not be empty,handles line breaks in code, the script field is a string

DATA ANALYZE CODE RULE:

1. when there is no header, the data must be analyzed and edited using openpyxl
1. when there are headers, use pandas to do data analysis and calculation,write the results to text file.
1. when you need to draw charts, use matplotlib to generate charts,ouput chart image to output directory, do not need to draw charts
1. when you need to edit data, use openpyxl to achieve Excel editing, output xlsx file

DATA RANGE RULE:

1. when read excel file using pandas, consider header parameter is from 0
1. Pay attention to header_row, obtained from the Sheet Info
1. The code need consider if exist header, and calculate the row and column index of data frame

FONT SETTING:

1. the font file is "language.ttf" in root directory
1. use "matplotlib.font_manager" to set the font
1. set font properties to the chart title, x label, y label

CODE CONSTRAINT:

1. Generate a function named "main as the main function.
1. Input Excel file in the directory "/input", the file name is `data.xlsx`
1. Save the modified file in the "/output" directory.
1. Output result should be saved into the "/output" directory, the output can be xlsx file, picture, text or pptx file.
1. Set font for chart title, x label, y label, x ticks, y ticks, label
1. do not call `plt.close()` function in chart code
1. Handles line breaks in code, the script field is a string
1. Output text in markdown file with extension `.md`

EXCEPTION HANDLING:

1. To fix `AttributeError: 'NoneType' object has no attribute 'parentNode'`, do not call `plt.close()` function in chart code

[SET FONT CODE SAMPLE]

```python
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

fpath = Path("/language.ttf")
font_prop = FontProperties(fname=str(fpath))

# set global font
plt.rcParams['font.family'] = font_prop.get_name()

# set chart title, x label, y label font
plt.plot([1, 2, 3], [4, 5, 6])
plt.title('hello world', fontproperties=font_prop)
plt.xlabel('time', fontproperties=font_prop)
plt.ylabel('value', fontproperties=font_prop)

# set x ticks and y ticks font for bar chart,line chart and other two dimensional charts
plt.xticks(fontproperties=font_prop)
plt.yticks(fontproperties=font_prop)

# set label font for pie chart
for label in plt.gca().texts:
    label.set_fontproperties(font_prop)

```

[EDIT DATA CODE SAMPLE]

```python
import openpyxl
from openpyxl import Workbook

def main():
    # read data
    input_file = '/input/data.xlsx'
    wb = openpyxl.load_workbook(input_file)
    sheet = wb['Sheet1']

    # analyze or edit data

    # write result to new file
    output_file = '/output/<name>.xlsx'
    new_wb = Workbook()
    new_sheet = new_wb.active
    new_sheet.title = <name>

    # write data to new sheet

    # save to new file
    new_wb.save(output_file)
```

[CREATE CHART CODE SAMPLE]

```python
# import pacakages

def main():
    file_path = '/input/data.xlsx'
    df = pd.read_excel(file_path,sheet_name="<sheet_name>")

    # other code

    output_file = '/output/<chart name>.png'
    plt.savefig(output_file)
    plt.clf()

    # must not call plt.close functions
    # plt.close
```

[CACULATION CODE SAMPLE]

use pandas

```python
# import pacakages

def main():
    file_path = '/input/data.xlsx'
    df = pd.read_excel(file_path,sheet_name="<sheet_name>")

    # other code

    output_file = '/output/<name>.md
    with open(output_file, 'w') as file:
        file.write(f'<result>')

```

use openpyxl

```python
import openpyxl
from openpyxl import Workbook

def main():
    # read data
    input_file = '/input/data.xlsx'
    wb = openpyxl.load_workbook(input_file)
    sheet = wb['Sheet1']

    # analyze or edit data

    # write result to new file
    output_file = '/output/<name>.xlsx'
    new_wb = Workbook()
    new_sheet = new_wb.active
    new_sheet.title = <name>

    # write data to new sheet

    # save to new file
    new_wb.save(output_file)
```

[CREATE Presentation]

```python
import pandas as pd
import matplotlib.pyplot as plt
from pptx import Presentation
from pptx.util import Inches

def main():
    # Load the data from the Excel file
    input_file = '/input/data.xlsx'
    try:
        data = pd.read_excel(input_file, sheet_name='<sheet name>')
    except Exception as e:
        print(f'Error reading Excel file: {e}')
        return

    # Visualize code

    # Save the chart as an image
    chart_image_path = '/output/<name>.png'
    plt.savefig(chart_image_path)
    # must not call plt.close functions
    # plt.close()

    # Create a PowerPoint presentation
    prs = Presentation()
    slide_layout = prs.slide_layouts[5]  # Title only layout
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    title.text = '<title>'

    # Add the chart image to the slide
    slide.shapes.add_picture(chart_image_path, Inches(1), Inches(1), width=Inches(5), height=Inches(5))

    # Save the presentation
    presentation_path = '/output/<slide_name>.pptx'
    prs.save(presentation_path)
    print(f'Presentation saved at: {presentation_path}')

```
