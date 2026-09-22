const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = navMenu.querySelectorAll('a');

document.querySelector('.img-logo')
    .addEventListener('contextmenu', e => e.preventDefault());

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});


navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('header') && !e.target.closest('nav')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const logoImg = document.querySelector('.img-logo');

if (!prefersReducedMotion) {
    logoImg.addEventListener('click', () => {
        logoImg.classList.remove('coin');
        void logoImg.offsetWidth; // fuerza reflow para re-disparar
        logoImg.classList.add('coin');
    });

    // Limpia la clase cuando termina para dejar todo en estado base
    logoImg.addEventListener('animationend', () => {
        logoImg.classList.remove('coin');
    });
}

const avatarFrames = document.querySelectorAll('.avatar-frame');
const MAX_PARALLAX_PHOTO = 4; // la foto central queda casi estática

let ticking = false;

function updateParallax() {
    const viewportCenter = window.innerHeight / 2;

    avatarFrames.forEach(frame => {
        const rect = frame.getBoundingClientRect();
        const frameCenter = rect.top + rect.height / 2;
        const distanceRatio = (frameCenter - viewportCenter) / viewportCenter;
        const clamped = Math.max(-1, Math.min(1, distanceRatio));
        const offset = clamped * MAX_PARALLAX_PHOTO;
        frame.style.setProperty('--parallax-photo', `${offset}px`);
    });
}

function updateStaffEffects() {
    updateParallax();
    ticking = false;
}

function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(updateStaffEffects);
        ticking = true;
    }
}

if (avatarFrames.length && !prefersReducedMotion) {
    updateStaffEffects();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
}

// ===== Lluvia de emojis: en hover (desktop) o siempre activa (touch) =====
// Detecta si el dispositivo tiene un mouse real con hover preciso.
// En tablets/celulares (sin hover real) la lluvia queda encendida siempre.
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (avatarFrames.length && !prefersReducedMotion) {
    avatarFrames.forEach(frame => {
        const emojis = frame.querySelectorAll('.falling-emoji');
        let rafId = null;
        let startTime = null;

        function animateRain(timestamp) {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const frameHeight = frame.offsetHeight;

            emojis.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.2;
                const phase = parseFloat(el.dataset.phase) || 0;
                const emojiSize = el.offsetHeight || 40;
                const cycle = frameHeight + emojiSize * 2;
                const speedPxPerMs = speed * 0.08; // velocidad de caída en hover

                let pos = ((elapsed * speedPxPerMs) + phase * cycle) % cycle;
                if (pos < 0) pos += cycle;

                el.style.transform = `translate(-50%, ${pos - emojiSize}px)`;
            });

            rafId = window.requestAnimationFrame(animateRain);
        }

        function startRain() {
            if (rafId) return; // ya está lloviendo en esta card
            frame.classList.add('is-raining');
            startTime = null;
            rafId = window.requestAnimationFrame(animateRain);
        }

        function stopRain() {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            frame.classList.remove('is-raining');
        }

        if (supportsHover) {
            // Desktop: lluvia solo mientras el mouse está sobre la card
            frame.addEventListener('mouseenter', startRain);
            frame.addEventListener('mouseleave', stopRain);
            // Soporte básico de teclado/accesibilidad si la card recibe foco
            frame.addEventListener('focus', startRain);
            frame.addEventListener('blur', stopRain);
        } else {
            // Tablet/celular: sin hover real, la lluvia queda siempre activa
            startRain();
        }
    });
}

// ===== Emoji gigante de las cards de "servicios": aparece al tocar en touch =====
const serviceCards = document.querySelectorAll('.grid-section .card');

if (serviceCards.length && !supportsHover) {
    serviceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const alreadyOpen = card.classList.contains('is-touched');
            // Cierra el emoji en las demás cards antes de abrir esta
            serviceCards.forEach(c => c.classList.remove('is-touched'));
            if (!alreadyOpen) {
                card.classList.add('is-touched');
            }
        });
    });

    // Toca afuera de las cards para cerrar el emoji abierto
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.grid-section .card')) {
            serviceCards.forEach(c => c.classList.remove('is-touched'));
        }
    });
}

const heroWords = ['eficiencia', 'rapidez', 'claridad', 'seguridad', 'optimización', 'autonomía',
 'presencia', 'control', 'crecimiento'];
const wordRotator = document.getElementById('word-rotator');

if (wordRotator) {
    const TYPE_SPEED = 90;
    const DELETE_SPEED = 55;
    const PAUSE_TIME = 1600;

    let wordIndex = 0;

    if (prefersReducedMotion) {
        setInterval(() => {
            wordIndex = (wordIndex + 1) % heroWords.length;
            wordRotator.textContent = heroWords[wordIndex];
        }, 3000);
    } else {
        function typeWord(word, callback) {
            let charIndex = 0;
            wordRotator.textContent = '';
            (function typeChar() {
                if (charIndex < word.length) {
                    wordRotator.textContent += word.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, TYPE_SPEED);
                } else {
                    callback();
                }
            })();
        }

        function deleteWord(word, callback) {
            let charIndex = word.length;
            (function deleteChar() {
                if (charIndex > 0) {
                    charIndex--;
                    wordRotator.textContent = word.substring(0, charIndex);
                    setTimeout(deleteChar, DELETE_SPEED);
                } else {
                    callback();
                }
            })();
        }

        function cycleWords() {
            const currentWord = heroWords[wordIndex];
            setTimeout(() => {
                deleteWord(currentWord, () => {
                    wordIndex = (wordIndex + 1) % heroWords.length;
                    typeWord(heroWords[wordIndex], () => {
                        cycleWords();
                    });
                });
            }, PAUSE_TIME);
        }

        cycleWords();
    }
}