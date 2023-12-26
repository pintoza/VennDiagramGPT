// Global SVG namespace
const svgNS = "http://www.w3.org/2000/svg";

// Handles changes to the radio buttons
function handleRadioChange(event, textFieldsContainer) {
    const count = parseInt(event.target.value, 10);
    textFieldsContainer.innerHTML = ''; // Clear existing fields

    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Title for set ${i + 1}`;
        input.className = 'form-control my-2'; // Bootstrap class for styling
        input.setAttribute('name', `setTitle${i}`);
        textFieldsContainer.appendChild(input);
    }
}

// Modify the setupInputListeners function
function setupInputListeners(vennDiagramContainer, setCount) {
    let inputs = document.querySelectorAll('#textFields input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateVennDiagram(setCount, vennDiagramContainer);
        });
    });
}


// DOMContentLoaded event to set up initial event listeners
document.addEventListener('DOMContentLoaded', function() {
    const radios = document.querySelectorAll('input[name="setCount"]');
    const textFieldsContainer = document.getElementById('textFields');
    const vennDiagramContainer = document.getElementById('vennDiagramContainer');

    radios.forEach(function(radio) {
        radio.addEventListener('change', function(event) {
            handleRadioChange(event, textFieldsContainer);
            generateVennDiagram(parseInt(event.target.value), vennDiagramContainer);
        });
    });

    setupInputListeners(vennDiagramContainer);
    document.getElementById('generateButton').addEventListener('click', onGenerateClicked);
});


// Generates the Venn diagram based on the selected number of sets
// Generates the Venn diagram based on the selected number of sets
function generateVennDiagram(setCount, vennDiagramContainer) {
    const colors = [
        "rgba(255, 192, 203, 0.5)", // Light Pink
        "rgba(173, 216, 230, 0.5)", // Light Blue
        "rgba(144, 238, 144, 0.5)", // Light Green
        "rgba(255,242,146,0.5)"     // Light Yellow
    ];

    let svg = vennDiagramContainer.querySelector('svg');
    if (!svg) {
        svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 300 300');
        vennDiagramContainer.appendChild(svg);
    } else {
        // Clear previous circles if they exist
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
    }

    const circleConfigs = {
        2: [{ cx: 110, cy: 150, r: 80 },
            { cx: 190, cy: 150, r: 80 }],
        3: [{ cx: 110, cy: 120, r: 80 },
            { cx: 190, cy: 120, r: 80 },
            { cx: 150, cy: 190, r: 80 }],
        4: [{ cx: 150, cy: 110, r: 60 },
            { cx: 110, cy: 150, r: 60 },
            { cx: 150, cy: 190, r: 60 },
            { cx: 190, cy: 150, r: 60 }]
    };

    circleConfigs[setCount].forEach((circle, index) => {
        let circleEl = document.createElementNS(svgNS, "circle");
        circleEl.setAttribute('cx', circle.cx);
        circleEl.setAttribute('cy', circle.cy);
        circleEl.setAttribute('r', circle.r);
        circleEl.setAttribute('fill', colors[index % colors.length]);
        svg.appendChild(circleEl);

    setupInputListeners(vennDiagramContainer, setCount)
    updateVennDiagram(setCount, vennDiagramContainer);
    });
}

function updateVennDiagram(setCount, vennDiagramContainer) {
    let textElements = vennDiagramContainer.querySelectorAll('text');
    textElements.forEach(text => text.remove());

    for (let i = 0; i < setCount; i++) {
        let input = document.querySelector(`input[name="setTitle${i}"]`);
        if (input && input.value) {
            let text = document.createElementNS(svgNS, "text");
            text.textContent = input.value;
            text.setAttribute('x', calculateXPosition(i, setCount));
            text.setAttribute('y', calculateYPosition(i, setCount));
            text.setAttribute('font-size', '10');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#333');
            vennDiagramContainer.querySelector('svg').appendChild(text);
        }
    }
}


// Calculates the X position of the text based on the index and setCount
function calculateXPosition(index, setCount) {
    // Simple example logic, needs refinement based on actual Venn diagram layout
    if (setCount === 2) {
        return index === 0 ? 80 : 220;
    } else if (setCount === 3) {
        if (index === 0) return 80;
        if (index === 1) return 220;
        return 150;
    } else { // setCount === 4
        if (index === 0) return 150;
        if (index === 1) return 80;
        if (index === 2) return 150;
        return 220;
    }
}

// Calculates the Y position of the text based on the index and setCount
function calculateYPosition(index, setCount) {
    // Simple example logic, needs refinement based on actual Venn diagram layout
    if (setCount === 2) {
        return 150; // Middle for both
    } else if (setCount === 3) {
        if (index === 0 || index === 1) return 110;
        return 190;
    } else { // setCount === 4
        if (index === 0) return 80;
        if (index === 1) return 150;
        if (index === 2) return 220;
        return 150;
    }
}


function getCombinations(array, size) {
    if (size > array.length) return [];
    if (size === 1) return array.map(element => [element]);
    return array.reduce((acc, value, index) => {
        const smallerCombinations = getCombinations(array.slice(index + 1), size - 1);
        smallerCombinations.forEach(combination => {
            acc.push([value].concat(combination));
        });
        return acc;
    }, []);
}

function calculateIntersections(setTitles) {
    let intersections = [];
    // Generate pairs (2-combinations) only once
    for (let i = 0; i < setTitles.length - 1; i++) {
        for (let j = i + 1; j < setTitles.length; j++) {
            intersections.push([setTitles[i], setTitles[j]]);
        }
    }
    // Add combination of all elements if more than 2 sets
    if (setTitles.length > 2) {
        intersections.push([...setTitles]); // Add all elements as a single group
    }
    return intersections;
}


function onGenerateClicked() {
    const inputs = document.querySelectorAll('#textFields input');
    const setTitles = Array.from(inputs).map(input => input.value.trim()).filter(value => value);

    if (setTitles.length > 1) {
        const intersections = calculateIntersections(setTitles);

        intersections.forEach(intersection => {
            const prompt = intersection.join(' and ');
            generateAndDisplayText(prompt, intersection);
        });
    } else {
        alert('Please enter titles for at least two sets.');
    }
}


// Assuming you have a function to make the POST request and fetch the responses
function generateAndDisplayText(prompt, intersection) {
    const requestData = { setTitles: intersection };

    fetch('/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        const text = data.text; // The generated text
        displayTextAtIntersection(intersection, text, index); // Pass index for positioning
    })
    .catch(error => console.error('Error:', error));
}


function calculateXForIntersection(index, intersection) {
    const setCount = intersection.length;
    switch (setCount) {
        case 2: return 150; // Middle for two sets
        case 3:
            // Three different positions for three intersections
            if (index === 0) return 100;
            if (index === 1) return 200;
            return 150; // Middle for the third intersection
        case 4:
            // Implement logic for four sets
            // This is an example and needs refinement
            if (index === 0) return 120;
            if (index === 1) return 180;
            if (index === 2) return 120;
            return 180;
        default: return 150; // Default position, adjust as needed
    }
}

function calculateYForIntersection(index, intersection) {
    const setCount = intersection.length;
    switch (setCount) {
        case 2: return 150; // Middle for two sets
        case 3:
            // Three different positions for three intersections
            if (index === 0 || index === 1) return 130;
            return 170; // Lower for the third intersection
        case 4:
            // Implement logic for four sets
            // This is an example and needs refinement
            if (index === 0) return 140;
            if (index === 1) return 140;
            if (index === 2) return 160;
            return 160;
        default: return 150; // Default position, adjust as needed
    }
}


function displayTextAtIntersection(intersection, text) {
    const vennDiagramContainer = document.getElementById('vennDiagramContainer');
    const svg = vennDiagramContainer.querySelector('svg');

    // Calculate the position for the text based on the intersection
    const x = calculateXForIntersection(intersection);
    const y = calculateYForIntersection(intersection);

    // Create SVG text element
    const textElement = document.createElementNS(svgNS, "text");
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('dominant-baseline', 'middle');
    textElement.textContent = text;

    svg.appendChild(textElement);
}


// Function to get titles from input fields and generate text
function handleGenerateButtonClick() {
  const inputs = document.querySelectorAll('#textFields input');
  const setTitles = Array.from(inputs).map(input => input.value.trim()).filter(value => value);

  if (setTitles.length > 0) {
    generateAndDisplayText(setTitles);
  } else {
    alert('Please enter titles for the sets.');
  }
}

// Attach this function to the "Generate" button click event
document.getElementById('generateButton').addEventListener('click', handleGenerateButtonClick);
