// Main Variables
let Input = document.querySelector(".get-repos input"),
    getButton = document.querySelector(".get-repos-button"),
    reposData = document.querySelector(".show-data");

const GITHUB_TOKEN = '';

// Cache implementation with expiration
const repoCache = new Map();

// Event Listeners
getButton.onclick = function () {
    getRepos();
};

Input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getRepos();
    }
});

async function getRepos() {
    const username = Input.value.trim();
    
    // Clear previous results
    reposData.innerHTML = '';
    
    // Add input validation
    if (!username) {
        showMessage("Please enter a GitHub username first");
        return;
    }

    showLoading();

    try {
        // Check caches first
        const cached = await checkCaches(username);
        if (cached) {
            displayRepos(cached.repositories);
            showCacheNotice(cached.timestamp);
            return;
        }

        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        
        if (userResponse.status === 404) {
            showUserNotFound(username);
            return;
        }

        if (userResponse.status === 403) {
            await handleRateLimit(userResponse, username);
            return;
        }

        if (!userResponse.ok) {
            throw new Error(`API error: ${userResponse.status}`);
        }

        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const repositories = await reposResponse.json();

        cacheRepos(username, repositories);
        
        if (repositories.length === 0) {
            showNoRepos(username);
            return;
        }

        displayRepos(repositories);

    } catch (error) {
        showError(error.message);
    }
}

// New function to show validation message
function showMessage(message) {
    reposData.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
}

// Cache functions
async function checkCaches(username) {
    // 1. Check memory cache
    if (repoCache.has(username)) {
        const cached = repoCache.get(username);
        if (Date.now() - cached.timestamp < 3600000) { // 1 hour
            return cached;
        }
    }

    // 2. Check localStorage
    const stored = localStorage.getItem(`gh-${username}`);
    if (stored) {
        const cached = JSON.parse(stored);
        if (Date.now() - cached.timestamp < 86400000) { // 24 hours
            // Update memory cache
            repoCache.set(username, cached);
            return cached;
        }
        localStorage.removeItem(`gh-${username}`);
    }

    return null;
}

function cacheRepos(username, repositories) {
    const cacheData = {
        repositories,
        timestamp: Date.now()
    };
    repoCache.set(username, cacheData);
    try {
        localStorage.setItem(`gh-${username}`, JSON.stringify(cacheData));
    } catch (e) {
        console.warn("LocalStorage full");
    }
}

// Rate limit handling
async function handleRateLimit(response, username) {
    const resetTime = new Date(response.headers.get('x-ratelimit-reset') * 1000);
    const now = new Date();
    const timeUntilReset = Math.ceil((resetTime - now) / 1000 / 60); // in minutes
    
    // Try to show cached data
    const cached = await checkCaches(username);
    if (cached) {
        displayRepos(cached.repositories);
        showRateLimitWarning(timeUntilReset, true);
        return;
    }
    
    // No cache available
    showRateLimitWarning(timeUntilReset, false);
}

// Display functions
function showRateLimitWarning(minutesUntilReset, hasCache) {
    const resetTime = new Date();
    resetTime.setMinutes(resetTime.getMinutes() + minutesUntilReset);
    
    const timeString = resetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = resetTime.toLocaleDateString();
    
    if (hasCache) {
        reposData.innerHTML = `
            <div class="rate-limit-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <p>GitHub API rate limit reached (resets at ${timeString} on ${dateString})</p>
                    <p class="cache-notice">Showing cached results</p>
                </div>
            </div>
        `;
    } else {
        reposData.innerHTML = `
            <div class="rate-limit-error">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <p>GitHub API rate limit reached. Please come back at ${timeString} on ${dateString}</p>
                    <p class="small">(about ${minutesUntilReset} minutes from now)</p>
                </div>
            </div>
        `;
    }
}

function showLoading() {
    reposData.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading repositories...</span>
        </div>
    `;
}

function showUserNotFound(username) {
    reposData.innerHTML = `
        <div class="not-found">
            <i class="fas fa-user-times"></i>
            <span>User "${username}" not found</span>
        </div>
    `;
}

function showNoRepos(username) {
    reposData.innerHTML = `
        <div class="no-repos">
            <i class="fas fa-folder-open"></i>
            <span>${username} has no public repositories</span>
        </div>
    `;
}

function showError(message) {
    reposData.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
}

function showCacheNotice(timestamp) {
    const cacheTime = new Date(timestamp).toLocaleString();
    const notice = document.createElement("div");
    notice.className = "cache-notice";
    notice.innerHTML = `<i class="fas fa-info-circle"></i> Showing cached data from ${cacheTime}`;
    reposData.appendChild(notice);
}

// Display repositories function
async function displayRepos(repositories) {
    reposData.innerHTML = "";

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

        // Create Repo Name
        let repoName = document.createElement("h3");
        repoName.className = 'repo-name';
        repoName.textContent = repo.name;
        firstRow.appendChild(repoName);

        // Create Stars Count
        let StarsSpan = document.createElement("span");
        StarsSpan.className = 'stars-count';
        StarsSpan.innerHTML = `<i class="fas fa-star"></i> ${repo.stargazers_count}`;
        firstRow.appendChild(StarsSpan);

        // Watchers Count
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
}
