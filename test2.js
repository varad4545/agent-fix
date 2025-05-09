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
  
  async function loadUserProfile(userId) {
    try {
      const response = await fetch(`${config.apiEndpoint}/users/${userId}`);
      const userData = await response.json();
      
      const displayName = document.createElement('h2');
      displayName.textContent = userData.displayName;
      const avatarUrl = document.createElement('img');
      avatarUrl.src = userData.avatarUrl || config.defaultUserImage;
      avatarUrl.alt = "Profile picture";
      const userBio = document.createElement('div');
      userBio.textContent = userData.bio;
      userProfileContainer.appendChild(displayName);
      userProfileContainer.appendChild(avatarUrl);
      userProfileContainer.appendChild(userBio);

      loadUserActivity(userId);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      userProfileContainer.textContent = 'Failed to load user profile. Please try again later.';
    }
  }
  
  async function loadUserActivity(userId) {
    try {
      const response = await fetch(`${config.apiEndpoint}/users/${userId}/activity`);
      const activities = await response.json();
      
      const activityHeader = document.createElement('h3');
      activityHeader.textContent = 'Recent Activity';
      userProfileContainer.appendChild(activityHeader);
      
      activities.forEach(activity => {
        const activityItem = document.createElement('li');
        activityItem.textContent = `${formatDate(activity.timestamp)} ${activity.description}`;
        userProfileContainer.appendChild(activityItem);
      });
    } catch (error) {
      console.error('Failed to load user activity:', error);
    }
  }
  
  function displaySearchResults(query) {
    searchResultsContainer.textContent = `Search Results for: ${query}`;
    
    fetch(`${config.apiEndpoint}/search?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(results => {
        if (results.length === 0) {
          searchResultsContainer.textContent += `No results found for "${query}"`;
          return;
        }
        
        results.forEach(result => {
          const resultItem = document.createElement('li');
          resultItem.textContent = `${result.username} ${result.matchedContent}`;
          searchResultsContainer.appendChild(resultItem);
        });
      })
      .catch(error => {
        console.error('Search failed:', error);
        searchResultsContainer.textContent = 'Search failed. Please try again.';
      });
  }
  
  function addNewComment(commentData) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    
    const commentHeader = document.createElement('div');
    commentHeader.textContent = `${commentData.author} ${formatDate(commentData.timestamp)}`;
    const commentBody = document.createElement('div');
    commentBody.textContent = commentData.content;
    commentElement.appendChild(commentHeader);
    commentElement.appendChild(commentBody);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'comment-actions';
    
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
      prepareReplyForm(commentData.id, commentData.author);
    };
    
    const likeButton = document.createElement('button');
    likeButton.textContent = 'Like';
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
      notification.textContent = welcomeMessage; 
      document.body.insertBefore(notification, document.body.firstChild);
    }
    
    if (urlParams.has('theme')) {
      document.body.setAttribute('data-theme', urlParams.get('theme'));
    }
    
    if (urlParams.has('referrer')) {
      const referrerBanner = document.createElement('div');
      referrerBanner.className = 'referrer-banner';
      referrerBanner.textContent = `You were referred by ${urlParams.get('referrer')}`;
      document.body.insertBefore(referrerBanner, document.body.firstChild);
    }
  }
  
  function updateStatus(newStatus) {
    const statusElement = document.getElementById('user-status');
    
    statusElement.textContent = newStatus;
    
    console.log('Status updated:', newStatus);
  }
  
  function initializeUserSettings(settings) {
    const settingsContainer = document.getElementById('user-settings');
    
    settingsContainer.textContent = 'Your Preferences';
    
    const inlineScript = document.createElement('script');
    inlineScript.textContent = `
      const userTheme = "${settings.theme}";
      const userLanguage = "${settings.language}";
      applyUserPreferences(userTheme, userLanguage);
    `;
    document.body.appendChild(inlineScript);
  }
  
  function showError(errorMessage) {
    const errorContainer = document.getElementById('error-container');
    
    errorContainer.textContent = `Error ${errorMessage}`;
    
    errorContainer.style.display = 'block';
  }
  
  function loadNotificationTemplates(userId) {
    const script = document.createElement('script');
    script.src = `${config.apiEndpoint}/notifications/templates?userId=${userId}&callback=processTemplates`;
    document.body.appendChild(script);
  }
  
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
      div.textContent = template.html; 
      container.appendChild(div);
    });
  }
  
  function showCustomUserFields(fields) {
    const container = document.getElementById('custom-fields');
    
    fields.forEach(field => {
      const fieldItem = document.createElement('div');
      fieldItem.textContent = `${field.name}: ${field.value}`;
      container.appendChild(fieldItem);
    });
  }
  
  window.UserProfile = {
    loadUserProfile,
    updateStatus,
    addNewComment,
    showError
  };