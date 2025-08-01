document.addEventListener("DOMContentLoaded", function () {
  const jenisProgram = ["volunteer", "edukasi", "sosial"];

  jenisProgram.forEach(jenis => {
    fetch(`../../data/programkita/${jenis}.json`)
      .then(res => res.json())
      .then(data => {
        const container = document.querySelector(`#${jenis}-list`);
        if (!container) return;

        data.forEach(item => {
          const card = document.createElement('div');
          card.className = "swiper-slide bg-white rounded-xl shadow overflow-hidden";

          card.innerHTML = `
            <img src="${item.poster}" alt="${item.judul}" class="w-full h-40 object-cover" />
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">${item.judul}</h3>
              <p class="text-sm text-gray-600 mb-3">${item.deskripsi}</p>
              <a href="${item.link}"
                class="text-blue-500 text-sm font-medium hover:underline daftar-btn">Daftar Sekarang</a>
            </div>
          `;
          container.appendChild(card);
        });

        new Swiper(`.programSwiper${jenis.charAt(0).toUpperCase() + jenis.slice(1)}`, {
          slidesPerView: 1,
          spaceBetween: 20,
          navigation: {
            nextEl: `.swiper-button-next`,
            prevEl: `.swiper-button-prev`
          },
          breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 }
          }
        });
      });
  });
});
