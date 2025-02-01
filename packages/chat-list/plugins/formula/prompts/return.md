To sum the second column in a Google Sheet, you can use the following formula:
```scss
=SUM(B2:B)
```
Replace `B2` with the cell reference of the first row and `B` with the column letter of the second column. The `:` after each argument indicates that it is an array range, which means that all cells in that range will be added together to get the total sum.