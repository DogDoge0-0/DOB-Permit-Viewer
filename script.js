// Initialization
let exportBTN = document.querySelector('#export');
let selectedFilter, url, loading, arrowClass, hoverArrowClass, noInfoFoundCheck, totalResults;
let dateChangeComplete = false;
let searching = false;
let html = document.querySelector('html');
let noFilter = true;
let topButton = document.querySelector('#topButton');
let dateDisplaySet = document.querySelector('#dateDisplaySet');
let reloadButton = document.querySelector('#reloadButton');
const searchInput = document.querySelector('#searchInput');
let loadingDiv = document.querySelector('.loadingDiv');
let currentSortColumn = null;
let currentSortOrder = 'ascending';
let sortButtons = document.querySelectorAll('.sort');
let sortButtonsState = [];
let displayNoResult = false;
let addressDisplay = document.querySelector('#address');
let searchResultCount = document.querySelector('#searchResultCount');
// Define the filter options and their corresponding columns
const filterColumns = {
  'ABA': ['applicant_business_address'],
  'ABN': ['applicant_business_name'],
  'AN': ['applicant_first_name', 'applicant_last_name'],
  'AL': ['applicant_license'],
  'AD': ['approved_date'],
  'B': ['bin'],
  'BL': ['block'],
  'BR': ['borough'],
  'CB': ['c_b_no'],
  'EJC': ['estimated_job_costs'],
  'ED': ['expired_date'],
  'FR': ['filing_reason'],
  'FRBN': ['filing_representative_business_name'],
  'FRN': ['filing_representative_first_name', 'filing_representative_last_name'],
  'HN': ['house_no'],
  'ID': ['issued_date'],
  'JD': ['job_description'],
  'JFN': ['job_filing_number'],
  'LT': ['permittee_s_license_type'],
  'L': ['lot'],
  'OBN': ['owner_business_name'],
  'ON': ['owner_name'],
  'SN': ['street_name'],
  'WL': ['work_on_floor'],
  'WP': ['work_permit'],
  'WT': ['work_type']
};

const hr = document.querySelector('#hr');
const table = document.querySelector('#tableBody');
const baseURL = 'https://data.cityofnewyork.us';
const dataID = 'rbx6-tga4';
const pageSize = 10;
let currentPage = 0;

const sortColumns = [
  'applicant_business_address',
  'applicant_business_name',
  'applicant_first_name',
  'applicant_last_name',
  'applicant_license',
  'approved_date',
  'bin',
  'block',
  'borough',
  'c_b_no',
  'estimated_job_costs',
  'expired_date',
  'filing_reason',
  'filing_representative_business_name',
  'filing_representative_first_name',
  'filing_representative_last_name',
  'house_no',
  'issued_date',
  'job_description',
  'job_filing_number',
  'lot',
  'owner_business_name',
  'owner_name',
  'permittee_s_license_type',
  'street_name',
  'work_on_floor',
  'work_permit',
  'work_type'
];

let selectedFilters = [];
let data = []; // Declare the data variable as an empty array

