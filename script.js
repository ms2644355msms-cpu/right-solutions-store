const whatsappNumber = "201025989869";

const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-Rn20O48Nh3XDJWNhZEMMpixS1yDDIWHqQIK9YN38_aEHDcMWdVJtjd1E6IHxDV8ZMQGWTHJqiCyD/pub?gid=0&single=true&output=csv";

let products = [];
let currentLanguage = "en";
let currentCategory = "All";

function makeWhatsappLink(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = "";
      }
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function formatDescription(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/Brand:/g, "\nBrand:")
    .replace(/Model:/g, "\nModel:")
    .replace(/Screen Size:/g, "\nScreen Size:")
    .replace(/Color:/g, "\nColor:")
    .replace(/Storage:/g, "\nStorage:")
    .replace(/Processor:/g, "\nProcessor:")
    .replace(/CPU Model:/g, "\nProcessor:")
    .replace(/RAM:/g, "\nRAM:")
    .replace(/Operating System:/g, "\nOperating System:")
    .replace(/Special Features:/g, "\nSpecial Features:")
    .replace(/Graphics:/g, "\nGraphics:")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function csvToProducts(csvText) {
  const rows = parseCSV(csvText);

  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(header => header.trim());

  return rows.slice(1)
    .filter(row => row.some(cell => cell && cell.trim() !== ""))
    .map(row => {
      const product = {};

      headers.forEach((header, index) => {
        product[header] = row[index] ? row[index].trim() : "";
      });

      return {
        nameEn: product.nameEn || "",
        nameAr: product.nameAr || product.nameEn || "",
        category: product.category || "",
        categoryEn: product.categoryEn || product.category || "",
        categoryAr: product.categoryAr || product.category || "",
        price: product.price || "",
        image: product.image || "",
        image2: product.image2 || "",
        image3: product.image3 || "",
        descriptionEn: formatDescription(product.descriptionEn || ""),
        descriptionAr: formatDescription(product.descriptionAr || product.descriptionEn || "")
      };
    });
}

async function loadProductsFromSheet() {
  const container = document.getElementById("productsContainer");

  container.innerHTML = currentLanguage === "ar"
    ? "<p>جاري تحميل المنتجات...</p>"
    : "<p>Loading products...</p>";

  try {
    const response = await fetch(sheetCsvUrl);

    if (!response.ok) {
      throw new Error("Could not load sheet");
    }

    const csvText = await response.text();
    products = csvToProducts(csvText);

    if (products.length === 0) {
      container.innerHTML = currentLanguage === "ar"
        ? "<p>لا توجد منتجات حاليًا.</p>"
        : "<p>No products found.</p>";
      return;
    }

    displayProducts(products);
  } catch (error) {
    container.innerHTML = `
      <p style="color:red; font-weight:bold;">
        Products could not be loaded. Please check the Google Sheet link.
      </p>
    `;
    console.error(error);
  }
}

function createProductSlider(product, productName, index) {
  const images = [product.image, product.image2, product.image3]
    .filter(img => img && img.trim() !== "");

  if (images.length === 0) {
    return `<div class="product-image-placeholder">${productName}</div>`;
  }

  const slides = images.map((img, imgIndex) => `
    <img 
      src="${img}" 
      alt="${productName}" 
      class="slider-image ${imgIndex === 0 ? "active" : ""}"
    >
  `).join("");

  const dots = images.map((img, imgIndex) => `
    <button 
      class="slider-dot ${imgIndex === 0 ? "active" : ""}" 
      onclick="showProductSlide(${index}, ${imgIndex})"
      aria-label="Show image ${imgIndex + 1}">
    </button>
  `).join("");

  const arrows = images.length > 1
    ? `
      <button class="slider-arrow slider-prev" onclick="changeProductSlide(${index}, -1)">‹</button>
      <button class="slider-arrow slider-next" onclick="changeProductSlide(${index}, 1)">›</button>
    `
    : "";

  return `
    <div class="product-slider" data-slider-index="${index}" data-current-slide="0">
      <div class="slider-images">
        ${slides}
        ${arrows}
      </div>
      <div class="slider-dots">
        ${dots}
      </div>
    </div>
  `;
}

function showProductSlide(sliderIndex, slideIndex) {
  const slider = document.querySelector(`[data-slider-index="${sliderIndex}"]`);
  if (!slider) return;

  const images = slider.querySelectorAll(".slider-image");
  const dots = slider.querySelectorAll(".slider-dot");

  images.forEach(img => img.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));

  if (images[slideIndex]) images[slideIndex].classList.add("active");
  if (dots[slideIndex]) dots[slideIndex].classList.add("active");

  slider.setAttribute("data-current-slide", slideIndex);
}

function changeProductSlide(sliderIndex, direction) {
  const slider = document.querySelector(`[data-slider-index="${sliderIndex}"]`);
  if (!slider) return;

  const images = slider.querySelectorAll(".slider-image");
  let currentSlide = Number(slider.getAttribute("data-current-slide")) || 0;

  currentSlide += direction;

  if (currentSlide < 0) {
    currentSlide = images.length - 1;
  }

  if (currentSlide >= images.length) {
    currentSlide = 0;
  }

  showProductSlide(sliderIndex, currentSlide);
}

