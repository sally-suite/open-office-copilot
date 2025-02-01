import { render } from "chat-list/sheet";
import { runPython } from 'chat-list/service/python';
import XLSX from 'xlsx';
// import { loadPyodide } from 'pyodide'
render();

// const code = `
// def main(data):
//     import matplotlib.pyplot as plt
//     import numpy as np

//     # Extract Orders data
//     orders = [row[2] for row in data[1:]]
//     cities = [row[0] for row in data[1:]]

//     # Create bar chart
//     fig, ax = plt.subplots()
//     ax.bar(cities, orders)
//     ax.set_xlabel('City')
//     ax.set_ylabel('Orders')
//     ax.set_title('Orders by City')

//     # Save the plot as base64 image
//     from io import BytesIO
//     buffer = BytesIO()
//     plt.savefig(buffer, format='png')
//     buffer.seek(0)

//     import base64
//     image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

//     return image_base64

// `
// const result = await runPython(code, [
//     [
//         "City",
//         "Sales",
//         "Orders",
//         "Revenue"
//     ],
//     [
//         "Denver",
//         "$6,600",
//         33,
//         1800
//     ],
//     [
//         "Dallas",
//         "$5,500",
//         34,
//         1900
//     ],
//     [
//         "Houston",
//         "$4,200",
//         35,
//         1800
//     ],
//     [
//         "Phoenix",
//         "$3,000",
//         32,
//         1700
//     ],
//     [
//         "Huntsville",
//         "$2,800",
//         31,
//         1600
//     ]
// ])
// console.log(result.value)
// console.log(result.toString())
// console.log(Object.getPrototypeOf(result))
async function main() {
    // 要导出的数据
    const data = [
        ['Name', 'Age', 'Country'],
        ['John Doe', 30, 'USA'],
        ['Jane Smith', 25, 'Canada'],
        ['Bob Johnson', 40, 'UK']
    ];
    const data2 = [
        ['Name', 'Age', 'Country'],
        ['John Doe', 1, 'USA'],
        ['Jane Smith', 1, 'Canada'],
        ['Bob Johnson', 1, 'UK']
    ];
    // 创建新的 Workbook 对象
    const wb = XLSX.utils.book_new();
    // 创建新的工作表对象
    const ws = XLSX.utils.aoa_to_sheet(data);
    const ws2 = XLSX.utils.aoa_to_sheet(data2);

    // 将工作表添加到 Workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.book_append_sheet(wb, ws2, "Sheet2");

    // 将 Workbook 导出为 Excel 文件

    const pyodide = await loadPyodide();
    // const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // fs.writeFile("/hello.xlsx", new TextEncoder().encode(wbout), { encoding: "binary" });
    const wboutArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    pyodide.FS.writeFile("/input/hello.xlsx", wboutArrayBuffer, { encoding: "binary" });
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(['pandas', 'matplotlib', 'numpy', 'openpyxl']);
    // Python 修改文件并保存到文件系统
    const pythonCode = `
        import pandas as pd

        # 读取 Excel 文件
        df = pd.read_excel("/input/hello.xlsx",sheet_name="Sheet2")
        print(df)
        # 修改数据（这里只是简单示例，你可以根据需求进行修改）
        df["Age"] = df["Age"] + 1
        print(df)
        # 将修改后的数据保存到 Excel 文件
        df.to_excel("/output/hello_modified.xlsx", index=False)
    `;
    pyodide.runPython(pythonCode);

    const fileNames = [];
    const directoryPath = 'output';
    const directory = pyodide.FS.open(directoryPath);
    let currentFileName;
    while ((currentFileName = pyodide.FS.readdir(directory))) {
        // 排除 . 和 .. 目录
        if (currentFileName !== "." && currentFileName !== "..") {
            const filePath = pyodide.path.join(directoryPath, currentFileName);
            if (!pyodide.FS.isDir(pyodide.FS.lookup(filePath).mode)) {
                // 如果是文件，则将文件路径添加到列表中
                fileNames.push(filePath);
            }
        }
    }
    pyodide.FS.closedir(directory);
}
main();