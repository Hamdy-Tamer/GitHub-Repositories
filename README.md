A clean, responsive web app that fetches and displays GitHub user repositories with:
- Repository details (name, description, language)
- Engagement metrics (stars, watchers, forks)
- Direct links to each repository

## Features ✨

✅ **Dynamic Repository Fetching**  
   - Retrieves public repositories for any GitHub user  
   - Real-time API data with error handling  

✅ **Engagement Metrics**  
   - ★ Star count  
   - 👁 Watcher count  
   - 🍴 Fork count  

✅ **Clean UI**  
   - Responsive design  
   - Loading states  
   - Error handling  

✅ **Tech Stack**  
   ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
   ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
   ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
   ![GitHub API](https://img.shields.io/badge/GitHub_API-181717?style=flat&logo=github&logoColor=white)

## How It Works 🛠️

1. **User Input**  
   ```javascript
   fetch(`https://api.github.com/users/${username}/repos`)
