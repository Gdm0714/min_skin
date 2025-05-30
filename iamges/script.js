
/**
 * 모던 클린 스킨 JavaScript
 * 반응형 네비게이션, 이미지 최적화, 부드러운 스크롤 등의 기능을 제공합니다.
 */

(function() {
    'use strict';

    // DOM 로딩 완료 후 실행
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollEffects();
        initImageOptimization();
        initSmoothScroll();
        initSearchEnhancement();
        initCommentEnhancement();
        initThemeToggle();
        initBackToTop();
        initProgressBar();
    });

    /**
     * 반응형 네비게이션 초기화
     */
    function initNavigation() {
        const nav = document.querySelector('.nav');
        const navList = document.querySelector('.nav-list');

        if (!nav || !navList) return;

        // 모바일 네비게이션 토글 버튼 생성
        const navToggle = document.createElement('button');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        navToggle.setAttribute('aria-label', '메뉴 열기/닫기');
        navToggle.setAttribute('aria-expanded', 'false');

        nav.insertBefore(navToggle, navList);

        // 토글 이벤트 리스너
        navToggle.addEventListener('click', function() {
            const isActive = navList.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            navToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // 외부 클릭 시 메뉴 닫기
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && navList.classList.contains('active')) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // ESC 키로 메뉴 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navList.classList.contains('active')) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
                navToggle.focus();
            }
        });
    }

    /**
     * 스크롤 효과 초기화
     */
    function initScrollEffects() {
        const header = document.querySelector('.header');
        let lastScroll = 0;
        let ticking = false;

        function updateHeader() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // 스크롤 방향에 따른 헤더 숨김/표시 (선택사항)
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * 이미지 최적화 (레이지 로딩)
     */
    function initImageOptimization() {
        // Intersection Observer를 지원하는 브라우저에서만 실행
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // data-src 속성이 있는 경우 레이지 로딩
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                    }

                    // 로딩 애니메이션 추가
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';

                    img.onload = function() {
                        img.style.opacity = '1';
                    };

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // 모든 이미지에 observer 적용
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // 이미 로드된 이미지는 제외
            if (img.complete && img.naturalHeight !== 0) {
                return;
            }

            imageObserver.observe(img);

            // 레이지 로딩을 위한 클래스 추가
            img.classList.add('lazy');
        });
    }

    /**
     * 부드러운 스크롤
     */
    function initSmoothScroll() {
        // 앵커 링크에 부드러운 스크롤 적용
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // 포커스 이동 (접근성)
                    targetElement.focus();
                }
            });
        });
    }

    /**
     * 검색 기능 향상
     */
    function initSearchEnhancement() {
        const searchInput = document.querySelector('.search-form input');
        const searchBtn = document.querySelector('.search-btn');

        if (!searchInput || !searchBtn) return;

        // 검색어 자동완성 (간단한 버전)
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

        // 검색 제안 표시
        if (recentSearches.length > 0) {
            const datalist = document.createElement('datalist');
            datalist.id = 'search-suggestions';

            recentSearches.forEach(term => {
                const option = document.createElement('option');
                option.value = term;
                datalist.appendChild(option);
            });

            searchInput.setAttribute('list', 'search-suggestions');
            searchInput.parentNode.appendChild(datalist);
        }

        // 검색 시 로컬 스토리지에 저장
        function saveSearchTerm(term) {
            if (term.trim() === '') return;

            let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            searches = searches.filter(s => s !== term); // 중복 제거
            searches.unshift(term); // 맨 앞에 추가
            searches = searches.slice(0, 5); // 최대 5개만 저장

            localStorage.setItem('recentSearches', JSON.stringify(searches));
        }

        // 검색 이벤트
        searchBtn.addEventListener('click', function() {
            saveSearchTerm(searchInput.value);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveSearchTerm(searchInput.value);
            }
        });
    }

    /**
     * 댓글 기능 향상
     */
    function initCommentEnhancement() {
        // 댓글 작성 시간을 상대적 시간으로 표시
        const timeElements = document.querySelectorAll('.tt_date, .recent-time, .comment-time');

        timeElements.forEach(element => {
            const timeText = element.textContent.trim();
            const relativeTime = getRelativeTime(timeText);

            if (relativeTime) {
                element.setAttribute('title', timeText); // 원본 시간을 툴팁으로
                element.textContent = relativeTime;
            }
        });

        // 댓글 폼 개선
        const commentTextarea = document.querySelector('.tt-cmt');
        if (commentTextarea) {
            // 글자 수 카운터 추가
            addCharacterCounter(commentTextarea);

            // 자동 크기 조절
            autoResizeTextarea(commentTextarea);
        }
    }

    /**
     * 상대적 시간 계산
     */
    function getRelativeTime(timeString) {
        try {
            const date = new Date(timeString.replace(/\./g, '-'));
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return '방금 전';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

            return null; // 일주일 이상은 원본 시간 표시
        } catch (e) {
            return null;
        }
    }

    /**
     * 글자 수 카운터 추가
     */
    function addCharacterCounter(textarea) {
        const maxLength = 1000;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: right;
      margin-top: 0.5rem;
    `;

        const updateCounter = () => {
            const currentLength = textarea.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;

            if (currentLength > maxLength * 0.9) {
                counter.style.color = 'var(--warning-color)';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        };

        textarea.addEventListener('input', updateCounter);
        textarea.parentNode.appendChild(counter);
        updateCounter();
    }

    /**
     * 텍스트영역 자동 크기 조절
     */
    function autoResizeTextarea(textarea) {
        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        };

        textarea.addEventListener('input', resize);
        textarea.addEventListener('paste', () => setTimeout(resize, 0));
        resize();
    }

    /**
     * 다크 모드 토글
     */
    function initThemeToggle() {
        // 다크 모드 버튼 생성
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', '다크 모드 토글');
        themeToggle.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    `;

        document.body.appendChild(themeToggle);

        // 저장된 테마 설정 로드
        const savedTheme = localStorage.getItem('theme') || 'auto';
        applyTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });

        function applyTheme(theme) {
            if (theme === 'auto') {
                // 시스템 설정에 따라 자동 결정
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = prefersDark ? 'dark' : 'light';
            }

            document.documentElement.setAttribute('data-theme', theme);
            themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }

        // 시스템 테마 변경 감지
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (localStorage.getItem('theme') === 'auto') {
                applyTheme('auto');
            }
        });
    }

    /**
     * 맨 위로 버튼
     */
    function initBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTop.setAttribute('aria-label', '맨 위로');
        backToTop.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    `;

        document.body.appendChild(backToTop);

        // 스크롤 위치에 따라 버튼 표시/숨김
        function toggleBackToTop() {
            if (window.pageYOffset > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }

        window.addEventListener('scroll', toggleBackToTop, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * 읽기 진행률 표시
     */
    function initProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: var(--primary-color);
      z-index: 1001;
      transition: width 0.1s ease;
    `;

        document.body.appendChild(progressBar);

        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;
            const progressPercent = Math.min(scrollPercent * 100, 100);

            progressBar.style.width = progressPercent + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    /**
     * 키보드 단축키
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 검색창 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-form input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // ESC: 검색창 블러
            if (e.key === 'Escape') {
                const searchInput = document.querySelector('.search-form input');
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.blur();
                }
            }
        });
    }

    /**
     * 무한 스크롤 (선택사항)
     */
    function initInfiniteScroll() {
        const pagination = document.querySelector('.pagination');
        const nextPageLink = document.querySelector('.next:not(.disabled)');

        if (!pagination || !nextPageLink) return;

        let loading = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !loading && nextPageLink) {
                    loadNextPage();
                }
            });
        }, {
            rootMargin: '100px'
        });

        observer.observe(pagination);

        async function loadNextPage() {
            loading = true;

            try {
                const nextUrl = nextPageLink.getAttribute('href');
                if (!nextUrl) return;

                const response = await fetch(nextUrl);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                // 새로운 포스트들 추가
                const newPosts = doc.querySelectorAll('.post, .list-item');
                const contentArea = document.querySelector('.content');

                newPosts.forEach(post => {
                    contentArea.insertBefore(post, pagination);
                });

                // 페이지네이션 업데이트
                const newPagination = doc.querySelector('.pagination');
                if (newPagination) {
                    pagination.replaceWith(newPagination);
                }

                // 새로 추가된 이미지에 레이지 로딩 적용
                initImageOptimization();

            } catch (error) {
                console.error('페이지 로딩 실패:', error);
            } finally {
                loading = false;
            }
        }
    }

    /**
     * 이미지 확대 보기 (라이트박스)
     */
    function initImageLightbox() {
        const images = document.querySelectorAll('.post-content img, .page-content img');

        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openLightbox(img.src, img.alt));
        });

        function openLightbox(src, alt) {
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
      `;

            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;
            img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: var(--border-radius);
      `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
      `;

            lightbox.appendChild(img);
            lightbox.appendChild(closeBtn);
            document.body.appendChild(lightbox);

            // 닫기 이벤트
            const closeLightbox = () => {
                lightbox.remove();
                document.body.style.overflow = '';
            };

            lightbox.addEventListener('click', closeLightbox);
            closeBtn.addEventListener('click', closeLightbox);

            // ESC 키로 닫기
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    closeLightbox();
                    document.removeEventListener('keydown', handleKeydown);
                }
            };
            document.addEventListener('keydown', handleKeydown);

            // 스크롤 방지
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 성능 최적화를 위한 디바운스 함수
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 스로틀 함수
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 로컬 스토리지 유틸리티
     */
    const storage = {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('로컬 스토리지 저장 실패:', e);
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('로컬 스토리지 읽기 실패:', e);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('로컬 스토리지 삭제 실패:', e);
            }
        }
    };

    /**
     * 에러 처리
     */
    window.addEventListener('error', (e) => {
        console.error('JavaScript 에러:', e.error);
    });

    // 모든 초기화 함수 호출
    document.addEventListener('DOMContentLoaded', function() {
        initKeyboardShortcuts();
        initImageLightbox();

        // 페이지가 완전히 로드된 후 무한 스크롤 초기화
        window.addEventListener('load', () => {
            // initInfiniteScroll(); // 필요시 주석 해제
        });
    });

})();