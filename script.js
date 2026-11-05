document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('log-form');
    const logsContainer = document.getElementById('logs-container');
    const confidenceInput = document.getElementById('confidence');
    const confidenceVal = document.getElementById('confidence-val');
    const streakCount = document.getElementById('streak-count');
    const weeklyProgress = document.getElementById('weekly-progress');
    const totalLogs = document.getElementById('total-logs');
    const logCounter = document.getElementById('log-counter');
    const searchInput = document.getElementById('search-logs');
    const btnExport = document.getElementById('btn-export');
    const btnProfileToggle = document.getElementById('btn-profile-toggle');
    const profileSection = document.getElementById('profile-section');
  
    const initialLogs = [
      {
        id: '1',
        date: '2026-06-14',
        tag: 'Full Stack',
        content: 'Learned how to configure Spring Security filter chains and validate JWT tokens.',
        confidence: 4
      },
      {
        id: '2',
        date: '2026-06-13',
        tag: 'DSA',
        content: 'Practiced sliding window technique on LeetCode. Solved "Longest Substring Without Repeating Characters".',
        confidence: 5
      },
      {
        id: '3',
        date: '2026-06-12',
        tag: 'Database',
        content: 'Read about PostgreSQL indexing strategies and foreign key constraints.',
        confidence: 3
      }
    ];
  
    let logs = JSON.parse(localStorage.getItem('devdiary_logs')) || initialLogs;
    let searchQuery = '';

    // Profile Toggle Handler
    btnProfileToggle.addEventListener('click', () => {
      profileSection.classList.toggle('profile-hidden');
      if (!profileSection.classList.contains('profile-hidden')) {
        profileSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Real-time confidence slider display update
    confidenceInput.addEventListener('input', (e) => {
      confidenceVal.textContent = `${e.target.value} / 5`;
    });

    // Search filter listener
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderLogs();
    });

    // Export logs feature
    btnExport.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `devdiary_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  
    // Calculate Streak & Stats
    function updateStats() {
      totalLogs.textContent = logs.length;
      logCounter.textContent = `${logs.length} log${logs.length === 1 ? '' : 's'} recorded`;
  
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentWeekly = logs.filter(item => new Date(item.date) >= sevenDaysAgo).length;
      weeklyProgress.textContent = `${recentWeekly} / 5 Logs`;
  
      const uniqueDates = [...new Set(logs.map(log => log.date))].sort().reverse();
      let streak = 0;
      let today = new Date().toISOString().split('T')[0];
  
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedStr = expectedDate.toISOString().split('T')[0];
  
        if (uniqueDates[i] === expectedStr || (i === 0 && uniqueDates[0] === today)) {
          streak++;
        } else {
          break;
        }
      }
  
      streakCount.textContent = `${streak > 0 ? streak : logs.length > 0 ? 1 : 0} Days 🔥`;
    }
  
    // Render logs list with search filtering
    function renderLogs() {
      logsContainer.innerHTML = '';
  
      const filteredLogs = logs.filter(log => 
        log.content.toLowerCase().includes(searchQuery) || 
        log.tag.toLowerCase().includes(searchQuery) ||
        log.date.includes(searchQuery)
      );

      if (filteredLogs.length === 0) {
        logsContainer.innerHTML = '<p class="empty-state">No matching logs found. Keep building and log your progress!</p>';
        updateStats();
        return;
      }
  
      filteredLogs.forEach(log => {
        const sanitizedTag = log.tag.replace(/\s+/g, '-');
        const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
  
        const logCard = document.createElement('div');
        logCard.className = 'log-item glass-item';
        logCard.innerHTML = `
          <div class="log-header">
            <span class="log-date">${formattedDate}</span>
            <span class="tag-badge ${sanitizedTag}">${log.tag}</span>
          </div>
          <p class="log-body">${escapeHTML(log.content)}</p>
          <div class="log-footer">
            <span class="confidence-display">Confidence: ${'★'.repeat(log.confidence)}${'☆'.repeat(5 - log.confidence)} (${log.confidence}/5)</span>
            <button class="btn-delete" data-id="${log.id}">Delete</button>
          </div>
        `;
  
        logsContainer.appendChild(logCard);
      });
  
      updateStats();
    }
  
    // Form submission handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        content: document.getElementById('content').value.trim(),
        tag: document.getElementById('tag').value,
        confidence: parseInt(document.getElementById('confidence').value, 10)
      };
  
      logs.unshift(newLog);
      localStorage.setItem('devdiary_logs', JSON.stringify(logs));
      
      form.reset();
      confidenceVal.textContent = '3 / 5';
      document.getElementById('confidence').value = 3;
  
      renderLogs();
    });
  
    // Delete handler
    logsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) {
        const idToDelete = e.target.dataset.id;
        logs = logs.filter(log => log.id !== idToDelete);
        localStorage.setItem('destdiary_logs', JSON.stringify(logs));
        localStorage.setItem('devdiary_logs', JSON.stringify(logs));
        renderLogs();
      }
    });
  
    // Utility to prevent XSS
    function escapeHTML(str) {
      const p = document.createElement('p');
      p.textContent = str;
      return p.innerHTML;
    }
  
    renderLogs();
});