function displayProducts(productList) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";

  if (!productList || productList.length === 0) {
    container.innerHTML = currentLanguage === "ar"
      ? "<p>لا توجد منتجات في هذا القسم.</p>"
      : "<p>No products found in this category.</p>";
    return;
  }

  productList.forEach((product, index) => {
    const productName = currentLanguage === "ar" ? product.nameAr : product.nameEn;
    const productCategory = currentLanguage === "ar" ? product.categoryAr : product.categoryEn;
    const productDescription = currentLanguage === "ar" ? product.descriptionAr : product.descriptionEn;

    const message =
      currentLanguage === "ar"
        ? `مرحبا RIGHT SOLUTIONS
أنا مهتم بالمنتج التالي:
اسم المنتج: ${productName}
القسم: ${productCategory}
السعر: ${product.price}
برجاء تأكيد التوفر وطريقة الطلب.`
        : `Hello RIGHT SOLUTIONS
I am interested in this product:
Product name: ${productName}
Category: ${productCategory}
Price: ${product.price}
Please confirm availability and ordering details.`;

    const whatsappLink = makeWhatsappLink(message);
    const orderText = currentLanguage === "ar" ? "اطلب عبر واتساب" : "Order on WhatsApp";
    const descriptionTitle = currentLanguage === "ar" ? "عرض الوصف والمواصفات" : "View Description & Specs";

    const productImage = createProductSlider(product, productName, index);

    const card = `
      <div class="product-card">
        ${productImage}
        <div class="product-info">
          <p class="category">${productCategory}</p>
          <h3>${productName}</h3>
          <p class="price">${product.price}</p>

          <details class="product-description-box">
            <summary>${descriptionTitle}</summary>
            <div class="product-description">
              ${productDescription}
            </div>
          </details>

          <a class="order-btn" href="${whatsappLink}" target="_blank">
            ${orderText}
          </a>
        </div>
      </div>
    `;

    container.innerHTML += card;
  });
}

function filterProducts(category) {
  currentCategory = category;

  if (category === "All") {
    displayProducts(products);
  } else {
    const filtered = products.filter(product => product.category === category);
    displayProducts(filtered);
  }
}

function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  const searchValue = searchInput.value.toLowerCase();

  const filtered = products.filter(product => {
    const name = currentLanguage === "ar" ? product.nameAr : product.nameEn;
    const category = currentLanguage === "ar" ? product.categoryAr : product.categoryEn;
    const description = currentLanguage === "ar" ? product.descriptionAr : product.descriptionEn;

    return (
      name.toLowerCase().includes(searchValue) ||
      category.toLowerCase().includes(searchValue) ||
      description.toLowerCase().includes(searchValue)
    );
  });

  displayProducts(filtered);
}

function updateServiceLinks() {
  const maintenanceMessage =
    currentLanguage === "ar"
      ? `مرحبا RIGHT SOLUTIONS
أنا مهتم بخدمة: صيانة اللابتوب والكمبيوتر
أريد معرفة تفاصيل الصيانة وطريقة الحجز.`
      : `Hello RIGHT SOLUTIONS
I am interested in: Laptop & PC Maintenance
I want to know maintenance details and booking steps.`;

  const consultationMessage =
    currentLanguage === "ar"
      ? `مرحبا RIGHT SOLUTIONS
أنا مهتم بخدمة: استشارة هاتفية
السعر: 100 جنيه
سبب التواصل: قلقان من اللابتوب وعايز أعرف المشكلة.`
      : `Hello RIGHT SOLUTIONS
I am interested in: Phone Consultation
Price: 100 EGP
Reason: I am worried about my laptop and want to understand the problem.`;

  const supportMessage =
    currentLanguage === "ar"
      ? `مرحبا RIGHT SOLUTIONS
أنا مهتم بخدمة: دعم فني
أحتاج مساعدة في اختيار جهاز أو حل مشكلة تقنية.`
      : `Hello RIGHT SOLUTIONS
I am interested in: Technical Support
I need help choosing a device or solving a technical problem.`;

  const generalMessage =
    currentLanguage === "ar"
      ? `مرحبا RIGHT SOLUTIONS
أريد التواصل بخصوص طلب أو استفسار.`
      : `Hello RIGHT SOLUTIONS
I want to contact you about an order or inquiry.`;

  document.getElementById("maintenanceBtn").href = makeWhatsappLink(maintenanceMessage);
  document.getElementById("consultationBtn").href = makeWhatsappLink(consultationMessage);
  document.getElementById("supportBtn").href = makeWhatsappLink(supportMessage);
  document.getElementById("generalWhatsappBtn").href = makeWhatsappLink(generalMessage);
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en";

  const langButton = document.querySelector(".lang-btn");
  const elements = document.querySelectorAll("[data-en]");
  const searchInput = document.getElementById("searchInput");

  if (currentLanguage === "ar") {
    document.body.classList.add("ar");
    document.getElementById("htmlTag").setAttribute("lang", "ar");
    document.getElementById("htmlTag").setAttribute("dir", "rtl");
    langButton.textContent = "EN";

    elements.forEach(element => {
      element.textContent = element.getAttribute("data-ar");
    });

    searchInput.placeholder = searchInput.getAttribute("data-placeholder-ar");
  } else {
    document.body.classList.remove("ar");
    document.getElementById("htmlTag").setAttribute("lang", "en");
    document.getElementById("htmlTag").setAttribute("dir", "ltr");
    langButton.textContent = "AR";

    elements.forEach(element => {
      element.textContent = element.getAttribute("data-en");
    });

    searchInput.placeholder = searchInput.getAttribute("data-placeholder-en");
  }

  searchInput.value = "";
  filterProducts(currentCategory);
  updateServiceLinks();
}

loadProductsFromSheet();
updateServiceLinks();