// Load Info + Search Stuff
document.addEventListener('DOMContentLoaded', () => {

  function loadNextPage() {
    currentPage++;
    const offset = currentPage * pageSize;
    if (searching === false && totalResults > offset) {
      searchResultCount.innerHTML = '';
      loading = true;
      let sortParam = '';
      if (currentSortColumn) {
        sortParam = `&$order=${currentSortColumn}%20${currentSortOrder}`;
      }
      console.log(`${baseURL}/resource/${dataID}.json?$limit=${pageSize}&$offset=${offset}${sortParam}`);
      fetch(`${baseURL}/resource/${dataID}.json?$limit=${pageSize}&$offset=${offset}${sortParam}`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            data.sort((a, b) => {
              for (const column of sortColumns) {
                const valueA = a[column] || '';
                const valueB = b[column] || '';
                const comparison = valueA.localeCompare(valueB);
                if (comparison !== 0) {
                  return comparison;
                }
              }
              return 0;
            });
            displayData(data);


          }
        })
        .catch(error => console.log(error));
    }
    else if (searching === true && totalResults > offset) {
      loading = true;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            data.sort((a, b) => {
              for (const column of sortColumns) {
                const valueA = a[column] || '';
                const valueB = b[column] || '';
                const comparison = valueA.localeCompare(valueB);
                if (comparison !== 0) {
                  return comparison;
                }
              }
              return 0;
            });
            displayData(data);
          }
        })
        .catch(error => console.log(error));
    }
  }
  function displayData(data) {
    for (const entry of data) {
      const row = document.createElement('tr');
      for (const column of Object.keys(filterColumns)) {
        const cell = document.createElement('td');
        const columnKeys = filterColumns[column];
        let columnValue = 'No Information Found';
        row.setAttribute('data-bs-toggle', 'modal');
        row.setAttribute('data-bs-target', '#moreInfo');
        row.setAttribute('role', 'button');
        row.setAttribute('class', 'tableRow');
        if (column === 'AN' || column === 'FRN') {
          const firstName = entry[columnKeys[0]];
          const lastName = entry[columnKeys[1]];
          if (firstName && lastName) {
            columnValue = `${firstName} ${lastName}`;
          } else if (firstName) {
            columnValue = firstName;
          } else if (lastName) {
            columnValue = lastName;
          }
        } else {
          for (const key of columnKeys) {
            if (entry.hasOwnProperty(key) && entry[key]) {
              const value = entry[key];
              // Check if the column represents a date
              if (column === 'AD' || column === 'ED' || column === 'ID') {
                columnValue = formatDate(value);
              }
              else {
                columnValue = value;
              }
            }
            break;
          }
        }
        cell.textContent = columnValue;
        row.appendChild(cell);
        // Add event listener to the row
        row.addEventListener('click', () => {
          const block = entry['block']; // Retrieve the block value
          const borough = entry['borough']; // Retrieve the borough value
          const lot = entry['lot']; // Retrieve the lot value

          // Call your function here with the block, borough, and lot values
          fetchAddress(block, borough, lot);
        });

        table.appendChild(row);
        loading = false;
      }
    }
  }

  // Helper function to format the date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (localStorage.getItem('dateDisplay') == 'MDY') {
      return `${month}/${day}/${year}`;
    }
    else {
      return `${day}/${month}/${year}`;
    }
  }

  function loadData() {
    searchResultCount.innerHTML = '';
    table.innerHTML = '';
    if (searching == false) {
      loading = true;
      let sortParam = '';
      if (currentSortColumn) {
        sortParam = `&$order=${currentSortColumn}%20${currentSortOrder}`;
      }
      loading = true;
      console.log(`${baseURL}/resource/${dataID}.json?$limit=20${sortParam}`)
      fetch(`${baseURL}/resource/${dataID}.json?$limit=20${sortParam}`) // Fetch the first 20 rows
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => {
            for (const column of sortColumns) {
              const valueA = a[column] || '';
              const valueB = b[column] || '';
              const comparison = valueA.localeCompare(valueB);
              if (comparison !== 0) {
                return comparison;
              }
            }
            return 0;
          });
          fetch(`${baseURL}/resource/${dataID}.json?$offset=${sortParam}`)
            .then(response => response.json())
            .then(data => {
              totalResults = data.length;
              console.log(totalResults);
            })
          currentPage = 1;
          displayData(data); // Call displayData() with the fetched data
        })
        .catch(error => console.log(error));
    }
  }

  // On page load
  loadData();

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 800 && currentPage > 0 && displayNoResult == false) {
      loadNextPage();
    }
  });

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    table.innerHTML = '';
    currentPage = 0;
    let sortParam = '';
    if (currentSortColumn) {
      sortParam = `&$order=${currentSortColumn}%20${currentSortOrder}`;
    }
    console.log('nah');
    if (query !== '') {
      console.log('is check');
      const encodedQuery = encodeURIComponent(query.replace(/ /g, '%20'));
      let filterQuery = '';

      if (ALL.checked == true) {
        url = `${baseURL}/resource/${dataID}.json?$where=applicant_business_address%20LIKE%20'%25${encodedQuery}%25'%20OR%20applicant_business_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20applicant_first_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20applicant_last_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20applicant_license%20LIKE%20'%25${encodedQuery}%25'%20OR%20bin%20LIKE%20'%25${encodedQuery}%25'%20OR%20block%20LIKE%20'%25${encodedQuery}%25'%20OR%20borough%20LIKE%20'%25${encodedQuery}%25'%20OR%20c_b_no%20LIKE%20'%25${encodedQuery}%25'%20OR%20%20estimated_job_costs%20LIKE%20'%25${encodedQuery}%25'%20OR%20filing_reason%20LIKE%20'%25${encodedQuery}%25'%20OR%20filing_representative_business_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20filing_representative_first_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20filing_representative_last_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20house_no%20LIKE%20'%25${encodedQuery}%25'%20OR%20job_description%20LIKE%20'%25${encodedQuery}%25'%20OR%20job_filing_number%20LIKE%20'%25${encodedQuery}%25'%20OR%20lot%20LIKE%20'%25${encodedQuery}%25'%20OR%20owner_business_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20owner_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20owner_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20permittee_s_license_type%20LIKE%20'%25${encodedQuery}%25'%20OR%20street_name%20LIKE%20'%25${encodedQuery}%25'%20OR%20work_on_floor%20LIKE%20'%25${encodedQuery}%25'%20OR%20work_permit%20LIKE%20'%25${encodedQuery}%25'%20OR%20work_type%20LIKE%20'%25${encodedQuery}%25'${sortParam}&$limit=${20}&$offset=${currentPage * pageSize}`;
      }
      else {
        selectedFilters.forEach(filter => {
          filterQuery += `applicant_business_address LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `applicant_business_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `applicant_first_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `applicant_last_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `applicant_license LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `bin LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `block LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `borough LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `c_b_no LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `estimated_job_costs LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `filing_reason LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `filing_representative_business_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `filing_representative_first_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `filing_representative_last_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `house_no LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `job_description LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `job_filing_number LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `lot LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `owner_business_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `owner_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `permittee_s_license_type LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `street_name LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `work_on_floor LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `work_permit LIKE '%25${encodedQuery}%25' OR `;
          filterQuery += `work_type LIKE '%25${encodedQuery}%25' OR `;
        });

        filterQuery = filterQuery.slice(0, -4); // Remove the trailing " OR " from the last filter
        url = `${baseURL}/resource/${dataID}.json?$where=${filterQuery}${sortParam}&$limit=${20}`;
      }
      console.log(filterQuery);
      console.log(url);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => {
            for (const column of sortColumns) {
              const valueA = a[column] || '';
              const valueB = b[column] || '';
              const comparison = valueA.localeCompare(valueB);
              if (comparison !== 0) {
                return comparison;
              }
            }
            return 0;
          });
          console.log(data);
          currentPage = 1;
          if (data.length == 0) {
            displayNoResults();
            displayNoResult = true;
            console.log(displayNoResult);
          }
          else {
            displayData(data); // Call displayData() with the fetched data
            searching = true;
            displayNoResult = false;
            console.log(displayNoResult);
          }
          fetch(`${baseURL}/resource/${dataID}.json?$where=${filterQuery}${sortParam}`)
            .then(response => response.json())
            .then(data => {
              totalResults = data.length;
              console.log(totalResults);
              searchResultCount.innerHTML = totalResults + ' results found.';
            })
        });
    }
  }
  function displayNoResults() {
    if (noInfoFoundCheck == false) {
      noInfoFoundCheck = true;
      const noResultsMessage = document.createElement('tr');
      const noResultsMessageInner = document.createElement('td');
      noResultsMessageInner.textContent = 'No results found.';
      noResultsMessageInner.setAttribute('colspan', '26');
      table.appendChild(noResultsMessage);
      noResultsMessage.appendChild(noResultsMessageInner);
      loading = false;
      sortButtons.forEach((button) => {
        button.classList.add('d-none');
      });
    }
  }

  loading.addEventListener('change', () => {
    if (loading || noInfoFoundCheck) {
      exportBTN.disabled = true;
    } 
    else {
      exportBTN.disabled = false;
    }
  });

  
  // The detector that starts it all
  searchInput.addEventListener('keydown', () => {
    if (searchInput !== '' && searchInput.key !== 'Backspace') {
      performSearch();
      noInfoFoundCheck = false;
      searching = true;
    }
    if (searchInput == '') {
      searchResultCount.innerHTML = '';
      loadData();
      noInfoFoundCheck = false
      searching = false;
    }
    loading = true;
    sortButtons.forEach((button) => {
      button.classList.remove('d-none');
    });
  });

  // Filter Initialization

  let ABA = document.querySelector('#ABA');
  if (ABA.checked) {
    selectedFilters.push('applicant_business_address');
  } else {
    selectedFilters.splice('applicant_business_address', 1);
  }
  ABA.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('applicant_business_address');
    } else {
      selectedFilters.splice('applicant_business_address', 1);
    }
  });

  let ABN = document.querySelector('#ABN');
  if (ABN.checked) {
    selectedFilters.push('applicant_business_name');
  } else {
    selectedFilters.splice('applicant_business_name', 1);
  }
  ABN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('applicant_business_name');
    } else {
      selectedFilters.splice('applicant_business_name', 1);
    }
  });

  let AN = document.querySelector('#AN');
  if (AN.checked) {
    selectedFilters.push('applicant_first_name', 'applicant_last_name');
  } else {
    selectedFilters.splice('applicant_first_name', 'applicant_last_name', 2);
  }
  AN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('applicant_first_name', 'applicant_last_name');
    } else {
      selectedFilters.splice('applicant_first_name', 'applicant_last_name', 2);
    }
  });

  let AL = document.querySelector('#AL');
  if (AL.checked) {
    selectedFilters.push('applicant_license');
  } else {
    selectedFilters.splice('applicant_license', 1);
  }
  AL.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('applicant_license');
    } else {
      selectedFilters.splice('applicant_license', 1);
    }
  });

  let B = document.querySelector('#B');
  if (B.checked) {
    selectedFilters.push('bin');
  } else {
    selectedFilters.splice('bin', 1);
  }
  B.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('bin');
    } else {
      selectedFilters.splice('bin', 1);
    }
  });

  let BL = document.querySelector('#BL');
  if (BL.checked) {
    selectedFilters.push('block');
  } else {
    selectedFilters.splice('block', 1);
  }
  BL.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('block');
    } else {
      selectedFilters.splice('block', 1);
    }
  });

  let BR = document.querySelector('#BR');
  if (BR.checked) {
    selectedFilters.push('borough');
  } else {
    selectedFilters.splice('borough', 1);
  }
  BR.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('borough');
    } else {
      selectedFilters.splice('borough', 1);
    }
  });

  let CB = document.querySelector('#CB');
  if (CB.checked) {
    selectedFilters.push('c_b_no');
  } else {
    selectedFilters.splice('c_b_no', 1);
  }
  CB.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('c_b_no');
    } else {
      selectedFilters.splice('c_b_no', 1);
    }
  });

  let EJC = document.querySelector('#EJC');
  if (EJC.checked) {
    selectedFilters.push('estimated_job_costs');
  } else {
    selectedFilters.splice('estimated_job_costs', 1);
  }
  EJC.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('estimated_job_costs');
    } else {
      selectedFilters.splice('estimated_job_costs', 1);
    }
  });

  let FR = document.querySelector('#FR');
  if (FR.checked) {
    selectedFilters.push('filing_reason');
  } else {
    selectedFilters.splice('filing_reason', 1);
  }
  FR.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('filing_reason');
    } else {
      selectedFilters.splice('filing_reason', 1);
    }
  });

  let FRBN = document.querySelector('#FRBN');
  if (FRBN.checked) {
    selectedFilters.push('filing_representative_business_name');
  } else {
    selectedFilters.splice('filing_representative_business_name'), 1;
  }
  FRBN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('filing_representative_business_name');
    } else {
      selectedFilters.splice('filing_representative_business_name', 1);
    }
  });

  let FRN = document.querySelector('#FRN');
  if (FRN.checked) {
    selectedFilters.push('filing_representative_first_name', 'filing_representative_last_name');
  } else {
    selectedFilters.splice('filing_representative_first_name', 'filing_representative_last_name', 2);
  }
  FRN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('filing_representative_first_name', 'filing_representative_last_name');
    } else {
      selectedFilters.splice('filing_representative_first_name', 'filing_representative_last_name', 2);
    }
  });

  let HN = document.querySelector('#HN');
  if (HN.checked) {
    selectedFilters.push('house_no');
  } else {
    selectedFilters.splice('house_no', 1);
  }
  HN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('house_no');
    } else {
      selectedFilters.splice('house_no', 1);
    }
  });

  let JD = document.querySelector('#JD');
  if (JD.checked) {
    selectedFilters.push('job_description');
  } else {
    selectedFilters.splice('job_description', 1);
  }
  JD.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('job_description');
    } else {
      selectedFilters.splice('job_description', 1);
    }
  });

  let JFN = document.querySelector('#JFN');
  if (JFN.checked) {
    selectedFilters.push('job_filing_number');
  } else {
    selectedFilters.splice('job_filing_number', 1);
  }
  JFN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('job_filing_number');
    } else {
      selectedFilters.splice('job_filing_number', 1);
    }
  });

  let LT = document.querySelector('#LT');
  if (LT.checked) {
    selectedFilters.push('lot');
  } else {
    selectedFilters.splice('lot', 1);
  }
  LT.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('permittee_s_license_type');
    } else {
      selectedFilters.splice('permittee_s_license_type', 1);
    }
  });

  let L = document.querySelector('#L');
  if (L.checked) {
    selectedFilters.push('lot');
  } else {
    selectedFilters.splice('lot', 1);
  }
  L.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('lot');
    } else {
      selectedFilters.splice('lot', 1);
    }
  });

  let OBN = document.querySelector('#OBN');
  if (OBN.checked) {
    selectedFilters.push('owner_business_name');
  } else {
    selectedFilters.splice('owner_business_name', 1);
  }
  OBN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('owner_business_name');
    } else {
      selectedFilters.splice('owner_business_name', 1);
    }
  });

  let ON = document.querySelector('#ON');
  if (ON.checked) {
    selectedFilters.push('owner_name');
  } else {
    selectedFilters.splice('owner_name', 1);
  }
  ON.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('owner_name');
    } else {
      selectedFilters.splice('owner_name', 1);
    }
  });

  let SN = document.querySelector('#SN');
  if (SN.checked) {
    selectedFilters.push('street_name');
  } else {
    selectedFilters.splice('street_name', 1);
  }
  SN.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('street_name');
    } else {
      selectedFilters.splice('street_name', 1);
    }
  });

  let WL = document.querySelector('#WL');
  if (WL.checked) {
    selectedFilters.push('work_permit');
  } else {
    selectedFilters.splice('work_permit', 1);
  }
  WL.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('work_on_floor');
    } else {
      selectedFilters.splice('work_on_floor', 1);
    }
  });

  let WP = document.querySelector('#WP');
  if (WP.checked) {
    selectedFilters.push('work_permit');
  } else {
    selectedFilters.splice('work_permit', 1);
  }
  WP.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('work_permit');
    } else {
      selectedFilters.splice('work_permit', 1);
    }
  });

  let WT = document.querySelector('#WT');
  if (WT.checked) {
    selectedFilters.push('work_type');
  } else {
    selectedFilters.splice('work_type', 1);
  }
  WT.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters.push('work_type');
    } else {
      selectedFilters.splice('work_type', 1);
    }
  });

  // The big boy
  let ALL = document.querySelector('#ALL');
  if (ALL.checked) {
    selectedFilters = [
      'applicant_business_address',
      'applicant_business_name',
      'applicant_first_name',
      'applicant_last_name',
      'applicant_license',
      'bin',
      'block',
      'borough',
      'c_b_no',
      'estimated_job_costs',
      'filing_reason',
      'filing_representative_business_name',
      'filing_representative_first_name',
      'filing_representative_last_name',
      'house_no',
      'job_description',
      'job_filing_number',
      'lot',
      'owner_business_name',
      'owner_name',
      'permittee_s_license_type',
      'street_name',
      'work_on_floor',
      'work_permit',
      'work_type'
    ];
  }
  ALL.addEventListener('change', (event) => {
    if (event.target.checked) {
      selectedFilters = [
        'applicant_business_address',
        'applicant_business_name',
        'applicant_first_name',
        'applicant_last_name',
        'applicant_license',
        'bin',
        'block',
        'borough',
        'c_b_no',
        'estimated_job_costs',
        'filing_reason',
        'filing_representative_business_name',
        'filing_representative_first_name',
        'filing_representative_last_name',
        'house_no',
        'job_description',
        'job_filing_number',
        'lot',
        'owner_business_name',
        'owner_name',
        'permittee_s_license_type',
        'street_name',
        'work_on_floor',
        'work_permit',
        'work_type'
      ];
    }
    else {
      selectedFilters = [];
    }
  });

  // Date changing stuff
  if (localStorage.getItem('dateDisplay')) {
    if (localStorage.getItem('dateDisplay') == 'MDY') {
      dateDisplaySet.innerHTML = 'Day/Month/Year';
    }
    else {
      dateDisplaySet.innerHTML = 'Month/Day/Year';
    }
  }
  else {
    localStorage.setItem('dateDisplay', 'MDY');
    dateDisplaySet.innerHTML = 'Day/Month/Year';
  }
  reloadButton.addEventListener('click', () => {
    if (localStorage.getItem('dateDisplay') == 'MDY') {
      localStorage.setItem('dateDisplay', 'DMY');
      dateDisplaySet.innerHTML = 'Month/Day/Year';
      dateChangeComplete = true;
      console.log('Bye!');
      location.reload();
    }
    else {
      localStorage.setItem('dateDisplay', 'MDY');
      dateDisplaySet.innerHTML = 'Day/Month/Year';
      dateChangeComplete = true;
      console.log('Bye!');
      location.reload();
    }
  });


  // Gear Loading show/hide
  setInterval(() => {
    if (loading == false) {
      loadingDiv.classList.add('d-none');
      html.classList.remove('overflowHide');
    }
    else if (loading == true) {
      loadingDiv.classList.remove('d-none');
      html.classList.add('overflowHide');
    }
  }, 100);
  // Order columns

  sortButtons.forEach(() => sortButtonsState.push(0));
  sortButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      handleSortButtonClick(index);
    });
  });

  function handleSortButtonClick(index) {
    // Change the state of the sort button
    sortButtonsState[index] = (sortButtonsState[index] + 1) % 3;

    // Update the selected sort column and order
    if (sortButtonsState[index] === 0) {
      // Default state, no sorting
      currentSortColumn = null;
      currentSortOrder = 'ascending';
      updateSortButtonAppearance(index);
    } else {
      // Sort by the selected column in the specified order
      const column = sortColumns[index];
      currentSortColumn = column;
      currentSortOrder = sortButtonsState[index] === 1 ? 'asc' : 'desc';
      updateSortButtonAppearance(index);
    }

    // Reset the sort button states if another button is pressed
    if (sortButtonsState[index] == 1) {
      resetSortButtonsState(index);
    }

    // Reload the data with the updated sorting
    resetTable();
    loadData();
  }

  function updateSortButtonAppearance(index) {
    const button = sortButtons[index];

    // Reset the button appearance
    button.classList.remove('ascending', 'descending');
    button.setAttribute('title', 'Sort by: None');

    if (sortButtonsState[index] == 1) {
      // First active state (ascending)
      button.classList.add('ascending');
      button.setAttribute('title', 'Sort by: Ascending');

    } else if (sortButtonsState[index] == 2) {
      // Second active state (descending)
      button.classList.add('descending');
      button.classList.remove('ascending');
      button.setAttribute('title', 'Sort by: Descending');
    } else {
      // Inactive state (fallback)
      button.classList.remove('ascending', 'descending');
      button.setAttribute('title', 'Sort by: None');
    }
  }

  function resetSortButtonsState(index) {
    sortButtonsState.forEach((state, i) => {
      if (i !== index) {
        sortButtonsState[i] = 0;
        updateSortButtonAppearance(i);
      }
    });
  }

  function resetTable() {
    table.innerHTML = '';
    currentPage = 0;
  }
  // Up arrow

  topButton.addEventListener('mouseenter', () => {
    hoverArrowClass = '-fill';
    topButton.setAttribute('class', 'bi ' + arrowClass + hoverArrowClass);
  });
  topButton.addEventListener('mouseleave', () => {
    hoverArrowClass = ' ';
    topButton.setAttribute('class', 'bi ' + arrowClass);
  });
  window.addEventListener('scroll', () => {
    const { scrollTop, scrollLeft } = document.documentElement;

    // Determine arrow direction based on user's position

    if (scrollTop <= 0 && scrollLeft <= 0) {
      arrowClass = 'd-none'; // Top left corner
    } else if (scrollTop <= 0) {
      arrowClass = 'bi-arrow-left-circle'; // Top, not left
    } else if (scrollLeft <= 0) {
      arrowClass = 'bi-arrow-up-circle'; // Left, not top
    } else {
      arrowClass = 'bi-arrow-up-left-circle'; // Not top or left
    }

    // Update the arrow's class
    if (hoverArrowClass) {
      topButton.setAttribute('class', 'bi ' + arrowClass + hoverArrowClass);
    }
    else {
      topButton.setAttribute('class', 'bi ' + arrowClass);
    }
  });
  // BBL to Address conversion
  function fetchAddress(block, borough, lot) {
    const url = `https://geoservice.planning.nyc.gov/geoservice/geoservice.svc/Function_BBL?Borough=${borough}&Block=${block}&Lot=${lot}&key=ABDHG7KaPdSgVkYp`;
    console.log(url);
    fetch(url, { mode: 'no-cors' }) // do not use CORS for this request as it's not supported by the DOB geoservice API
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const addressRangeList = data.display.AddressRangeList;
        if (addressRangeList.length > 0) {
          const streetName = addressRangeList[0].street_name.trim();
          const highAddressNumber = addressRangeList[0].high_address_number.trim();
          const lowAddressNumber = addressRangeList[0].low_address_number.trim();
          const addressDisplay = `${lowAddressNumber} - ${highAddressNumber} ${streetName}`;
          console.log(addressDisplay);
          // Handle the address display value as needed
        } else {
          console.log('No address information found');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});
