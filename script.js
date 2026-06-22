const whatsappNumber = "201025989869";
let currentLanguage = "en";
let currentCategory = "All";

function makeWhatsappLink(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function displayProducts(productList) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";

  productList.forEach(product => {
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

    const productImage = product.image
      ? `<img src="${product.image}" alt="${productName}">`
      : `<div class="product-image-placeholder">${productName}</div>`;

    const card = `
      <div class="product-card">
        ${productImage}
        <div class="product-info">
          <p class="category">${productCategory}</p>
          <h3>${productName}</h3>
          <p class="price">${product.price}</p>
          <p>${productDescription}</p>
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
  const searchValue = document.getElementById("searchInput").value.toLowerCase();

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

displayProducts(products);
updateServiceLinks();