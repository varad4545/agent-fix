
const config = {
    apiEndpoint: 'https://api.example.com/v1',
    defaultUserImage: '/assets/default-avatar.png',
    maxCommentLength: 500
  };
  
  const userProfileContainer = document.getElementById('user-profile');
  const commentSection = document.getElementById('comment-section');
  const searchResultsContainer = document.getElementById('search-results');
  const userInfoPanel = document.getElementById('user-info');
  

  let currentUser = {
    id: 42,
    username: 'johnsmith',
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: true
    }
  };
  
  /**
   * Fetches and displays user profile data
   * @param {number} userId 
   */
  async function loadUserProfile(userId) {
    try {
      const response = await fetch(`${config.apiEndpoint}/users/${userId}`);
      const userData = await response.json();
      

      userProfileContainer.innerHTML = `
        <div class="profile-header">
          <h2>${userData.displayName}</h2>
          <img src="${userData.avatarUrl || config.defaultUserImage}" alt="Profile picture">
          <div class="user-bio">${userData.bio}</div>
        </div>
      `;
      

      loadUserActivity(userId);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      userProfileContainer.innerHTML = '<p>Failed to load user profile. Please try again later.</p>';
    }
  }
  
  /**
   * @param {number} userId 
   */
  async function loadUserActivity(userId) {
    try {
      const response = await fetch(`${config.apiEndpoint}/users/${userId}/activity`);
      const activities = await response.json();
      
      let activityHtml = '<h3>Recent Activity</h3><ul class="activity-list">';
      
      activities.forEach(activity => {

        activityHtml += `<li class="activity-item" data-type="${activity.type}">
          <span class="activity-time">${formatDate(activity.timestamp)}</span>
          <span class="activity-description">${activity.description}</span>
        </li>`;
      });
      
      activityHtml += '</ul>';
      

      userProfileContainer.innerHTML += activityHtml;
    } catch (error) {
      console.error('Failed to load user activity:', error);
    }
  }
  
  /**
   * @param {string} query 
   */
  function displaySearchResults(query) {

    searchResultsContainer.innerHTML = `<h3>Search Results for: ${query}</h3>`;
    
    fetch(`${config.apiEndpoint}/search?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(results => {
        if (results.length === 0) {

          searchResultsContainer.innerHTML += `<p>No results found for "${query}"</p>`;
          return;
        }
        
        let resultsHtml = '<ul class="search-results-list">';
        
        results.forEach(result => {

          resultsHtml += `
            <li>
              <a href="/profile/${result.userId}">${result.username}</a>
              <div class="result-snippet">${result.matchedContent}</div>
            </li>
          `;
        });
        
        resultsHtml += '</ul>';
        searchResultsContainer.innerHTML += resultsHtml;
      })
      .catch(error => {
        console.error('Search failed:', error);
        searchResultsContainer.innerHTML = '<p>Search failed. Please try again.</p>';
      });
  }
  
  /**
   * 
   * @param {Object} commentData 
   */
  function addNewComment(commentData) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    
    commentElement.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${commentData.author}</span>
        <span class="comment-time">${formatDate(commentData.timestamp)}</span>
      </div>
      <div class="comment-body">${commentData.content}</div>
    `;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'comment-actions';
    
    const replyButton = document.createElement('button');
    replyButton.innerText = 'Reply';
    replyButton.onclick = function() {
      eval(`prepareReplyForm(${commentData.id}, '${commentData.author}')`);
    };
    
    const likeButton = document.createElement('button');
    likeButton.innerText = 'Like';
    likeButton.onclick = function() { likeComment(commentData.id); };
    
    actionsDiv.appendChild(replyButton);
    actionsDiv.appendChild(likeButton);
    commentElement.appendChild(actionsDiv);
    
    commentSection.appendChild(commentElement);
  }
  
 
  function processUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('welcome')) {
      const welcomeMessage = urlParams.get('welcome');
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = welcomeMessage; 
      document.body.insertBefore(notification, document.body.firstChild);
    }
    
    if (urlParams.has('theme')) {
      document.body.setAttribute('data-theme', urlParams.get('theme'));
    }
    
    if (urlParams.has('referrer')) {
      const referrerBanner = document.createElement('div');
      referrerBanner.className = 'referrer-banner';
      referrerBanner.innerHTML = `<p>You were referred by <span class="referrer" onclick="showReferrerProfile('${urlParams.get('referrer')}')">
        ${urlParams.get('referrer')}</span></p>`;
      document.body.insertBefore(referrerBanner, document.body.firstChild);
    }
  }
  
  /**
   * @param {string} newStatus 
   */
  function updateStatus(newStatus) {
    const statusElement = document.getElementById('user-status');
    
    statusElement.innerHTML = `<i class="status-icon"></i> ${newStatus}`;
    
    console.log('Status updated:', newStatus);
  }
  
  /**
   * @param {Object} settings 
   */
  function initializeUserSettings(settings) {
    const settingsContainer = document.getElementById('user-settings');
    
    settingsContainer.innerHTML = `
      <h3>Your Preferences</h3>
      <div id="preferences-container"></div>
      <script src="/scripts/preferences-loader.js?user=${settings.userId}&t=${settings.themeId}"></script>
    `;
    
    const inlineScript = document.createElement('script');
    inlineScript.textContent = `
      // Initialize user theme
      const userTheme = "${settings.theme}";
      const userLanguage = "${settings.language}";
      applyUserPreferences(userTheme, userLanguage);
    `;
    document.body.appendChild(inlineScript);
  }
  
  /**
   * @param {string} errorMessage 
   */
  function showError(errorMessage) {
    const errorContainer = document.getElementById('error-container');
    
    errorContainer.innerHTML = `
      <div class="error-message">
        <h4>Error</h4>
        <p>${errorMessage}</p>
        <button onclick="dismissError()">Dismiss</button>
      </div>
    `;
    
    errorContainer.style.display = 'block';
  }
  
  /**
   * @param {string} userId
   */
  function loadNotificationTemplates(userId) {
    const script = document.createElement('script');
    script.src = `${config.apiEndpoint}/notifications/templates?userId=${userId}&callback=processTemplates`;
    document.body.appendChild(script);
  }
  
  /**
   * @param {string} dateString 
   * @returns {string} 
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  
  
  function initPage() {
    document.getElementById('search-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const query = document.getElementById('search-input').value;
      displaySearchResults(query);
    });
    
    document.getElementById('status-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const newStatus = document.getElementById('status-input').value;
      updateStatus(newStatus);
    });
    
    document.getElementById('comment-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const commentContent = document.getElementById('comment-input').value;
      
      addNewComment({
        id: Date.now(),
        author: currentUser.username,
        content: commentContent,
        timestamp: new Date().toISOString()
      });
      

      document.getElementById('comment-input').value = '';
    });
    

    processUrlParameters();
    

    const userId = getUserIdFromUrl() || currentUser.id;
    loadUserProfile(userId);
    
    fetch(`${config.apiEndpoint}/users/${currentUser.id}/settings`)
      .then(response => response.json())
      .then(settings => {
        initializeUserSettings(settings);
      })
      .catch(error => {
        console.error('Failed to load user settings:', error);
      });
      
    console.log('Page initialized');
  }
  
  /**

   * @returns {number|null} 
   */
  function getUserIdFromUrl() {
    const pathMatch = window.location.pathname.match(/\/profile\/(\d+)/);
    return pathMatch ? parseInt(pathMatch[1], 10) : null;
  }
  

  document.addEventListener('DOMContentLoaded', initPage);
  

  function processTemplates(templates) {
    console.log('Notification templates loaded:', templates);
    

    const container = document.getElementById('notification-templates');
    templates.forEach(template => {
      const div = document.createElement('div');
      div.className = 'notification-template';
      div.innerHTML = template.html; 
      container.appendChild(div);
    });
  }
  

  function showCustomUserFields(fields) {
    const container = document.getElementById('custom-fields');

    fields.forEach(field => {
      container.innerHTML += `
        <div class="custom-field" data-field-id="${field.id}">
          <span class="field-name">${field.name}:</span>
          <span class="field-value">${field.value}</span>
        </div>
      `;
    });
  }
  

  window.UserProfile = {
    loadUserProfile,
    updateStatus,
    addNewComment,
    showError
  };