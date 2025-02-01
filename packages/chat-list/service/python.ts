// import { loadPyodide } from 'pyodide';
let installed = false;
const installPackages = async (pyodide: any) => {
    if (installed) {
        return;
    }
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(['pandas', 'matplotlib', 'numpy']);
    installed = true;
}

export const runPython = async (code: string, params?: any) => {
    const pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(['pandas', 'matplotlib', 'numpy']);
    const res = pyodide.runPython(code);
    const func = pyodide.globals.get("main");
    if (!func) {
        return res;
    }
    const result = pyodide.globals.get("main")(params);
    console.log(result)
    return result;
}