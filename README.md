Back Office Checklist
A modern, interactive checklist for back office tasks, split into separate pages for each agent (Agent 1 to Agent 5), with a dashboard for team progress and reporting. Built with HTML, CSS, JavaScript, Tailwind CSS, and Chart.js.
Features

Separate Agent Pages: Individual checklists for Agent 1 to Agent 5, accessible from a main dashboard.
Progress Visualization: Progress bars for each agent and a team progress circle on the dashboard.
Daily Reset: Automatically clears at midnight, saving data for historical review.
Historical Data: View past days' task completions by selecting a date on the dashboard.
Responsive Design: Works on desktop and mobile devices.
Local Storage: Persists data in the browser's localStorage.

Setup

Clone the repository:git clone https://github.com/your-username/back-office-checklist.git


Navigate to the project directory:cd back-office-checklist


Open index.html in a web browser to access the dashboard.

Deployment to GitHub Pages

Ensure all files are in the repository root: index.html, agent1.html, agent2.html, agent3.html, agent4.html, agent5.html, style.css, script.js, README.md.
Push the repository to GitHub:git add .
git commit -m "Initial commit"
git push origin main


Enable GitHub Pages:
Go to the repository on GitHub.
Navigate to Settings > Pages.
Set the Source to main branch and / (root) folder.
Save and wait for the site to be deployed (URL will be https://your-username.github.io/back-office-checklist).


Access the checklist at the provided GitHub Pages URL.

File Structure

index.html: Dashboard with navigation, team progress, and completion report.
agent1.html, agent2.html, agent3.html, agent4.html, agent5.html: Agent-specific checklists.
style.css: Custom CSS for animations and styling.
script.js: JavaScript for checklist functionality, progress updates, and data storage.
README.md: Project documentation.

Dependencies

Tailwind CSS: Loaded via CDN for styling.
Chart.js: Loaded via CDN for the team progress circle.

Usage

Navigate: Use the dashboard (index.html) to access each agent’s checklist.
Complete Tasks: Check a task’s checkbox and enter two alphabetic initials to mark it complete.
View Progress: Progress bars on agent pages and the team circle on the dashboard show completion percentages.
Clear Data: Click "Clear Current Day" on the dashboard to reset today’s tasks.
View History: Select a date and click "View History" on the dashboard to see past task completions.
Daily Reset: The checklist resets automatically at midnight, saving the day’s data.

Notes

Data is stored in the browser’s localStorage, persisting only on the same device and browser.
For persistent server-side storage, consider integrating a backend (not included).
Ensure an internet connection for CDN-loaded dependencies.

License
MIT License. See LICENSE for details.
