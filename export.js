let exportBtn = document.querySelector('#export');
exportBtn.addEventListener('click', () => {
  // Initialization
  let CSV = document.querySelector('#exportCSV');
  let done = document.querySelector('#exportDone');
  let cancel = document.querySelector('#exportCancel');
  let modal2 = document.querySelector('#exportModal2');
  let exportRows = document.querySelectorAll('.tableRow'); // Data to go
  let includeHeader = document.querySelector('#includeHeader'); // Include header or not
  let tableHeadExport = document.querySelector('#tableHeadExport'); // Header Row

  // Change the second modal
  $(modal2).modal({
    backdrop: 'static'
  });
  $(modal2).draggable();

  let clickedRows = []; // Array to store clicked rows

  exportRows.forEach(row => {
    row.addEventListener('click', () => {
      row.setAttribute('data-bs-toggle', '');
      row.setAttribute('data-bs-target', '');
    });
  });
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
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle row click event
  exportRows.forEach(row => {
    row.addEventListener('click', () => {
      clickedRows.push(row); // Store clicked row in the array
    });
  });

  // Handle export button click
  done.addEventListener('click', () => {
    // Trigger CSV file download with clicked rows
    downloadCSV(clickedRows);
  });

  // Handle cancel button click
  cancel.addEventListener('click', () => {
    clickedRows = []; // Reset clicked rows array
    exportRows.forEach(row => {
      row.setAttribute('data-bs-toggle', 'modal');
      row.setAttribute('data-bs-target', '#moreInfo');
    });
  });
});
