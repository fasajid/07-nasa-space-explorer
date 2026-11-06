// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const spaceFact = document.getElementById('spaceFact');
const nasaApiKey = 'DEMO_KEY';

// Store a few fun space facts and show one at random when the page loads.
const spaceFacts = [
	"A day on Venus is longer than its year.",
	"Saturn is so low in density that it would float in a giant body of water.",
	"Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
	"The Sun contains about 99.8% of the mass in our solar system.",
	"Without wind or rain, footprints on the Moon can last for millions of years."
];

const randomFactIndex = Math.floor(Math.random() * spaceFacts.length);
spaceFact.textContent = spaceFacts[randomFactIndex];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', () => imageModal.close());

imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		imageModal.close();
	}
});

function openImageModal(image) {
	modalImage.src = image.hdurl || image.url;
	modalImage.alt = image.title;
	modalTitle.textContent = image.title;
	modalDate.textContent = image.date;
	modalExplanation.textContent = image.explanation;
	imageModal.showModal();
}

function showGalleryMessage(message) {
	const messageElement = document.createElement('p');
	messageElement.className = 'gallery-message';
	messageElement.textContent = message;
	gallery.replaceChildren(messageElement);
}

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		showGalleryMessage('Choose a valid start and end date.');
		return;
	}

	const dayInMilliseconds = 24 * 60 * 60 * 1000;
	const numberOfDays = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / dayInMilliseconds + 1;

	if (numberOfDays !== 9) {
		showGalleryMessage('Choose a date range of exactly 9 consecutive days.');
		return;
	}

	showGalleryMessage('🔄 Loading space photos...');
	getImagesButton.disabled = true;

	const parameters = new URLSearchParams({
		api_key: nasaApiKey,
		start_date: startDate,
		end_date: endDate
	});

	try {
		const response = await fetch(`https://api.nasa.gov/planetary/apod?${parameters}`);

		if (!response.ok) {
			throw new Error('NASA could not load images for those dates. Please try again.');
		}

		const images = await response.json();
		gallery.replaceChildren();

		images.forEach((image) => {
			const item = document.createElement('article');
			item.className = 'gallery-item';

			const title = document.createElement('h2');
			title.className = 'gallery-title';
			title.textContent = image.title;
			item.appendChild(title);

			if (image.media_type === 'image') {
				item.tabIndex = 0;
				item.setAttribute('role', 'button');
				item.setAttribute('aria-label', `Open details for ${image.title}`);
				item.addEventListener('click', () => openImageModal(image));
				item.addEventListener('keydown', (event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						openImageModal(image);
					}
				});

				const picture = document.createElement('img');
				picture.src = image.hdurl || image.url;
				picture.alt = image.title;
				item.appendChild(picture);
			} else if (image.media_type === 'video') {
				const video = document.createElement('iframe');
				video.className = 'gallery-video';
				video.src = image.url;
				video.title = image.title;
				video.loading = 'lazy';
				video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
				video.allowFullscreen = true;
				item.appendChild(video);

				const videoLink = document.createElement('a');
				videoLink.className = 'video-link';
				videoLink.href = image.url;
				videoLink.target = '_blank';
				videoLink.rel = 'noopener noreferrer';
				videoLink.textContent = 'Open video';
				item.appendChild(videoLink);
			}

			const date = document.createElement('p');
			date.className = 'gallery-date';
			date.textContent = image.date;
			item.appendChild(date);

			const explanation = document.createElement('p');
			explanation.className = 'gallery-explanation';
			explanation.textContent = image.explanation;
			item.appendChild(explanation);

			gallery.appendChild(item);
		});
	} catch (error) {
		showGalleryMessage(error.message);
	} finally {
		getImagesButton.disabled = false;
	}
}
