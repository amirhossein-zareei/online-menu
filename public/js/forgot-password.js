// ═══════════════════════════════════════
//  forgot-password.js — فراموشی رمز عبور
// ═══════════════════════════════════════

let userPhone = "";
let timerInterval = null;

// ═══════ مرحله ۱: ارسال شماره ═══════
document
  .getElementById("phoneForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();

    // اعتبارسنجی ساده
    if (!/^09\d{9}$/.test(phone)) {
      showAlert("error", "شماره تلفن معتبر نیست (مثال: 09134466889)");
      return;
    }

    setLoading(
      "sendCodeBtn",
      "sendCodeText",
      "sendCodeSpinner",
      true,
      "در حال ارسال...",
    );

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        userPhone = phone;
        goToStep2();
        showAlert("success", "کد تأیید ارسال شد");
      } else {
        showAlert("error", data.error || "خطا در ارسال کد");
      }
    } catch (e) {
      showAlert("error", "خطا در ارتباط با سرور");
    } finally {
      setLoading(
        "sendCodeBtn",
        "sendCodeText",
        "sendCodeSpinner",
        false,
        "ارسال کد تأیید",
      );
    }
  });

// ═══════ مرحله ۲: تأیید کد ═══════
document
  .getElementById("codeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const inputs = document.querySelectorAll(".code-input");
    const code = Array.from(inputs)
      .map((i) => i.value)
      .join("");

    if (code.length !== 4) {
      showAlert("error", "لطفاً کد ۴ رقمی را کامل وارد کنید");
      return;
    }

    setLoading(
      "verifyBtn",
      "verifyText",
      "verifySpinner",
      true,
      "در حال بررسی...",
    );

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone, code }),
      });

      const data = await res.json();

      if (res.ok) {
        goToStep3();
        showAlert("success", "کد تأیید شد، رمز جدید را وارد کنید");
      } else {
        showAlert("error", data.error || "کد وارد شده اشتباه است");
        // خالی کردن اینپوت‌ها
        inputs.forEach((i) => (i.value = ""));
        inputs[0].focus();
      }
    } catch (e) {
      showAlert("error", "خطا در ارتباط با سرور");
    } finally {
      setLoading("verifyBtn", "verifyText", "verifySpinner", false, "تأیید کد");
    }
  });

// ═══════ مرحله ۳: ثبت رمز جدید ═══════
document
  .getElementById("resetForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("resetNewPassword").value;
    const confirmPassword = document.getElementById(
      "resetConfirmPassword",
    ).value;

    if (newPassword.length < 6) {
      showAlert("error", "رمز جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("error", "رمز جدید و تکرار آن یکسان نیستند");
      return;
    }

    setLoading("resetBtn", "resetText", "resetSpinner", true, "در حال ثبت...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userPhone, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert("success", "رمز عبور با موفقیت تغییر کرد! در حال انتقال...");
        setTimeout(() => {
          window.location.href =
            "/login?success=" +
            encodeURIComponent("رمز عبور تغییر کرد، وارد شوید");
        }, 2000);
      } else {
        showAlert("error", data.error || "خطا در تغییر رمز");
      }
    } catch (e) {
      showAlert("error", "خطا در ارتباط با سرور");
    } finally {
      setLoading(
        "resetBtn",
        "resetText",
        "resetSpinner",
        false,
        "ثبت رمز جدید",
      );
    }
  });

// ═══════ رفتن به مرحله ۲ ═══════
function goToStep2() {
  document.getElementById("phoneForm").classList.add("hidden");
  document.getElementById("codeForm").classList.remove("hidden");

  document.getElementById("pageTitle").textContent = "کد تأیید";
  document.getElementById("pageSubtitle").textContent =
    `کد ارسال شده به ${userPhone} را وارد کنید`;

  // فوکوس روی اولین اینپوت
  document.querySelector('.code-input[data-index="0"]').focus();

  // شروع تایمر
  startTimer(60);
}

