(function() {
	"use strict";

    // Preloader JS
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        preloader.style.display = 'none';
    });

    // Check if elements with the class "search-toggler" exist
    const searchTogglers = document.querySelectorAll(".search-toggler");
    if (searchTogglers.length > 0) {
        searchTogglers.forEach((searchToggler) => {
            searchToggler.addEventListener("click", function (e) {
            e.preventDefault();
            
                const searchPopup = document.querySelector(".search-popup");
                if (searchPopup) {
                    searchPopup.classList.toggle("active");
                }

                const mobileNavWrapper = document.querySelector(".mobile-nav-wrapper");
                if (mobileNavWrapper) {
                    mobileNavWrapper.classList.remove("expanded");
                }
            });
        });
    }

    window.onload = function() {

        // Scroll Event go Top JS
        try {
            window.addEventListener('scroll', function() {
                var scrolled = window.scrollY;
                var goTopButton = document.querySelector('.go-top');
    
                if (scrolled > 600) {
                    goTopButton.classList.add('active');
                } else {
                    goTopButton.classList.remove('active');
                }
            });
            var goTopButton = document.querySelector('.go-top');
            goTopButton.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        } catch (err) {}

        // Counter Js
        try {
            if ("IntersectionObserver" in window) {
                let counterObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                        let counter = entry.target;
                        let target = parseInt(counter.innerText);
                        let step = target / 200;
                        let current = 0;
                        let timer = setInterval(function () {
                            current += step;
                            counter.innerText = Math.floor(current);
                            if (parseInt(counter.innerText) >= target) {
                            clearInterval(timer);
                            }
                        }, 10);
                        counterObserver.unobserve(counter);
                        }
                    });
                });

                let counters = document.querySelectorAll(".counter");
                    counters.forEach(function (counter) {
                    counterObserver.observe(counter);
                });
            }
        } catch (err) {}

    };

    // Partner Slider JS
    var swiper = new Swiper(".partner_slider", {
        slidesPerView: 1,
        spaceBetween: 90,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 1000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        breakpoints: {
            0: {
                slidesPerView: 2,
                spaceBetween: 50,
            },
            576: {
                slidesPerView: 3,
                spaceBetween: 50,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 50,
            },
            992: {
                slidesPerView: 4,
                spaceBetween: 50,
            },
            1200: {
                slidesPerView: 5,
                spaceBetween: 70,
            },
            1400: {
                slidesPerView: 5,
            }
        }
    });

    // Banner Slider JS
    var swiper = new Swiper(".familyInsuranceBanner", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        effect: "fade",
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: ".family-pagination",
            type: "fraction",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    // life Insurance Banner Slider JS
    var swiper = new Swiper(".lifeInsuranceBanner", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        effect: "fade",
        // autoplay: {
        //     delay: 3000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        pagination: {
            el: ".life-pagination",
            clickable: true,
        },
    });

    // Review Slider JS
    var swiper = new Swiper(".reviewSlider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
    
    // Review Slider JS
    var swiper = new Swiper(".reviewSlider2", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        pagination: {
            el: ".swiper-pagination",
        },
    });

    // Clients Review Slider JS
    var swiper = new Swiper(".clientsButton", {
        loop: true,
        spaceBetween: 10,
        slidesPerView: 6,
        freeMode: true,
        watchSlidesProgress: true,
    });
    var swiper2 = new Swiper(".mySwiper2", {
        loop: true,
        spaceBetween: 25,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: swiper,
        },
    });

    // Blog Slider JS
    var swiper = new Swiper(".blogSlider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            576: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 3
            },
            1200: {
                slidesPerView: 3
            }
        }
    });

    // Testimonials Slider JS
    var swiper = new Swiper(".testimonialsSlider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
    });
    
    // Testimonials Slider JS
    var swiper = new Swiper(".testimonial-Slider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            576: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
        }
    });
    
    // Gallery Slider JS
    var swiper = new Swiper(".gallery-Slider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            576: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 3
            },
        }
    });

    // Testimonials Slider JS
    var swiper = new Swiper(".htestimonials-slider", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        speed: 1000,
        // autoplay: {
        //     delay: 2000,
        //     disableOnInteraction: false,
        //     pauseOnMouseEnter: true,
        // },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
    });

    // Hover JS
    try {
        var elements = document.querySelectorAll("[id^='my-element']");
            elements.forEach(function(element) {
            element.addEventListener("mouseover", function() {
                elements.forEach(function(el) {
                el.classList.remove("active");
                });
                element.classList.add("active");
            });
        });
    } catch (err) {}

    // Pricing Range JS
    try {
        document.addEventListener("DOMContentLoaded", function () {
            // Loop through each range slider and attach event listeners
            for (let i = 1; i <= 5; i++) {
                const rangeInput = document.getElementById(`balance-range-${i}`);
                const balanceValue = document.getElementById(`balance-value-${i}`);
    
                if (!rangeInput || !balanceValue) continue; // Skip if elements are missing
    
                rangeInput.addEventListener("input", function () {
                    balanceValue.textContent = `$${rangeInput.value}`;
                });
            }
        });
    } catch (err) {
        console.error(err);
    }

    // Award JS
    try {
        document.addEventListener('DOMContentLoaded', () => {
            const serviceItems = document.querySelectorAll('.service-item');
            const serviceImage = document.getElementById('service-image');
    
            serviceItems.forEach((item) => {
                item.addEventListener('mouseenter', () => {
                    const newImage = item.getAttribute('data-image');
                    serviceImage.src = newImage;
                });
            });
        });
    } catch (err) {}

    // scrollCue
    scrollCue.init();

})();

// For Mobile Navbar JS
const list = document.querySelectorAll('.mobile-menu-list');
function accordion(e) {
    e.stopPropagation(); 
    if(this.classList.contains('active')){
        this.classList.remove('active');
    }
    else if(this.parentElement.parentElement.classList.contains('active')){
        this.classList.add('active');
    }
    else {
        for(i=0; i < list.length; i++){
            list[i].classList.remove('active');
        }
        this.classList.add('active');
    }
}
for(i = 0; i < list.length; i++ ){
    list[i].addEventListener('click', accordion);
}

// Header Sticky
const getHeaderId = document.getElementById("navbar");
if (getHeaderId) {
    window.addEventListener('scroll', event => {
        const height = 150;
        const { scrollTop } = event.target.scrollingElement;
        document.querySelector('#navbar').classList.toggle('sticky', scrollTop >= height);
    });
}