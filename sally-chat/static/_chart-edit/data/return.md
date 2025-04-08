function createEchartOption(data) {
    // Extract the headers and data rows from the JSON
    const headers = data[0];
    const rows = data.slice(1);

    // Find the index of the "Sales" column in the headers
    const salesIndex = headers.indexOf("Sales");

    if (salesIndex === -1) {
        console.error("The 'Sales' column was not found in the dataset.");
        return null;
    }

    // Extract the labels and values for the pie chart
    const pieData = rows.map(row => ({
        name: row[0],  // City
        value: parseFloat(row[salesIndex].replace(/[$,]/g, '')) // Parse and remove $ and commas
    }));

    // ECharts options for the pie chart
    const option = {
        title: {
            text: 'Sales by City',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: pieData.map(item => item.name)
        },
        series: [
            {
                name: 'Sales',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: pieData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    return option;
}

// Example usage:
const dataset = [
    ["City", "Sales", "Orders", "Revenue"],
    ["Denver", "$6,600", 33, 1800],
    ["Dallas", "$6,500", 34, 1900],
    ["Houston", "$6,200", 35, 1800],
    ["Phoenix", "$6,000", 32, 1700],
    ["Huntsville", "$5,800", 31, 1600]
];

const pieChartOption = createEchartOption(dataset);

// You can then use pieChartOption to render the pie chart using ECharts.
