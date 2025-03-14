async function runPython() {
    let outputElement = document.getElementById("output");
    outputElement.innerText = "Running Breakout...";

    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "matplotlib"]);

    let breakoutCode = await (await fetch("breakout.py")).text();
    let pglCode = await (await fetch("pgl.py")).text();

    pyodide.runPython(pglCode);  // Load the graphics library first
    pyodide.runPython(breakoutCode);  // Run the Breakout game

    outputElement.innerText = "Game started!";
}