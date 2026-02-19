let categories = [];
let activeCategory = null;
let currentItems = [];

// ═══════ دریافت دسته‌بندی‌ها ═══════
async function loadCategories() {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("خطا");

    const data = await res.json();
    categories = data.categories || data;

    if (categories.length) {
      activeCategory = (categories[0]._id || categories[0].id).toString();
      renderCatNav();

      await loadFoodsByCategory(activeCategory);
    } else {
      renderCatNav();
      showEmpty("📋", "منو خالی است", "از دکمه + غذا اضافه کنید");
    }
  } catch (e) {
    console.error("خطا:", e);
    showError();
  }
}

// ═══════ دریافت غذاهای یک دسته‌بندی (همه، حتی غیرفعال) ═══════
async function loadFoodsByCategory(categoryId) {
  const body = document.getElementById("menuBody");

  body.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="w-9 h-9 border-[3px] border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        </div>`;

  try {
    // ادمین همه محصولات رو میبینه (فعال + غیرفعال)
    const res = await fetch(`/api/categories/${categoryId}/products?all=true`);
    if (!res.ok) throw new Error("خطا");

    const data = await res.json();
    const products = data.products || data;

    currentItems = products.map((p) => ({
      id: (p._id || p.id || "").toString(),
      name: p.name || "",
      desc: p.description || "",
      price: p.price || "",
      img: p.image || "",
      active: p.active !== false,
    }));

    renderMenu();
  } catch (e) {
    console.error("خطا:", e);
    showError();
  }
}

// ═══════ Render Category Nav ═══════
function renderCatNav() {
  const nav = document.getElementById("catNav");
  if (!nav) return;

  if (!categories.length) {
    nav.innerHTML = `<div class="w-full text-center py-4"><p class="text-gray-500 text-sm">دسته‌بندی‌ای موجود نیست</p></div>`;
    return;
  }

  nav.innerHTML = categories
    .map((c) => {
      const cId = (c._id || c.id || "").toString();
      const isActive = cId === activeCategory;
      return `
        <button onclick="selectCategory('${cId}')" data-cat="${cId}"
                class="cat-btn px-3 sm:px-6 py-2 sm:py-3 rounded-full whitespace-nowrap font-bold text-xs sm:text-sm transition-all duration-500 ease-in-out flex-shrink-0 flex items-center gap-2 sm:gap-3 shadow-lg
                       ${isActive ? "bg-brand-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-xl"}">
            <img src="${c.image || ""}" alt="${c.name}" class="hidden sm:block w-10 h-10 rounded-full object-cover shadow-md" />
            <span>${c.name}</span>
        </button>`;
    })
    .join("");
}

// ═══════ Render Menu (Admin) ═══════
function renderMenu() {
  const body = document.getElementById("menuBody");
  if (!body) return;

  if (!currentItems.length) {
    const cat = categories.find(
      (c) => (c._id || c.id)?.toString() === activeCategory,
    );
    showEmpty(
      "🍽️",
      "غذایی وجود ندارد",
      `در دسته «${cat?.name || ""}» آیتمی نیست`,
    );
    return;
  }

  body.innerHTML = `
        <div class="flex flex-col gap-2.5 sm:gap-3">
            ${currentItems
              .map(
                (item) => `
            <div class="anim-card group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-sm
                        border border-gray-50 transition-all duration-300
                        relative overflow-hidden ${!item.active ? "opacity-50" : ""}">

                ${!item.active ? `<div class="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 bg-red-50 text-red-400 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-red-100">غیرفعال</div>` : ""}

                <div class="flex items-center gap-2.5 sm:gap-3.5">
                    <div class="flex-shrink-0 w-20 h-20 sm:w-[92px] sm:h-[92px] rounded-full overflow-hidden ring-2 sm:ring-[3px] ring-brand-50 transition-all duration-300
                                ${!item.active ? "grayscale" : ""}">
                        ${
                          item.img
                            ? `<img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy"
                                    onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center text-2xl sm:text-3xl\'>🍽️</div>'">`
                            : `<div class="w-full h-full bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center text-2xl sm:text-3xl">🍽️</div>`
                        }
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-sm sm:text-[15px] text-gray-800 leading-relaxed">${item.name}</h3>
                        <p class="text-[10px] sm:text-[11.5px] text-gray-400 leading-relaxed mt-0.5 line-clamp-2">${item.desc}</p>
                        <div class="mt-1.5 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <span class="text-brand-600 font-extrabold text-sm sm:text-base tracking-tight" dir="ltr">${item.price}</span>
                                <span class="text-[9px] sm:text-[10px] text-gray-400 mr-0.5">تومان</span>
                            </div>
                            <div class="flex items-center gap-1.5 sm:gap-2">
                                <button onclick="toggleActive('${item.id}')" title="${item.active ? "غیرفعال کردن" : "فعال کردن"}"
                                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                           ${
                                             item.active
                                               ? "bg-green-50 text-green-500 hover:bg-green-100"
                                               : "bg-red-50 text-red-400 hover:bg-red-100"
                                           }">
                                    ${
                                      item.active
                                        ? `<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
                                        : `<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                                    }
                                </button>
                                <button onclick="openEditModal('${item.id}')" title="ویرایش"
                                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center
                                           hover:bg-blue-100 transition-all duration-200">
                                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `,
              )
              .join("")}
        </div>`;
}

