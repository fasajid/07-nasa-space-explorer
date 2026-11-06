
// NOTE: You do not need to edit this file.

// NASA's APOD API only has images from June 16, 1995 onwards
const earliestDate = '1995-06-16';

// Get today's date in YYYY-MM-DD format (required by date inputs)
const today = new Date().toISOString().split('T')[0];

function setupDateInputs(startInput, endInput) {
  // Keep the selected range to nine dates while staying inside NASA's archive.
  const daysInRange = 9;
  const daysOffset = daysInRange - 1;

  function changeDateByDays(date, numberOfDays) {
    const updatedDate = new Date(`${date}T00:00:00Z`);
    updatedDate.setUTCDate(updatedDate.getUTCDate() + numberOfDays);
    return updatedDate.toISOString().split('T')[0];
  }

  const earliestEndDate = changeDateByDays(earliestDate, daysOffset);
  const latestStartDate = changeDateByDays(today, -daysOffset);

  startInput.min = earliestDate;
  startInput.max = latestStartDate;
  endInput.min = earliestEndDate;
  endInput.max = today;

  // Default to the latest nine available dates.
  startInput.value = latestStartDate;
  endInput.value = today;

  // Move the end date when the start date changes.
  startInput.addEventListener('change', () => {
    endInput.value = changeDateByDays(startInput.value, daysOffset);
  });

  // Move the start date when the end date changes.
  endInput.addEventListener('change', () => {
    startInput.value = changeDateByDays(endInput.value, -daysOffset);
  });
}
