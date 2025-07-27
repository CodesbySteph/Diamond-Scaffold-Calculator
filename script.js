// Material configuration (weights only, no material costs)
const MATERIALS = {
  base: [
    { name: "Screw Jacks", weightPerUnit: 14 },
    { name: "Starter Collars", weightPerUnit: 4.18 },
    { name: "Vertical 9'9\"", weightPerUnit: 33.73 },
    { name: "Horizontal 7′", weightPerUnit: 19.3 },
    { name: "Horizontal 5′2″", weightPerUnit: 10.1 },
    { name: "Diagonal Braces", weightPerUnit: 12 },
    { name: "Steel Decks 7′", weightPerUnit: 49.5 },
    { name: "Top Guardrails", weightPerUnit: 14.2 },
    { name: "Toe Boards", weightPerUnit: 5.5 },
  ],
  stair: [
    { name: "Stair Stringer 7′", weightPerUnit: 42 },
    { name: "Stair Tread", weightPerUnit: 10 },
    { name: "Stair Guardrail", weightPerUnit: 14 },
    { name: "Stair Standard", weightPerUnit: 24 },
    { name: "Stair Ledger", weightPerUnit: 16 },
    { name: "Stair Diagonal Brace", weightPerUnit: 12 },
    { name: "Stair Base Plate", weightPerUnit: 6 },
  ],
};

