document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('log-form');
    const logsContainer = document.getElementById('logs-container');
    const confidenceInput = document.getElementById('confidence');
    const confidenceVal = document.getElementById('confidence-val');
    const streakCount = document.getElementById('streak-count');
    const weeklyProgress = document.getElementById('weekly-progress');
    const totalLogs = document.getElementById('total-logs');
    const logCounter = document.getElementById('log-counter');
  
    // Initial dummy state or fetch from localStorage
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
        tag: 'Other',
        content: 'Read about PostgreSQL indexing and foreign key constraints.',
        confidence: 3
      }
    ];
  
    let logs = JSON.parse(localStorage.getItem('devdiary_logs')) || initialLogs;
  
    // Real-time confidence slider display update
    confidenceInput.addEventListener('input', (e) => {
      confidenceVal.textContent = `${e.target.value} / 5`;
    });
  
    // Calculate Streak & Stats
    function updateStats() {
      totalLogs.textContent = logs.length;
      logCounter.textContent = `${logs.length} log${logs.length === 1 ? '' : 's'} recorded`;
  
      // Simple weekly goal (logs in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentWeekly = logs.filter(item => new Date(item.date) >= sevenDaysAgo).length;
      weeklyProgress.textContent = `${recentWeekly} / 5 Logs`;
  
      // Dynamic streak calculation based on dates
      const uniqueDates = [...new Set(logs.map(log => log.date))].sort().reverse();
      let streak = 0;
      let today = new Date().toISOString().split('T')[0];
  
      for (let i = 0; i < uniqueDates.length; i++) {
        const entryDate = new Date(uniqueDates[i]);
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
  
    // Render logs list
    function renderLogs() {
      logsContainer.innerHTML = '';
  
      if (logs.length === 0) {
        logsContainer.innerHTML = '<p class="empty-state">No logs yet. Complete your first study session above!</p>';
        updateStats();
        return;
      }
  
      logs.forEach(log => {
        const sanitizedTag = log.tag.replace(/\s+/g, '-');
        const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
  
        const logCard = document.createElement('div');
        logCard.className = 'log-item';
        logCard.innerHTML = `
          <div class="log-header">
            <span class="log-date">${formattedDate}</span>
            <span class="tag-badge ${sanitizedTag}">${log.tag}</span>
          </div>
          <p class="log-body">${escapeHTML(log.content)}</p>
          <div class="log-footer">
            <span>Confidence: ${'★'.repeat(log.confidence)}${'☆'.repeat(5 - log.confidence)} (${log.confidence}/5)</span>
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
        localStorage.setItem('devdiary_logs', JSON.stringify(logs));
        renderLogs();
      }
    });
  
    // Utility to prevent XSS in client-rendered logs
    function escapeHTML(str) {
      const p = document.createElement('p');
      p.textContent = str;
      return p.innerHTML;
    }
  
    renderLogs();
  });