const salesforceRelease = {
    releases: [
        { name: "Spring '26", status: "Released", date: "February 2026", details: "Includes new prompt builder updates, LWC offline capabilities, and improved reporting features.", link: "https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&release=258" },
        { name: "Summer '26", status: "Active", date: "June 2026", details: "Brings enhanced Data Cloud integrations, AI copilot enhancements, and Einstein features.", link: "https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&release=259" },
        { name: "Winter '27", status: "Upcoming", date: "October 2026", details: "Preview expected to include advanced Agentforce capabilities and deeper AI workflows.", link: "" }
    ],

    render() {
        document.getElementById('page-title').textContent = 'Salesforce Releases';
        const content = document.getElementById('app-content');
        
        let html = `
            <div class="sf-release-container glass-panel" style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <p style="color: var(--text-muted); margin: 0;">Salesforce releases major updates 3 times a year. Keep track of the current and upcoming releases below.</p>
                    <button class="btn btn-primary" onclick="salesforceRelease.checkForNewRelease()">
                        <i class='bx bx-refresh'></i> Check for New Release
                    </button>
                </div>
                
                <div class="release-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;" id="sf-release-list">
                    ${this.generateReleaseListHtml()}
                </div>
            </div>
        `;

        content.innerHTML = html;
    },

    generateReleaseListHtml() {
        let html = '';
        // Only display the top 3 latest releases
        const displayReleases = this.releases.slice(-3);
        
        displayReleases.forEach(release => {
            let statusColor = '#a8ff60'; // default active/released
            if (release.status === 'Upcoming' || release.status === 'Preview') statusColor = '#f39c12';
            else if (release.status === 'Active') statusColor = '#3498db';

            const linkHtml = release.link
                ? `<a href="${release.link}" target="_blank" style="display: inline-flex; align-items: center; color: var(--primary-color); text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        View Release Notes <i class='bx bx-link-external' style="margin-left: 4px;"></i>
                   </a>`
                : `<span style="display: inline-flex; align-items: center; color: var(--text-muted); font-weight: 500; font-size: 0.9rem; cursor: not-allowed; opacity: 0.5;" title="Official release notes not yet available">
                        View Release Notes <i class='bx bx-link-external' style="margin-left: 4px;"></i>
                   </span>`;

            html += `
                <div class="release-card" style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); position: relative; overflow: hidden; transition: transform 0.2s ease;">
                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${statusColor};"></div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <h3 style="margin: 0; color: var(--primary-color); font-size: 1.25rem;">${release.name}</h3>
                        <span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; color: ${statusColor}; font-weight: bold; border: 1px solid ${statusColor}40;">${release.status}</span>
                    </div>
                    <div style="margin-bottom: 12px; color: var(--text-main); font-weight: 500; display: flex; align-items: center;">
                        <i class='bx bx-calendar' style="margin-right: 6px; color: var(--text-muted); font-size: 1.1rem;"></i> ${release.date}
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin: 0 0 16px 0;">${release.details}</p>
                    ${linkHtml}
                </div>
            `;
        });
        return html;
    },

    checkForNewRelease() {
        // Show loading state on button
        const btn = document.querySelector('button[onclick="salesforceRelease.checkForNewRelease()"]');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Checking...`;
        btn.disabled = true;

        // Simulate network request
        setTimeout(() => {
            // Add a new release to the list
            const hasSpring27 = this.releases.find(r => r.name === "Spring '27");
            
            if (!hasSpring27) {
                this.releases.push({
                    name: "Spring '27",
                    status: "Preview",
                    date: "February 2027",
                    details: "Next-gen AI capabilities, improved flows, and new Data Cloud connectors.",
                    link: "" // Demonstrating missing official release notes for preview
                });
                
                // Update UI
                const listContainer = document.getElementById('sf-release-list');
                if (listContainer) {
                    listContainer.innerHTML = this.generateReleaseListHtml();
                }
                window.app.showToast('Successfully updated with the most latest release!', 'success');
            } else {
                window.app.showToast('You are already up to date with the latest releases.', 'success');
            }
            
            // Restore button
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 1200);
    }
};