// ═══════ Select Category ═══════
async function selectCategory(id) {
  activeCategory = id;
  renderCatNav();
  await loadFoodsByCategory(id);
  const btn = document.querySelector(`[data-cat="${id}"]`);
  if (btn)
    btn.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
}

// ═══════ Toggle Active ═══════
async function toggleActive(foodId) {
  try {
    const res = await fetch(`/api/products/${foodId}/toggle`, {
      method: "PATCH",
    });
    if (res.ok) {
      // آپدیت لوکال بدون ریلود
      currentItems.forEach((item) => {
        if (item.id === foodId) item.active = !item.active;
      });
      renderMenu();
    } else {
      alert("خطا در تغییر وضعیت");
    }
  } catch (e) {
    alert("خطا در ارتباط با سرور");
  }
}

// ═══════ Custom Dropdown ═══════
let dropdownOpen = false;

function toggleCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("dropdownArrow");

  if (dropdownOpen) {
    dropdown.classList.add("hidden");
    arrow.style.transform = "rotate(0deg)";
  } else {
    dropdown.classList.remove("hidden");
    arrow.style.transform = "rotate(180deg)";
  }
  dropdownOpen = !dropdownOpen;
}

function closeCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("dropdownArrow");
  dropdown.classList.add("hidden");
  arrow.style.transform = "rotate(0deg)";
  dropdownOpen = false;
}

function selectDropdownCategory(id) {
  const cat = categories.find((c) => (c._id || c.id)?.toString() === id);
  if (!cat) return;

  document.getElementById("editCategory").value = id;
  document.getElementById("selectedCatLabel").innerHTML =
    `<span class="text-gray-700">${cat.name}</span>`;

  // علامت تیک روی انتخاب‌شده
  document.querySelectorAll(".cat-dropdown-item").forEach((el) => {
    const tick = el.querySelector(".cat-tick");
    if (el.dataset.catId === id) {
      el.classList.add("bg-brand-50");
      tick.classList.remove("hidden");
    } else {
      el.classList.remove("bg-brand-50");
      tick.classList.add("hidden");
    }
  });

  closeCategoryDropdown();
}

function renderDropdownItems(selectedId) {
  const dropdown = document.getElementById("categoryDropdown");
  dropdown.innerHTML = categories
    .map((c) => {
      const cId = (c._id || c.id || "").toString();
      const isSelected = cId === selectedId;
      return `
            <div onclick="selectDropdownCategory('${cId}')"
                data-cat-id="${cId}"
                class="cat-dropdown-item flex items-center justify-between px-4 py-3 cursor-pointer
                       transition-colors duration-150 hover:bg-brand-50 active:bg-brand-100
                       ${isSelected ? "bg-brand-50" : ""}
                       border-b border-gray-50 last:border-b-0">
                <div class="flex items-center gap-2.5">
                    <span class="text-[13px] font-medium text-gray-700">${c.name}</span>
                </div>
                <svg class="cat-tick w-4 h-4 text-brand-500 ${isSelected ? "" : "hidden"}"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>`;
    })
    .join("");
}

// بستن dropdown با کلیک بیرون
document.addEventListener("click", function (e) {
  const wrapper = document.getElementById("customSelectWrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    closeCategoryDropdown();
  }
});

