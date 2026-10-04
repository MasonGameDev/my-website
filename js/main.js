// Find the <div id="news-content"> in index.html.
// This is the container where all of the developer news will appear.
const newsContainer = document.getElementById('news-content');

// Only run the news code if this page actually has the news container.
// This allows main.js to be used on other pages without causing errors.
if (newsContainer) {

    // fetch() requests our JSON file from the server.
    // The path is relative to the page that loaded this script.
    fetch('json/developerNews.json')

        // .then() runs after fetch() receives a response from the server.
        // "response" contains information about that request.
        .then(response => {

            // response.ok is true when the request was successful.
            // If something went wrong, stop the process and create an error.
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            // Convert the JSON response into a JavaScript object.
            // The next .then() will receive this object as "data".
            return response.json();
        })

        // This runs after the JSON has been successfully converted into JavaScript.
        // "data" now represents everything inside developerNews.json.
        .then(data => {

            // Make sure our JSON has a "days" array.
            // Without this, the code would not know where the news is stored.
            if (!Array.isArray(data.days)) {
                throw new Error('Developer news must contain a days array.');
            }

            // Make a copy of the days array and sort it from newest to oldest.
            // Because our dates use YYYY-MM-DD, they can be safely compared as text.
            const days = [...data.days].sort((first, second) =>
                second.date.localeCompare(first.date)
            );

            // A DocumentFragment is a temporary container.
            // We build the entire news section here before putting it on the page.
            const fragment = document.createDocumentFragment();

            // Go through every day in the JSON file.
            for (const day of days) {

                // Make sure each day has the correct date format and an articles array.
                // This helps catch mistakes in the JSON before they cause strange errors.
                if (
                    !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
                    !Array.isArray(day.articles)
                ) {
                    throw new Error(
                        'Each news day needs a YYYY-MM-DD date and an articles array.'
                    );
                }

                // Create a <section> for this particular day.
                const daySection = document.createElement('section');

                // Give the section a CSS class so it can be styled.
                daySection.className = 'news-day';

                // Create an <h2> that will display the date.
                const dateHeading = document.createElement('h2');

                // Give the date heading its own CSS class.
                dateHeading.className = 'news-day-date';

                // Our JSON stores dates like "2026-09-30".
                // split() separates that into ["2026", "09", "30"].
                // map(Number) converts those strings into actual numbers.
                // Destructuring then stores them in year, month, and date.
                const [year, month, date] = day.date.split('-').map(Number);

                // JavaScript counts months from 0 instead of 1.
                // Therefore, October is 9 instead of 10, which is why we use month - 1.
                const formattedDate = new Date(year, month - 1, date);

                // Convert the date into a readable format such as:
                // "Wednesday, September 30, 2026"
                dateHeading.textContent = formattedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Put the date heading inside this day's section.
                daySection.append(dateHeading);

                // Now go through every article belonging to this day.
                for (const item of day.articles) {

                    // Create an <article> element for the news post.
                    const article = document.createElement('article');

                    // Give the article a CSS class for styling.
                    article.className = 'news-item';

                    // Create an <h3> for the article title.
                    const title = document.createElement('h3');

                    // textContent puts the title in as plain text.
                    // This is safer than inserting raw HTML from the JSON file.
                    title.textContent = item.title;

                    // Create a <p> element for the article's main content.
                    const content = document.createElement('p');

                    // Put the article's content into the paragraph.
                    content.textContent = item.content;

                    // Put the title and content inside the article.
                    article.append(title, content);

                    // Put the completed article inside the day's section.
                    daySection.append(article);
                }

                // Once this day's section is finished,
                // add it to our temporary fragment.
                fragment.append(daySection);
            }

            // Replace whatever is currently inside #news-content
            // with all of the news we just created.
            newsContainer.replaceChildren(fragment);
        })

        // If fetch(), JSON parsing, or our validation fails,
        // the code jumps here.
        .catch(error => {

            // Print the actual error in the browser console.
            // This helps you figure out what went wrong while developing.
            console.error('Error fetching developer news:', error);

            // Give visitors a friendly message instead of leaving
            // an empty news section on the page.
            newsContainer.innerHTML =
                '<p>Developer news is unavailable right now.</p>';
        });
}