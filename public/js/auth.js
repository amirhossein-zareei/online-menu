/* ═══════════════════════════════════════
   auth.js — اسکریپت صفحه لاگین
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    // ── نمایش / مخفی کردن رمز عبور ──
    const toggleBtn  = document.getElementById('togglePassword');
    const passInput  = document.getElementById('password');
    const eyeOff     = document.getElementById('eyeOff');
    const eyeOn      = document.getElementById('eyeOn');

    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', function () {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeOff.classList.add('hidden');
                eyeOn.classList.remove('hidden');
            } else {
                passInput.type = 'password';
                eyeOff.classList.remove('hidden');
                eyeOn.classList.add('hidden');
            }
        });
    }

    // ── حالت لودینگ دکمه هنگام ارسال فرم ──
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function () {
            const btn     = document.getElementById('submitBtn');
            const text    = document.getElementById('btnText');
            const arrow   = document.getElementById('btnArrow');
            const spinner = document.getElementById('btnSpinner');

            if (btn) {
                btn.disabled = true;
                btn.classList.add('opacity-75', 'cursor-not-allowed');
            }
            if (text)    text.textContent = 'لطفاً صبر کنید...';
            if (arrow)   arrow.classList.add('hidden');
            if (spinner) spinner.classList.remove('hidden');
        });
    }

    // ── فوکوس خودکار روی اولین فیلد خالی ──
    const usernameField = document.getElementById('username');
    if (usernameField && !usernameField.value) {
        usernameField.focus();
    } else if (passInput && usernameField && usernameField.value) {
        passInput.focus();
    }

});