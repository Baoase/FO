document.addEventListener('DOMContentLoaded', () => {
    // Task counts for each agent
    const taskCounts = {
        agent1: 18,
        agent2: 17,
        agent3: 6,
        agent4: 13,
        agent5: 21
    };

    // Initialize completed tasks for the current day
    const today = new Date().toISOString().split('T')[0];
    let completedTasks = JSON.parse(localStorage.getItem(`tasks-${today}`)) || [];

    // Initialize team progress chart (only on index.html)
    let teamChart = null;
    if (document.getElementById('progress-team')) {
        teamChart = new Chart(document.getElementById('progress-team'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#3b82f6', '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                circumference: 360,
                rotation: -90,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: { animateScale: true }
            },
            plugins: [{
                id: 'textCenter',
                beforeDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.restore();
                    ctx.font = 'bold 12px Arial';
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    const text = `${Math.round(chart.data.datasets[0].data[0])}%`;
                    ctx.fillText(text, width / 2, height / 2);
                    ctx.save();
                }
            }]
        });
    }

    // Update progress bars and team chart
    function updateProgress() {
        const agentProgress = {
            agent1: 0,
            agent2: 0,
            agent3: 0,
            agent4: 0,
            agent5: 0
        };

        completedTasks.forEach(task => {
            if (agentProgress[task.agent] !== undefined) {
                agentProgress[task.agent]++;
            }
        });

        // Update agent progress bars
        Object.keys(agentProgress).forEach(agent => {
            const percentage = (agentProgress[agent] / taskCounts[agent]) * 100;
            const progressBar = document.getElementById(`progress-${agent}`);
            const progressText = document.getElementById(`progress-${agent}-text`);
            if (progressBar && progressText) {
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        });

        // Update team chart
        if (teamChart) {
            const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
            const totalCompleted = Object.values(agentProgress).reduce((a, b) => a + b, 0);
            const teamPercentage = (totalCompleted / totalTasks) * 100;
            teamChart.data.datasets[0].data = [teamPercentage, 100 - teamPercentage];
            teamChart.update();
        }
    }

    // Render report table (only on index.html)
    function renderReport(tasks = completedTasks) {
        const tableBody = document.getElementById('report-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = 'border-t';
            row.innerHTML = `
                <td class="p-3 text-gray-700">${task.task}</td>
                <td class="p-3 text-gray-700">${task.agent.replace('agent', 'Agent ')}</td>
                <td class="p-3 text-gray-700">${task.initials}</td>
                <td class="p-3 text-gray-700">${task.timestamp}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Handle checkbox changes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const initialsInput = this.parentElement.querySelector('.initials-input');
            const initials = initialsInput.value.trim().toUpperCase();
            const task = this.dataset.task;
            const agent = this.dataset.agent;

            if (this.checked) {
                if (!/^[A-Z]{2}$/.test(initials)) {
                    alert('Please enter exactly two alphabetic initials.');
                    this.checked = false;
                    return;
                }
                const timestamp = new Date().toLocaleString();
                completedTasks.push({ task, agent, initials, timestamp });
                localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
                updateProgress();
                renderReport();
            } else {
                const index = completedTasks.findIndex(t => t.task === task && t.agent === agent && t.initials === initials);
                if (index !== -1) {
                    completedTasks.splice(index, 1);
                    localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
                    updateProgress();
                    renderReport();
                }
            }
        });
    });

    // Restore checkbox states
    function restoreCheckboxes() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            const task = checkbox.dataset.task;
            const agent = checkbox.dataset.agent;
            const completedTask = completedTasks.find(t => t.task === task && t.agent === agent);
            if (completedTask) {
                checkbox.checked = true;
                checkbox.parentElement.querySelector('.initials-input').value = completedTask.initials;
            } else {
                checkbox.checked = false;
                checkbox.parentElement.querySelector('.initials-input').value = '';
            }
        });
    }

    // Clear current day's data (only on index.html)
    const clearButton = document.getElementById('clear-data');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear today\'s task data?')) {
                completedTasks = [];
                localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
                restoreCheckboxes();
                updateProgress();
                renderReport();
            }
        });
    }

    // View historical data (only on index.html)
    const viewHistoryButton = document.getElementById('view-history');
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', () => {
            const date = document.getElementById('history-date').value;
            if (!date) {
                alert('Please select a date.');
                return;
            }
            const tasks = JSON.parse(localStorage.getItem(`tasks-${date}`)) || [];
            renderReport(tasks);
        });
    }

    // Auto-clear at midnight
    function checkMidnight() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            completedTasks = [];
            localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
            restoreCheckboxes();
            updateProgress();
            renderReport();
        }
    }
    setInterval(checkMidnight, 60000); // Check every minute

    // Initial setup
    restoreCheckboxes();
    updateProgress();
    renderReport();
});
