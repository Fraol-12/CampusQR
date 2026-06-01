class QrScanner {
  constructor(elementId, onScan) {
    this.elementId = elementId;
    this.onScan = onScan;
    this.html5QrCode = null;
    this.lastScan = '';
    this.cooldownMs = 2500;
    this.lastScanTime = 0;
  }

  async start() {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode library not loaded');
    }
    this.html5QrCode = new Html5Qrcode(this.elementId);
    const cameras = await Html5Qrcode.getCameras();
    const cameraId =
      cameras.length > 0 ? cameras[cameras.length - 1].id : { facingMode: 'environment' };

    await this.html5QrCode.start(
      cameraId,
      { fps: 10, qrbox: { width: 280, height: 280 }, aspectRatio: 1 },
      (decodedText) => this.handleScan(decodedText),
      () => {}
    );
  }

  handleScan(text) {
    const now = Date.now();
    if (text === this.lastScan && now - this.lastScanTime < this.cooldownMs) return;
    this.lastScan = text;
    this.lastScanTime = now;
    this.onScan(text);
  }

  async stop() {
    if (this.html5QrCode?.isScanning) {
      await this.html5QrCode.stop();
    }
  }

  resetCooldown() {
    this.lastScan = '';
    this.lastScanTime = 0;
  }
}

function renderScanResult(container, result) {
  const display = result.display || 'idle';
  const photo = result.student?.photo_url
    ? `<img src="${result.student.photo_url}" alt="Student">`
    : '<span class="placeholder-photo"><i class="bi bi-person"></i></span>';

  const iconMap = {
    authorized: ['bi-check-circle-fill', 'success'],
    unauthorized: ['bi-x-circle-fill', 'danger'],
    invalid: ['bi-x-circle-fill', 'danger'],
    duplicate: ['bi-exclamation-triangle-fill', 'warning'],
    warning: ['bi-exclamation-triangle-fill', 'warning'],
    idle: ['bi-qr-code-scan', ''],
  };

  const titles = {
    authorized: 'AUTHORIZED',
    unauthorized: 'UNAUTHORIZED PERSON',
    invalid: 'UNAUTHORIZED PERSON',
    duplicate: result.message || 'DUPLICATE SCAN DETECTED',
    warning: result.message || 'WARNING',
    idle: 'Ready to Scan',
  };

  const cssClass =
    display === 'authorized'
      ? 'authorized'
      : display === 'duplicate' || display === 'warning'
        ? 'duplicate'
        : display === 'idle'
          ? 'idle'
          : 'unauthorized';

  const [icon, tone] = iconMap[display] || iconMap.idle;
  const iconStyle = tone ? `result-icon ${tone}` : 'result-icon';
  const iconColor = display === 'idle' ? ' style="color:var(--muted)"' : '';

  container.className = `scan-result ${cssClass}`;
  container.innerHTML = `
    <p class="${iconStyle}"${iconColor}><i class="bi ${icon}" style="font-size:5rem"></i></p>
    <h2 style="margin:0 0 1rem;font-size:1.5rem">${titles[display] || result.message}</h2>
    ${
      result.student
        ? `
      <section class="student-profile-scan">
        ${photo}
        <h3 style="margin:0.25rem 0">${result.student.full_name}</h3>
        <p style="margin:0;color:var(--muted)">${result.student.student_id}</p>
        <p style="margin:0.25rem 0">${result.student.department} · Batch ${result.student.batch}</p>
        ${result.student.cafeteria_balance != null ? `<p><strong>Balance:</strong> $${Number(result.student.cafeteria_balance).toFixed(2)}</p>` : ''}
      </section>
    `
        : '<p style="color:var(--muted)">Point camera at student QR code</p>'
    }
    <p style="margin-top:1rem;font-size:0.85rem;color:var(--muted)">${new Date().toLocaleTimeString()}</p>
  `;

  if (display === 'authorized') SoundFX.success();
  else if (display === 'duplicate' || display === 'warning') SoundFX.warning();
  else if (display !== 'idle') SoundFX.error();
}

function renderIdCard(student, qrDataUrl) {
  const photo = student.photo_url
    ? `<img class="id-photo" src="${student.photo_url}" alt="Photo">`
    : '<span class="id-photo-placeholder"><i class="bi bi-person"></i></span>';

  return `
    <article class="id-card" id="printable-id-card">
      <header class="id-card-header">
        <h3>STATE UNIVERSITY</h3>
        <p>Official Student Identification Card</p>
      </header>
      <section class="id-card-body">
        ${photo}
        <dl class="id-details">
          <p class="name">${student.full_name}</p>
          <dt>Student ID</dt><dd>${student.student_id}</dd>
          <dt>Department</dt><dd>${student.department}</dd>
          <dt>Batch</dt><dd>${student.batch}</dd>
          <dt>Status</dt><dd>${student.status}</dd>
        </dl>
      </section>
      <footer class="id-card-qr">
        <img src="${qrDataUrl}" alt="QR Code">
        <p style="font-size:0.65rem;color:var(--muted);margin:0.25rem 0 0">Encrypted Campus Access QR</p>
      </footer>
    </article>
  `;
}
