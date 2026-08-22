/* ==========================================================================
   MEDICARE — ADMIN AUTHENTICATION ENGINE
   Owner: midicare2@gmail.com | 2-step: password + 4-digit security code
   ========================================================================== */

const STAFF_ACCOUNTS = {
  'midicare2@gmail.com': {
    name: 'Owner',
    email: 'midicare2@gmail.com',
    role: 'Owner',
    roleLabel: '👑 Owner (Full Access)',
    requires2FA: true,
    permissions: ['all']
  }
};

const OWNER_PASSWORD  = 'midicare2026';
const OWNER_2FA_CODE  = '2026';

let failedLoginCount = 0;
let isLockedOut = false;
let pendingUserToVerify = null;

document.addEventListener('DOMContentLoaded', () => {

  const alertBox = document.getElementById('login-alert');
  const otpModal = document.getElementById('modal-2fa');
  const toast    = document.getElementById('copy-toast');

  /* ------------------------------------------------------------------
     1. LOGIN SUBMISSION WITH RATE LIMITING
     ------------------------------------------------------------------ */
  window.handleAdminLogin = async function(e) {
    e.preventDefault();

    if (isLockedOut) {
      showAlert('⛔ System locked after multiple failed attempts. Please wait 30 seconds.');
      return;
    }

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass  = document.getElementById('login-password').value.trim();

    const account = STAFF_ACCOUNTS[email];

    // Only the registered owner email is accepted
    if (!account || pass !== OWNER_PASSWORD) {
      failedLoginCount++;
      if (failedLoginCount >= 3) {
        isLockedOut = true;
        showAlert('⛔ Too many failed login attempts! System locked for 30 seconds.');
        setTimeout(() => {
          isLockedOut = false;
          failedLoginCount = 0;
          hideAlert();
        }, 30000);
      } else {
        showAlert(`⚠️ Invalid email or password. Attempt ${failedLoginCount} of 3.`);
      }
      return;
    }

    // Success — go to 2FA step
    failedLoginCount = 0;
    hideAlert();
    pendingUserToVerify = account;
    openOtpModal();
  };

  /* ------------------------------------------------------------------
     2. 2FA SECURITY CODE MODAL
     ------------------------------------------------------------------ */
  function openOtpModal() {
    if (!otpModal) return;
    // Clear inputs before showing
    document.querySelectorAll('.otp-digit-input').forEach(i => { i.value = ''; i.style.borderColor = ''; i.style.boxShadow = ''; });
    otpModal.style.visibility = 'visible';
    otpModal.style.opacity = '1';
    otpModal.style.pointerEvents = 'all';
    // Focus first input
    const first = document.getElementById('otp-1');
    if (first) setTimeout(() => first.focus(), 100);
  }

  function closeOtpModal() {
    if (!otpModal) return;
    otpModal.style.visibility = 'hidden';
    otpModal.style.opacity = '0';
    otpModal.style.pointerEvents = 'none';
    pendingUserToVerify = null;
  }
  window.closeOtpModal = closeOtpModal;

  window.moveOtp = function(input, index) {
    // Allow backspace to go back
    if (input.value === '' && index > 1) {
      const prev = input.previousElementSibling;
      if (prev) prev.focus();
      return;
    }
    if (input.value.length === 1 && index < 4) {
      const next = input.nextElementSibling;
      if (next) next.focus();
    }
    // Auto-submit when last digit filled
    if (index === 4 && input.value.length === 1) {
      setTimeout(() => window.verifyOtpSubmit(), 150);
    }
  };

  window.verifyOtpSubmit = function() {
    if (!pendingUserToVerify) return;
    const inputs = document.querySelectorAll('.otp-digit-input');
    const code = Array.from(inputs).map(i => i.value.trim()).join('');

    if (code !== OWNER_2FA_CODE) {
      showToast('❌ رمز التحقق غير صحيح');
      inputs.forEach(i => {
        i.style.borderColor = '#EF4444';
        i.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)';
      });
      // Clear after shake
      setTimeout(() => {
        inputs.forEach(i => { i.value = ''; i.style.borderColor = ''; i.style.boxShadow = ''; });
        const first = document.getElementById('otp-1');
        if (first) first.focus();
      }, 1200);
      return;
    }

    showToast('✅ تم التحقق! جاري الدخول...');
    closeOtpModal();
    createSession(pendingUserToVerify);
  };

  /* ------------------------------------------------------------------
     3. CREATE SESSION & REDIRECT TO ADMIN
     ------------------------------------------------------------------ */
  function createSession(userObj) {
    const session = {
      token: `JWT_MEDICARE_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user: userObj,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('medicare_admin_session', JSON.stringify(session));

    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 600);
  }

  /* ------------------------------------------------------------------
     4. UTILITIES
     ------------------------------------------------------------------ */
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.classList.add('show');
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.classList.remove('show');
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

});
