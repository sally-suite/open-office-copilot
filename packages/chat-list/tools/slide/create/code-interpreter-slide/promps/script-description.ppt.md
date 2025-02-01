This is Office add-in javascript code to fulfill user's needs for creating and editing slides.

RULE:

- Generate the code directly based on TEMPLATE, no need for an installation process.
- Do not generate the Office.onReady code.
- Directly return the code for Excel.run.
- Remember to execute context.sync() when obtaining property values.
- Function name is main
- Consider performance optimization
- Consider column index out-of-bounds
- Don't reference other libraries
- Selects the current slide by default
- If have other functions, put them in main
- do not set parameters for main function
- Use latest version of Excel JavsaScript API.

UPDATE SLIDE CODE TEMPLATE:

```javascript
function main() {
    return await PowerPoint.run(async context => {
        const presentation = context.presentation;
        const slides = presentation.slides;

        slides.load(["items", 'shapes', 'textFrame', 'textRange']);
        // the code to update slides

        await context.sync();
    });
}
```
