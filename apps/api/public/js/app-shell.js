/** Shared UI bootstrap — prevents blank white screen while pages load */
function showAppLoading(message) {
  const el = document.getElementById('app');
  if (!el) return;
  const msg = message || 'Loading CampusQR...';
  el.innerHTML =
    '<section class="app-loading">' +
    '<span class="app-loading-spinner" aria-hidden="true"></span>' +
    '<p>' +
    msg +
    '</p>' +
    '</section>';
}

function showAppError(message) {
  const el = document.getElementById('app');
  if (!el) return;
  el.innerHTML =
    '<section class="app-loading app-error">' +
    '<h2>Something went wrong</h2>' +
    '<p>' +
    (message || 'Unknown error') +
    '</p>' +
    '<a href="/index.html" class="btn btn-primary" style="margin-top:1rem">Back to Login</a>' +
    '</section>';
}
