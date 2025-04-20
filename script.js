document.addEventListener('DOMContentLoaded', () => {
    // Task counts for each agent (excluding shared tasks)
    const taskCounts = {
        agent1: 18,
        agent2: 17,
        agent3: 6,
        agent4: 13,
        agent5: 21
    };

    // Shift names mapping
    const shiftNames = {
        agent1: 'AM Shift',
        agent2: 'Mid Shift',
        agent3: 'PM Shift',
        agent4: 'Start-Up AM Shift',
        agent5: 'Start-Up PM Shift'
    };

    // Initialize completed tasks for the current day
    const today = new Date().toISOString().split('T')[0];
    let completedTasks = JSON.parse(localStorage.getItem(`tasks-${today}`)) || [];
    let sharedTasks = JSON.parse(localStorage.getItem(`shared-tasks-${today}`)) || [];
    let assignedSharedTasks = JSON.parse(localStorage.getItem(`assigned-shared-tasks-${today}`)) || [];

    // Update progress bars
    function updateProgress() {
        const agentProgress = {
            agent1: 0,
            agent2: 0,
            agent3: 0,
            agent4: 0,
            agent5: 0
        };

        // Count completed static tasks
        completedTasks.forEach(task => {
            if (agentProgress[task.agent] !== undefined) {
                agentProgress[task.agent]++;
            }
        });

        // Count completed shared tasks
        assignedSharedTasks.forEach(task => {
            if (task.completed && agentProgress[task.agent] !== undefined) {
                agentProgress[task.agent]++;
            }
        });

        // Calculate total tasks per agent (static + shared)
        const totalTasksPerAgent = {};
        Object.keys(taskCounts).forEach(agent => {
            const assignedCount = assignedSharedTasks.filter(t => t.agent === agent).length;
            totalTasksPerAgent[agent] = taskCounts[agent] + assignedCount;
        });

        // Update agent progress bars on dashboard
        Object.keys(agentProgress).forEach(agent => {
            const total = totalTasksPerAgent[agent] || taskCounts[agent];
            const percentage = total > 0 ? (agentProgress[agent] / total) * 100 : 0;
            const progressBar = document.getElementById(`progress-${agent}`);
            const progressText = document.getElementById(`progress-${agent}-text`);
            if (progressBar && progressText) {
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        });

        // Update team progress bar
        const totalTasks = Object.values(totalTasksPerAgent).reduce((a, b) => a + b, 0);
        const totalCompleted = Object.values(agentProgress).reduce((a, b) => a + b, 0);
        const teamPercentage = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
        const teamBar = document.getElementById('progress-team');
        const teamText = document.getElementById('progress-team-text');
        if (teamBar && teamText) {
            teamBar.style.width = `${teamPercentage}%`;
            teamText.textContent = `${Math.round(teamPercentage)}%`;
        }
    }

    // Render report table
    function renderReport(tasks = completedTasks) {
        const tableBody = document.getElementById('report-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = 'border-t';
            row.innerHTML = `
                <td class="p-3 text-gray-700">${task.task}</td>
                <td class="p-3 text-gray-700">${shiftNames[task.agent]}</td>
                <td class="p-3 text-gray-700">${task.initials}</td>
                <td class="p-3 text-gray-700">${task.timestamp}</td>
            `;
            tableBody.appendChild(row);
        });

        // Add shared tasks to report
        assignedSharedTasks.forEach(task => {
            if (task.completed) {
                const row = document.createElement('tr');
                row.className = 'border-t';
                row.innerHTML = `
                    <td class="p-3 text-gray-700">${task.task} (Shared)</td>
                    <td class="p-3 text-gray-700">${shiftNames[task.agent]}</td>
                    <td class="p-3 text-gray-700">${task.initials || ''}</td>
                    <td class="p-3 text-gray-700">${task.timestamp || ''}</td>
                `;
                tableBody.appendChild(row);
            }
        });
    }

    // Render initiative list
    function renderInitiative() {
        const initiativeList = document.getElementById('initiative-list');
        if (!initiativeList) return;
        initiativeList.innerHTML = '';
        assignedSharedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.textContent = `${shiftNames[task.agent]}: ${task.task}`;
            initiativeList.appendChild(li);
        });
    }

    // Render shared tasks for the current agent
    function renderSharedTasks(currentAgent) {
        const sharedTasksList = document.getElementById('shared-tasks-list');
        if (!sharedTasksList) return;
        sharedTasksList.innerHTML = '';

        sharedTasks.forEach((task, index) => {
            // Check if the task is already assigned
            const assignedTask = assignedSharedTasks.find(t => t.task === task && t.agent !== currentAgent);
            if (assignedTask) return; // Skip if assigned to another agent

            const assignedToCurrent = assignedSharedTasks.find(t => t.task === task && t.agent === currentAgent);
            const li = document.createElement('li');
            li.className = 'flex items-center space-x-2';
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox shared-task-checkbox" data-task="${task}" data-agent="${currentAgent}" ${assignedToCurrent && assignedToCurrent.completed ? 'checked' : ''}>
                <label>${task}</label>
                <input type="text" class="initials-input border rounded px-1 py-0.5 w-12" maxlength="2" placeholder="Initials" ${assignedToCurrent && assignedToCurrent.completed ? `value="${assignedToCurrent.initials}"` : ''}>
                ${!assignedToCurrent ? `<button class="on-it-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors" data-task="${task}" data-agent="${currentAgent}">On It</button>` : ''}
            `;
            sharedTasksList.appendChild(li);
        });

        // Add event listeners for "On It" buttons
        document.querySelectorAll('.on-it-btn').forEach(button => {
            button.addEventListener('click', function() {
                const task = this.dataset.task;
                const agent = this.dataset.agent;

                // Assign the task to this agent
                assignedSharedTasks.push({ task, agent, completed: false });
                localStorage.setItem(`assigned-shared-tasks-${today}`, JSON.stringify(assignedSharedTasks));

                // Re-render shared tasks and update initiative
                renderSharedTasks(agent);
                renderInitiative();
                updateProgress();
            });
        });

        // Add event listeners for shared task checkboxes
        document.querySelectorAll('.shared-task-checkbox').forEach(checkbox => {
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
                    const assignedTask = assignedSharedTasks.find(t => t.task === task && t.agent === agent);
                    if (assignedTask) {
                        assignedTask.completed = true;
                        assignedTask.initials = initials;
                        assignedTask.timestamp = timestamp;
                    }
                    localStorage.setItem(`assigned-shared-tasks-${today}`, JSON.stringify(assignedSharedTasks));
                    updateProgress();
                    renderReport();
                } else {
                    const assignedTask = assignedSharedTasks.find(t => t.task === task && t.agent === agent);
                    if (assignedTask) {
                        assignedTask.completed = false;
                        assignedTask.initials = '';
                        assignedTask.timestamp = '';
                    }
                    localStorage.setItem(`assigned-shared-tasks-${today}`, JSON.stringify(assignedSharedTasks));
                    updateProgress();
                    renderReport();
                }
            });
        });
    }

    // Handle static task checkbox changes
    document.querySelectorAll('.task-checkbox:not(.shared-task-checkbox)').forEach(checkbox => {
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

    // Restore checkbox states for static tasks
    function restoreCheckboxes() {
        document.querySelectorAll('.task-checkbox:not(.shared-task-checkbox)').forEach(checkbox => {
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

    // Add new task
    const addTaskButton = document.getElementById('add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            const taskInput = document.getElementById('new-task-input');
            const task = taskInput.value.trim();
            if (!task) {
                alert('Please enter a task.');
                return;
            }
            sharedTasks.push(task);
            localStorage.setItem(`shared-tasks-${today}`, JSON.stringify(sharedTasks));
            taskInput.value = '';
            alert('Task added to all agents\' lists.');
        });
    }

    // Clear current day's data
    const clearButton = document.getElementById('clear-data');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear today\'s task data?')) {
                completedTasks = [];
                sharedTasks = [];
                assignedSharedTasks = [];
                localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
                localStorage.setItem(`shared-tasks-${today}`, JSON.stringify(sharedTasks));
                localStorage.setItem(`assigned-shared-tasks-${today}`, JSON.stringify(assignedSharedTasks));
                restoreCheckboxes();
                updateProgress();
                renderInitiative();
                renderReport();
            }
        });
    }

    // View historical data
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
            sharedTasks = [];
            assignedSharedTasks = [];
            localStorage.setItem(`tasks-${today}`, JSON.stringify(completedTasks));
            localStorage.setItem(`shared-tasks-${today}`, JSON.stringify(sharedTasks));
            localStorage.setItem(`assigned-shared-tasks-${today}`, JSON.stringify(assignedSharedTasks));
            restoreCheckboxes();
            updateProgress();
            renderInitiative();
            renderReport();
        }
    }
    setInterval(checkMidnight, 60000);

    // Initial setup
    restoreCheckboxes();
    updateProgress();
    renderInitiative();
    renderReport();
});