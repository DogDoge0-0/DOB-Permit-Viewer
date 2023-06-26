const exportBtn = document.querySelector('#export');
exportBtn.addEventListener('click', () => {
  const CSV = document.querySelector('#exportCSV');
  const exportRows = Array.from(document.querySelectorAll('.tableRow'));
  const includeHeader = document.querySelector('#includeHeader');
  const tableHeadExport = document.querySelector('#tableHeadExport');

  function convertToCSV(data) {
    const header = includeHeader.checked ? tableHeadExport.innerText : '';
    const rows = data.map(row => Object.values(row).join(","));
    return `${header}\n${rows.join("\n")}`;
  }

  function downloadCSV(data) {
    const csv = convertToCSV(data);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.setAttribute("download", "export_data.csv");
    link.click();
    link.remove(); // Use 'remove' instead of 'removeChild'
  }

  CSV.addEventListener('click', () => {
    downloadCSV(exportRows);
  });
});
