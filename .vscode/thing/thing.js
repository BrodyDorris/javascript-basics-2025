document.addEventListener('DOMContentLoaded', () => {
    // Select all input buttons
    const inputAButton = document.getElementById('inputA');
    const inputBButton = document.getElementById('inputB');
    
    // Select all output displays
    const notInputA = document.getElementById('not-inputA');
    const notOutput = document.getElementById('not-output');
    const andInputA = document.getElementById('and-inputA');
    const andInputB = document.getElementById('and-inputB');
    const andOutput = document.getElementById('and-output');
    const orInputA = document.getElementById('or-inputA');
    const orInputB = document.getElementById('or-inputB');
    const orOutput = document.getElementById('or-output');

    // Logic gate functions
    const NOT = (a) => a === 0 ? 1 : 0;
    const AND = (a, b) => (a === 1 && b === 1) ? 1 : 0;
    const OR = (a, b) => (a === 1 || b === 1) ? 1 : 0;

    // Function to update the simulator state
    const updateSimulator = () => {
        // Get current input values from the buttons' data attributes
        const inputA = parseInt(inputAButton.getAttribute('data-value'));
        const inputB = parseInt(inputBButton.getAttribute('data-value'));

        // Update displays with current input values
        notInputA.textContent = inputA;
        andInputA.textContent = inputA;
        andInputB.textContent = inputB;
        orInputA.textContent = inputA;
        orInputB.textContent = inputB;

        // Calculate and display gate outputs
        const notResult = NOT(inputA);
        const andResult = AND(inputA, inputB);
        const orResult = OR(inputA, inputB);

        updateOutputDisplay(notOutput, notResult);
        updateOutputDisplay(andOutput, andResult);
        updateOutputDisplay(orOutput, orResult);
    };

    // Helper function to update output display with color
    const updateOutputDisplay = (element, value) => {
        element.textContent = value;
        element.className = value === 1 ? 'output-1' : 'output-0';
    };

    // Add event listeners to input buttons
    inputAButton.addEventListener('click', () => {
        const currentValue = parseInt(inputAButton.getAttribute('data-value'));
        const newValue = currentValue === 0 ? 1 : 0;
        inputAButton.setAttribute('data-value', newValue);
        inputAButton.textContent = newValue;
        updateSimulator();
    });

    inputBButton.addEventListener('click', () => {
        const currentValue = parseInt(inputBButton.getAttribute('data-value'));
        const newValue = currentValue === 0 ? 1 : 0;
        inputBButton.setAttribute('data-value', newValue);
        inputBButton.textContent = newValue;
        updateSimulator();
    });

    // Initial update
    updateSimulator();
});