// ═══════ Edit Modal ═══════
function openEditModal(foodId) {
  const modal = document.getElementById("editModal");
  const panel = document.getElementById("editPanel");
  const titleEl = document.getElementById("editModalTitle");
  const submitBtn = document.getElementById("submitBtnText");
  let selectedCatId = activeCategory || "";

  if (foodId) {
    // ویرایش
    titleEl.textContent = "ویرایش غذا";
    submitBtn.textContent = "ذخیره تغییرات";
    const found = currentItems.find((i) => i.id === foodId);
    if (found) {
      document.getElementById("editFoodId").value = found.id;
      document.getElementById("editName").value = found.name;
      document.getElementById("editDesc").value = found.desc;
      document.getElementById("editPrice").value = found.price;
      selectedCatId = activeCategory || "";
      const preview = document.getElementById("editImagePreview");
      preview.innerHTML = found.img
        ? `<img src="${found.img}" class="w-full h-full object-cover">`
        : `<span class="text-2xl text-gray-300">📷</span>`;
    }
  } else {
    // افزودن
    titleEl.textContent = "افزودن غذای جدید";
    submitBtn.textContent = "افزودن غذا";
    document.getElementById("editFoodId").value = "";
    document.getElementById("editName").value = "";
    document.getElementById("editDesc").value = "";
    document.getElementById("editPrice").value = "";
    document.getElementById("editImagePreview").innerHTML =
      `<span class="text-2xl text-gray-300">📷</span>`;
  }

  // ست کردن دسته‌بندی
  document.getElementById("editCategory").value = selectedCatId;
  const selectedCat = categories.find(
    (c) => (c._id || c.id)?.toString() === selectedCatId,
  );
  if (selectedCat) {
    document.getElementById("selectedCatLabel").innerHTML =
      ` <span class="text-gray-700">${selectedCat.name}</span>`;
  } else {
    document.getElementById("selectedCatLabel").innerHTML =
      `<span class="text-gray-300">انتخاب دسته‌بندی</span>`;
  }

  renderDropdownItems(selectedCatId);
  closeCategoryDropdown();

  modal.classList.remove("hidden");
  requestAnimationFrame(() => {
    panel.classList.remove("translate-y-full");
    panel.classList.add("translate-y-0");
  });
}

function openAddModal() {
  openEditModal(null);
}

function closeEditModal() {
  const panel = document.getElementById("editPanel");
  panel.classList.remove("translate-y-0");
  panel.classList.add("translate-y-full");
  setTimeout(
    () => document.getElementById("editModal").classList.add("hidden"),
    300,
  );
}

// ═══════ Preview Image ═══════
function previewEditImage(input) {
  const preview = document.getElementById("editImagePreview");
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ═══════ Form Submit ═══════
document
  .getElementById("editForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const foodId = document.getElementById("editFoodId").value;
    const formData = new FormData(this);

    try {
      const url = foodId ? `/api/products/${foodId}` : "/api/products";
      const method = foodId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        closeEditModal();
        // ریلود غذاهای دسته‌بندی فعلی
        await loadFoodsByCategory(activeCategory);
      } else {
        const err = await res.json();
        alert(err.error || "خطا در ذخیره اطلاعات");
      }
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    }
  });

// ═══════ Helpers ═══════
function showEmpty(icon, title, subtitle) {
  document.getElementById("menuBody").innerHTML = `
        <div class="flex flex-col items-center justify-center py-28 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5"><span class="text-5xl">${icon}</span></div>
            <p class="text-base font-bold text-gray-600">${title}</p>
            ${subtitle ? `<p class="text-sm text-gray-400 mt-2">${subtitle}</p>` : ""}
        </div>`;
}

function showError() {
  document.getElementById("menuBody").innerHTML = `
        <div class="flex flex-col items-center justify-center py-28 text-center">
            <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5"><span class="text-4xl">⚠️</span></div>
            <p class="text-base font-bold text-gray-600">خطا در بارگذاری</p>
            <button onclick="loadCategories()" class="mt-4 px-5 py-2 bg-brand-500 text-white text-sm font-bold rounded-xl
                       hover:bg-brand-600 transition-all duration-300 shadow-lg">تلاش مجدد</button>
        </div>`;
}

// ═══════ Init ═══════
loadCategories();