window.onload = function () {
  console.log("Script loaded");

  const form = document.getElementById("scaffold-form");
  const materialList = document.getElementById("material-list");

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission
    console.log("Form submitted");

    // Get input values
    const width = parseFloat(document.getElementById("width").value);
    const length = parseFloat(document.getElementById("length").value);
    const height = parseFloat(document.getElementById("height").value);
    const manhourRate = parseFloat(document.getElementById("manhourRate").value) || 0;
    const includeStair = document.getElementById("stairTower").checked;

    // Validate inputs
    if (isNaN(width) || isNaN(length) || isNaN(height) || width <= 0 || length <= 0 || height <= 0) {
      showError("Please enter valid positive numbers for width, length, and height.");
      return;
    }
    if (!isNaN(manhourRate) && manhourRate < 0) {
      showError("Manhour rate cannot be negative.");
      return;
    }

    // Clear previous errors
    clearErrors();

    // Calculate scaffold dimensions
    const liftsHigh = Math.ceil(height / 6.5);
    const baysWide = Math.ceil(width / 7);
    const baysLong = Math.ceil(length / 7);
    const totalBays = baysWide * baysLong;

    // Initialize materials array
    let materials = [];

    // Add base materials
    materials.push({ name: "Screw Jacks", qty: (baysWide + 1) * (baysLong + 1), weightPerUnit: MATERIALS.base[0].weightPerUnit });
    materials.push({ name: "Starter Collars", qty: (baysWide + 1) * (baysLong + 1), weightPerUnit: MATERIALS.base[1].weightPerUnit });
    materials.push({ name: "Vertical 9'9\"", qty: (baysWide + 1) * (baysLong + 1) * liftsHigh, weightPerUnit: MATERIALS.base[2].weightPerUnit });
    materials.push({ name: "Horizontal 7′", qty: baysWide * (baysLong + 1) * liftsHigh, weightPerUnit: MATERIALS.base[3].weightPerUnit });
    materials.push({ name: "Horizontal 5′2″", qty: baysLong * (baysWide + 1) * liftsHigh, weightPerUnit: MATERIALS.base[4].weightPerUnit });
    materials.push({ name: "Diagonal Braces", qty: totalBays * liftsHigh, weightPerUnit: MATERIALS.base[5].weightPerUnit });
    materials.push({ name: "Steel Decks 7′", qty: totalBays, weightPerUnit: MATERIALS.base[6].weightPerUnit });
    materials.push({ name: "Top Guardrails", qty: baysWide * 2 + baysLong * 2, weightPerUnit: MATERIALS.base[7].weightPerUnit });
    materials.push({ name: "Toe Boards", qty: baysWide * 2 + baysLong * 2, weightPerUnit: MATERIALS.base[8].weightPerUnit });

    // Add stair materials if included
    if (includeStair) {
      const stairLifts = Math.ceil(height / 6.5);
      const stairTowers = 1;
      const stringersPerLift = 2;
      const treadsPerLift = 5;
      const legsPerLift = 4;
      const barsPerLift = 4;
      const diagonalsPerLift = 2;
      const basePlatesPerTower = 4;

      materials.push({ name: "Stair Stringer 7′", qty: stairTowers * stringersPerLift * stairLifts, weightPerUnit: MATERIALS.stair[0].weightPerUnit });
      materials.push({ name: "Stair Tread", qty: stairTowers * treadsPerLift * stairLifts, weightPerUnit: MATERIALS.stair[1].weightPerUnit });
      materials.push({ name: "Stair Guardrail", qty: stairTowers * barsPerLift * stairLifts, weightPerUnit: MATERIALS.stair[2].weightPerUnit });
      materials.push({ name: "Stair Standard", qty: stairTowers * legsPerLift * stairLifts, weightPerUnit: MATERIALS.stair[3].weightPerUnit });
      materials.push({ name: "Stair Ledger", qty: stairTowers * barsPerLift * stairLifts, weightPerUnit: MATERIALS.stair[4].weightPerUnit });
      materials.push({ name: "Stair Diagonal Brace", qty: stairTowers * diagonalsPerLift * stairLifts, weightPerUnit: MATERIALS.stair[5].weightPerUnit });
      materials.push({ name: "Stair Base Plate", qty: stairTowers * basePlatesPerTower, weightPerUnit: MATERIALS.stair[6].weightPerUnit });
    }

    // Render material list as a table
    let totalWeight = 0;
    materialList.innerHTML = `
      <h3>Material List</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Weight per Unit (lbs)</th>
            <th>Total Weight (lbs)</th>
          </tr>
        </thead>
        <tbody>
          ${materials
            .map(item => {
              const itemWeight = (item.qty * item.weightPerUnit).toFixed(2);
              totalWeight += parseFloat(itemWeight);
              return `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty} pcs</td>
                  <td>${item.weightPerUnit.toFixed(1)}</td>
                  <td>${itemWeight}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
      <h3>Total Scaffold Weight: ${totalWeight.toFixed(2)} lbs</h3>
    `;

    // Add addon output (includes labor cost if manhour rate provided)
    addAddonOutput(materials, materialList, manhourRate);

    // Save calculation
    saveCalculation(materials, width, length, height, includeStair, manhourRate);
  });

  // Add reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  document.getElementById("calculate").insertAdjacentElement("afterend", resetButton);
  resetButton.addEventListener("click", () => {
    form.reset();
    materialList.innerHTML = "";
    clearErrors();
  });

  // Add save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save Calculation";
  resetButton.insertAdjacentElement("afterend", saveButton);
  saveButton.addEventListener("click", () => saveCalculation(materials, document.getElementById("width").value, document.getElementById("length").value, document.getElementById("height").value, document.getElementById("stairTower").checked, document.getElementById("manhourRate").value));

  // Add load button
  const loadButton = document.createElement("button");
  loadButton.textContent = "Load Last Calculation";
  saveButton.insertAdjacentElement("afterend", loadButton);
  loadButton.addEventListener("click", loadCalculation);

  // Error handling functions
  function showError(message) {
    clearErrors();
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
  }

  function clearErrors() {
    const errorDiv = document.querySelector(".error-message");
    if (errorDiv) errorDiv.remove();
  }

  // Save calculation to localStorage
  function saveCalculation(materials, width, length, height, includeStair, manhourRate) {
    const calculation = { materials, width, length, height, includeStair, manhourRate, timestamp: new Date().toISOString() };
    localStorage.setItem("lastCalculation", JSON.stringify(calculation));
  }

  // Load calculation from localStorage
  function loadCalculation() {
    const saved = localStorage.getItem("lastCalculation");
    if (saved) {
      const { materials, width, length, height, includeStair, manhourRate } = JSON.parse(saved);
      document.getElementById("width").value = width;
      document.getElementById("length").value = length;
      document.getElementById("height").value = height;
      document.getElementById("stairTower").checked = includeStair;
      document.getElementById("manhourRate").value = manhourRate || "";

      let totalWeight = 0;
      materialList.innerHTML = `
        <h3>Material List (Loaded)</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Weight per Unit (lbs)</th>
              <th>Total Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            ${materials
              .map(item => {
                const itemWeight = (item.qty * item.weightPerUnit).toFixed(2);
                totalWeight += parseFloat(itemWeight);
                return `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty} pcs</td>
                    <td>${item.weightPerUnit.toFixed(1)}</td>
                    <td>${itemWeight}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        <h3>Total Scaffold Weight: ${totalWeight.toFixed(2)} lbs</h3>
      `;
      addAddonOutput(materials, materialList, manhourRate);
    } else {
      showError("No saved calculation found.");
    }
  }
};
