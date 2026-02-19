let categories = [];
let activeCategory = null;
let currentItems = [];

// ═══════ دریافت دسته‌بندی‌ها ═══════
async function loadCategories() {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");

    const data = await res.json();
    categories = data.categories || data;

    if (categories.length) {
      activeCategory = categories[0]._id || categories[0].id;
      renderCatNav();
      await loadFoodsByCategory(activeCategory);
    } else {
      renderCatNav();
      showEmpty(
        "📋",
        "منو در حال آماده‌سازی است",
        "به‌زودی غذاها اضافه خواهند شد",
      );
    }
  } catch (e) {
    console.error("خطا:", e);
    showError();
  }
}

// ═══════ دریافت غذاهای یک دسته‌بندی ═══════
async function loadFoodsByCategory(categoryId) {
  const body = document.getElementById("menuBody");

  body.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="w-9 h-9 border-[3px] border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        </div>`;

  try {
    const res = await fetch(`/api/categories/${categoryId}/products`);
    if (!res.ok) throw new Error("خطا در دریافت غذاها");

    const data = await res.json();
    const products = data.products || data;

    // ✅ همه محصولات رو نگه میداریم (فعال + غیرفعال)
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
      const isActive = cId === activeCategory?.toString();
      return `
        <button onclick="selectCategory('${cId}')" data-cat="${cId}"
                class="cat-btn px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap font-bold text-xs sm:text-sm transition-all duration-300 flex-shrink-0 flex items-center gap-2 sm:gap-3
                       ${isActive ? "bg-orange-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}">
            <img src="${c.image || ""}" alt="${c.name}" class="hidden sm:block w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-md" />
            <span>${c.name}</span>
        </button>`;
    })
    .join("");
}

// ═══════ Render Menu Items ═══════
function renderMenu() {
  const body = document.getElementById("menuBody");
  if (!body) return;

  if (!currentItems.length) {
    const cat = categories.find(
      (c) => (c._id || c.id)?.toString() === activeCategory?.toString(),
    );
    showEmpty(
      "🍽️",
      "غذایی وجود ندارد",
      `آیتمی در دسته «${cat?.name || ""}» ثبت نشده است`,
    );
    return;
  }

  body.innerHTML = `
        <div class="relative">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ease-in-out">
                ${currentItems
                  .map(
                    (item) => `
                <div class="anim-card group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl
                            transition-all duration-300 relative
                            ${item.active ? "hover:shadow-2xl hover:-translate-y-2" : ""}"
                     style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 0 15px rgba(0, 0, 0, 0.08);">
                    
                    <!-- تصویر بزرگ - فقط روی تبلت و بالاتر -->
                    <div class="hidden sm:block w-full h-72 lg:h-80 overflow-hidden relative">
                        ${
                          item.img
                            ? `<img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover ${item.active ? "group-hover:scale-105" : "grayscale"} transition-transform duration-300" loading="lazy"
                                    onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center text-5xl sm:text-6xl\'>🍽️</div>'">`
                            : `<div class="w-full h-full bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center text-5xl sm:text-6xl">🍽️</div>`
                        }
                        ${
                          !item.active
                            ? `
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span class="bg-white/95 text-gray-700 text-sm font-extrabold px-5 py-2.5 rounded-full shadow-lg">
                                ناموجود
                            </span>
                        </div>`
                            : ""
                        }
                    </div>
                    
                    <!-- محتوای کارت -->
                    <div class="p-4 sm:p-6 ${!item.active ? "opacity-60" : ""}">
                        <!-- Layout موبایل: عکس کوچک + محتوا (افقی) -->
                        <div class="flex sm:block gap-3">
                            <!-- عکس کوچک - فقط موبایل -->
                            <div class="sm:hidden flex-shrink-0 relative">
                                <div class="w-20 h-20 rounded-xl overflow-hidden bg-brand-100 ${!item.active ? "grayscale" : ""}">
                                    ${
                                      item.img
                                        ? `<img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy"
                                                onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-brand-100 flex items-center justify-center text-2xl\'>🍽️</div>'">`
                                        : `<div class="w-full h-full bg-brand-100 flex items-center justify-center text-2xl">🍽️</div>`
                                    }
                                </div>
                                ${
                                  !item.active
                                    ? `
                                <div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                    <span class="bg-white/95 text-gray-700 text-[10px] font-extrabold px-2 py-1 rounded-full">
                                        ناموجود
                                    </span>
                                </div>`
                                    : ""
                                }
                            </div>
                            
                            <!-- محتوای متنی -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1 sm:mb-2">
                                    <h3 class="font-bold text-base sm:text-xl text-gray-800">${item.name}</h3>
                                    ${
                                      !item.active
                                        ? `
                                    <span class="hidden sm:inline-flex bg-red-50 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                        ناموجود
                                    </span>`
                                        : ""
                                    }
                                </div>
                                <p class="text-xs sm:text-sm text-gray-500 leading-relaxed mb-2 sm:mb-4 line-clamp-2">${item.desc}</p>
                                <div class="flex items-center justify-between">
                                    <div>
                                        ${
                                          item.active
                                            ? `<span class="text-brand-600 font-extrabold text-base sm:text-xl" dir="ltr">${item.price}</span>
                                                <span class="text-xs text-gray-400 mr-1">تومان</span>`
                                            : `<span class="text-gray-400 font-bold text-sm line-through" dir="ltr">${item.price}</span>
                                                <span class="text-xs text-gray-400 mr-1">تومان</span>`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `,
                  )
                  .join("")}
            </div>
        </div>`;
}

// ═══════ Select Category ═══════
async function selectCategory(id) {
  activeCategory = id;
  renderCatNav();
  await loadFoodsByCategory(id);
}

// ═══════ Helper: Empty State ═══════
function showEmpty(icon, title, subtitle) {
  const body = document.getElementById("menuBody");
  body.innerHTML = `
        <div class="flex flex-col items-center justify-center py-28 text-gray-300 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5"><span class="text-5xl">${icon}</span></div>
            <p class="text-lg font-bold text-gray-400">${title}</p>
            ${subtitle ? `<p class="text-sm text-gray-300 mt-2">${subtitle}</p>` : ""}
        </div>`;
}

// ═══════ Helper: Error State ═══════
function showError() {
  const body = document.getElementById("menuBody");
  body.innerHTML = `
        <div class="flex flex-col items-center justify-center py-28 text-gray-300 text-center">
            <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5"><span class="text-4xl">⚠️</span></div>
            <p class="text-lg font-bold text-gray-400">خطا در بارگذاری</p>
            <button onclick="loadCategories()" class="mt-4 px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-xl
                       hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl">تلاش مجدد</button>
        </div>`;
}

// ═══════ Init ═══════
loadCategories();
