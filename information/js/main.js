// Замените 'username' и 'repository' на соответствующие значения вашего репозитория
const username = 'Makar-Ts';
const repository = 'CTS_Database';

// Функция для получения данных с GitHub API
async function getCommits() {
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/commits`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch commits');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Функция для отображения коммитов на странице
async function displayCommits() {
    const commitsContainer = document.getElementById('commits-container');
    const commits = await getCommits();
    commits.forEach(commit => {
        const commitElement = document.createElement('div');
        const commitDate = new Date(commit.commit.author.date);
        commitElement.innerHTML = `
            <strong>${commit.commit.author.name}</strong>: 
            ${commit.commit.message}
            <br>
            <small>Date: ${commitDate.toLocaleString()}</small>
        `;
        commitElement.setAttribute("style", 'padding-bottom: 5px; margin-left: 20px; margin-bottom: 15px; border-bottom: 1px solid #ffffff;');
        commitsContainer.appendChild(commitElement);
    });
}

// Вызываем функцию для отображения коммитов
displayCommits();