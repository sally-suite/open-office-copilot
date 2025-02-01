function createEchartOption(data) {
  // Extracting the required data for the bar chart
  const chartData = data.slice(1).map(row => ({
    city: row[0],
    sales: row[1]
  }));

  // Creating the echart option
  const option = {
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.city)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: chartData.map(item => item.sales)
    }]
  };

  return option;
}