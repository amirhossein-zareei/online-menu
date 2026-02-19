// ═══════════════════════════════════════
//  profile.js — حساب کاربری ادمین
// ═══════════════════════════════════════

// ═══════ بارگذاری اطلاعات ═══════
async function loadProfile() {
     try {
          const res = await fetch("/api/profile");
          if (!res.ok) throw new Error("خطا");

          const user = await res.json();

          document.getElementById("profileName").textContent = user.fullName || "—";

          document.getElementById("profileUsername").innerHTML =
               `<span class="text-brand-500 text-[11px]">@</span>
             <span>${user.username || "—"}</span>`;

          document.getElementById("profilePhone").textContent = user.phone || "—";

          // نمایش محتوا
          document.getElementById("profileLoading").classList.add("hidden");
          document.getElementById("profileContent").classList.remove("hidden");
     } catch (e) {
          console.error("خطا:", e);
          document.getElementById("profileLoading").innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-gray-300">
                <span class="text-4xl mb-4">⚠️</span>
                <p class="text-[14px] font-bold text-gray-400">خطا در بارگذاری</p>
                <button onclick="loadProfile()" class="mt-4 px-5 py-2 bg-brand-500 text-white text-[12px] font-bold rounded-xl
                           hover:bg-brand-600 transition-all">تلاش مجدد</button>
            </div>`;
     }
}

// ═══════ تغییر رمز ═══════
document.getElementById("changePasswordForm").addEventListener("submit", async function (e) {
     e.preventDefault();

     const currentPassword = document.getElementById("currentPassword").value;
     const newPassword = document.getElementById("newPassword").value;
     const confirmPassword = document.getElementById("confirmPassword").value;

     // چک تکرار رمز
     if (newPassword !== confirmPassword) {
          showPasswordAlert("error", "رمز جدید و تکرار آن یکسان نیستند");
          return;
     }

     // چک طول رمز
     if (newPassword.length < 6) {
          showPasswordAlert("error", "رمز جدید باید حداقل ۶ کاراکتر باشد");
          return;
     }

     // لودینگ
     const btn = document.getElementById("changePassBtn");
     const btnText = document.getElementById("changePassText");
     const spinner = document.getElementById("changePassSpinner");
     btn.disabled = true;
     btn.classList.add("opacity-75");
     btnText.textContent = "لطفاً صبر کنید...";
     spinner.classList.remove("hidden");

     try {
          const res = await fetch("/api/profile/change-password", {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ currentPassword, newPassword }),
          });

          const data = await res.json();

          if (res.ok) {
               showPasswordAlert("success", "رمز عبور با موفقیت تغییر کرد");
               this.reset();
          } else {
               showPasswordAlert("error", data.error || "خطا در تغییر رمز عبور");
          }
     } catch (e) {
          showPasswordAlert("error", "خطا در ارتباط با سرور");
     } finally {
          btn.disabled = false;
          btn.classList.remove("opacity-75");
          btnText.textContent = "تغییر رمز عبور";
          spinner.classList.add("hidden");
     }
});

// ═══════ نمایش پیام ═══════
function showPasswordAlert(type, message) {
     const alert = document.getElementById("passwordAlert");
     alert.className = "mb-4 rounded-xl px-4 py-3 flex items-center gap-2.5";

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

     // حذف خودکار بعد ۵ ثانیه
     setTimeout(() => {
          alert.className = "hidden mb-4 rounded-xl px-4 py-3 flex items-center gap-2.5";
     }, 5000);
}

// ═══════ تاگل نمایش رمز ═══════
function togglePassField(inputId, btn) {
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

// ═══════ خروج ═══════
async function logout() {
     if (!confirm("آیا مطمئن هستید که می‌خواهید خارج شوید؟")) return;

     try {
          const res = await fetch("/api/auth/logout", { method: "POST" });
          if (res.ok) {
               window.location.href = "/login";
          } else {
               // حتی اگه خطا بده بفرست لاگین
               window.location.href = "/login";
          }
     } catch (e) {
          window.location.href = "/login";
     }
}

// ═══════ Init ═══════
loadProfile();
