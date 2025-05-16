// Main Variables
let Input = document.querySelector(".get-repos input"),
getButton = document.querySelector(".get-repos-button"),
reposData = document.querySelector(".show-data");

getButton.onclick = function () {
    getRepos();
};

// Get Repos Function
async function getRepos() {
    if (Input.value == "") {
        reposData.innerHTML = "<span>Please, Enter GitHub Username First.</span>";
        return;
    }

    // Show loading state
    reposData.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading repositories...</div>';

    try {
        const response = await fetch(`https://api.github.com/users/${Input.value}/repos`);
        
        if (!response.ok) {
            if (response.status === 403) {
                const resetTime = new Date(response.headers.get('x-ratelimit-reset') * 1000);
                throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
            }
            throw new Error(`API request failed (Status: ${response.status})`);
        }

        const repositories = await response.json();
        
        // Empty Container
        reposData.innerHTML = "";

        if (repositories.length === 0) {
            reposData.innerHTML = "<span>No repositories found for this user.</span>";
            return;
        }

        // Loop on Repositories
        for (const repo of repositories) {
            // Fetch languages for this repository
            let languages = [];
            try {
                const langResponse = await fetch(repo.languages_url);
                if (langResponse.ok) {
                    const langData = await langResponse.json();
                    languages = Object.keys(langData);
                }
            } catch (e) {
                console.error("Error fetching languages:", e);
            }

            // Create Main Div Element
            let mainDiv = document.createElement("div");
            mainDiv.className = 'repo-box';

            // Create First Row Div
            let firstRow = document.createElement("div");
            firstRow.className = 'repo-first-row';

            // Create Repo Name (normal text)
            let repoName = document.createElement("h3");
            repoName.className = 'repo-name';
            repoName.textContent = repo.name;
            firstRow.appendChild(repoName);

            // Create Stars Count
            let StarsSpan = document.createElement("span");
            StarsSpan.className = 'stars-count';
            StarsSpan.innerHTML = `<i class="fas fa-star"></i> ${repo.stargazers_count}`;
            firstRow.appendChild(StarsSpan);

            // Watchers
            const watchersSpan = document.createElement("span");
            watchersSpan.className = 'watchers-count';
            watchersSpan.innerHTML = `<i class="fas fa-eye"></i> ${repo.watchers_count}`;
            firstRow.appendChild(watchersSpan);

            // Create Visit Link
            let Url = document.createElement('a');
            Url.className = 'repo-link';
            Url.textContent = "Visit";
            Url.href = repo.html_url;
            Url.target = '_blank';
            firstRow.appendChild(Url);

            mainDiv.appendChild(firstRow);

            // Create Description Div
            let descDiv = document.createElement("div");
            descDiv.className = 'repo-description';
            descDiv.textContent = repo.description || "No Description Exist";
            mainDiv.appendChild(descDiv);

            // Create Languages Div (only if languages exist)
            if (languages.length > 0) {
                let langDiv = document.createElement("div");
                langDiv.className = 'repo-languages';
                
                languages.forEach(lang => {
                    let langSpan = document.createElement("div");
                    langSpan.className = 'language-tag';
                    langSpan.textContent = lang;
                    langDiv.appendChild(langSpan);
                });
                
                mainDiv.appendChild(langDiv);
            }

            // Append The Main Div into The Container
            reposData.appendChild(mainDiv);
        }
    } catch (error) {
        reposData.innerHTML = `<span class="error">${error.message}</span>`;
        console.error("Error:", error);
    }
}