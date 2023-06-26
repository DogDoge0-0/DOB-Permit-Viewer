let exportBtn = document.querySelector('#export');
exportBtn.addEventListener('click', () => {
  // Initialization
  let CSV = document.querySelector('#exportCSV');
  let exportRows = Array.from(document.querySelectorAll('.tableRow')); // Convert NodeList to array
  let includeHeader = document.querySelector('#includeHeader'); // Include header or not
  let tableHeadExport = document.querySelector('#tableHeadExport'); // Header Row

  // Function to convert data to CSV format
  function convertToCSV(data) {
    const header = includeHeader.checked ? tableHeadExport.innerText : '';
    const rows = data.map(row => Object.values(row).join(","));
    return `${header}\n${rows.join("\n")}`;
  }

  // Function to trigger CSV file download
  function downloadCSV(data) {
    const csv = convertToCSV(data);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.setAttribute("download", "export_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle export button click
  CSV.addEventListener('click', () => {
    // Trigger CSV file download with clicked rows
    downloadCSV(exportRows);
  });
});