// ═══════ رفتن به مرحله ۳ ═══════
function goToStep3() {
  document.getElementById("codeForm").classList.add("hidden");
  document.getElementById("resetForm").classList.remove("hidden");

  document.getElementById("pageTitle").textContent = "رمز عبور جدید";
  document.getElementById("pageSubtitle").textContent =
    "رمز عبور جدید خود را وارد کنید";

  if (timerInterval) clearInterval(timerInterval);

  document.getElementById("resetNewPassword").focus();
}

// ═══════ تایمر ═══════
function startTimer(seconds) {
  let remaining = seconds;
  const timerText = document.getElementById("timerText");
  const timerCount = document.getElementById("timerCount");
  const resendBtn = document.getElementById("resendBtn");

  timerText.classList.remove("hidden");
  resendBtn.classList.add("hidden");
  timerCount.textContent = remaining;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    remaining--;
    timerCount.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerText.classList.add("hidden");
      resendBtn.classList.remove("hidden");
    }
  }, 1000);
}

// ═══════ ارسال مجدد ═══════
async function resendCode() {
  const resendBtn = document.getElementById("resendBtn");
  resendBtn.disabled = true;
  resendBtn.textContent = "در حال ارسال...";

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: userPhone }),
    });

    const data = await res.json();

    if (res.ok) {
      showAlert("success", "کد جدید ارسال شد");
      startTimer(60);
      // پاک کردن اینپوت‌ها
      document.querySelectorAll(".code-input").forEach((i) => (i.value = ""));
      document.querySelector('.code-input[data-index="0"]').focus();
    } else {
      showAlert("error", data.error || "خطا در ارسال مجدد");
    }
  } catch (e) {
    showAlert("error", "خطا در ارتباط با سرور");
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = "ارسال مجدد کد";
  }
}

// ═══════ اینپوت‌های کد (حرکت خودکار) ═══════
document.querySelectorAll(".code-input").forEach((input, i, all) => {
  // تایپ عدد → برو بعدی
  input.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
    if (this.value && i < all.length - 1) {
      all[i + 1].focus();
    }
  });

  // Backspace → برو قبلی
  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value && i > 0) {
      all[i - 1].focus();
      all[i - 1].value = "";
    }
  });

  // Paste کردن کد کامل
  input.addEventListener("paste", function (e) {
    e.preventDefault();
    const paste = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (paste.length >= 4) {
      all.forEach((inp, j) => {
        inp.value = paste[j] || "";
      });
      all[3].focus();
    }
  });
});

// ═══════ تاگل نمایش رمز ═══════
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const eyeOff = btn.querySelector(".eye-off");
  const eyeOn = btn.querySelector(".eye-on");

  if (input.type === "password") {
    input.type = "text";
    eyeOff.classList.add("hidden");
    eyeOn.classList.remove("hidden");
  } else {
    input.type = "password";
    eyeOff.classList.remove("hidden");
    eyeOn.classList.add("hidden");
  }
}

// ═══════ پیام خطا/موفقیت ═══════
function showAlert(type, message) {
  const alert = document.getElementById("alertBox");
  alert.className = "mb-5 rounded-xl px-4 py-3 flex items-center gap-2.5";

  if (type === "error") {
    alert.classList.add("bg-red-50", "border", "border-red-200");
    alert.innerHTML = `
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <p class="text-[12px] text-red-600 font-semibold">${message}</p>`;
  } else {
    alert.classList.add("bg-green-50", "border", "border-green-200");
    alert.innerHTML = `
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <p class="text-[12px] text-green-700 font-semibold">${message}</p>`;
  }

  setTimeout(() => {
    alert.className =
      "hidden mb-5 rounded-xl px-4 py-3 flex items-center gap-2.5";
  }, 5000);
}

// ═══════ لودینگ دکمه ═══════
function setLoading(btnId, textId, spinnerId, loading, text) {
  const btn = document.getElementById(btnId);
  const txtEl = document.getElementById(textId);
  const spinner = document.getElementById(spinnerId);

  btn.disabled = loading;
  if (loading) btn.classList.add("opacity-75");
  else btn.classList.remove("opacity-75");
  txtEl.textContent = text;
  if (loading) spinner.classList.remove("hidden");
  else spinner.classList.add("hidden");
}

// فوکوس خودکار
document.getElementById("phone").focus();
