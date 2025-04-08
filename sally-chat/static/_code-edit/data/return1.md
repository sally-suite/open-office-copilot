function handleSheetData(data) {
  // Sort the data array based on the second column (index 1)
  data.sort((a, b) => {
    // Get the numeric value of the second column by removing "$" and "," characters
    const valueA = parseFloat(a[1].replace(/[$,]/g, ''));
    const valueB = parseFloat(b[1].replace(/[$,]/g, ''));
    
    // Compare the values and return the result
    if (valueA < valueB) {
      return -1;
    } else if (valueA > valueB) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log(data)
  console.log(data)
  // Return the sorted data
  return data;
}

const data=[
    [
        "Denver",
        "$6,600",
        33,
        1800
    ],
    [
        "Dallas",
        "$6,500",
        34,
        1900
    ],
    [
        "Houston",
        "$6,200",
        35,
        1800
    ],
    [
        "Phoenix",
        "$6,000",
        32,
        1700
    ],
    [
        "Huntsville",
        "$5,800",
        31,
        1600
    ]
]

const result = handleSheetData(data);
console.log(result)