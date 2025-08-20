/* Drownford JavaScript | assets/js/app.js */

document.addEventListener('DOMContentLoaded', () => {
    // --- App Namespace ---
    const App = {
        // --- State ---
        state: {
            courses: [],
            currentFilters: {
                search: '',
                category: [],
                difficulty: [],
                sort: 'newest'
            },
            currentPage: window.location.pathname,
            currentCourseId: null,
            currentLessonId: null,
        },

        // --- DOM Elements ---
        elements: {
            themeToggle: document.getElementById('theme-toggle'),
            mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
            mobileNavPanel: document.getElementById('mobile-nav-panel'),
            featuredCoursesGrid: document.getElementById('featured-courses-grid'),
            allCoursesGrid: document.getElementById('all-courses-grid'),
            filtersForm: document.getElementById('filters-form'),
            emptyState: document.getElementById('empty-state'),
            resetFiltersBtn: document.getElementById('reset-filters'),
            newsletterForm: document.getElementById('newsletter-form'),
            contactForm: document.getElementById('contact-form'),
            // Course Reader Elements
            courseSidebar: document.getElementById('course-sidebar'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            mainContentArea: document.getElementById('main-content-area'),
            readerHeader: document.getElementById('reader-header'),
            readerContent: document.getElementById('reader-content'),
            quizSection: document.getElementById('quiz-section'),
            lessonList: document.getElementById('lesson-list'),
            sidebarCourseTitle: document.getElementById('sidebar-course-title'),
            prevLessonBtn: document.getElementById('prev-lesson-btn'),
            nextLessonBtn: document.getElementById('next-lesson-btn'),
            fontSizeIncrease: document.getElementById('font-size-decrease'),
            fontSizeDecrease: document.getElementById('font-size-increase'),
            focusModeToggle: document.getElementById('focus-mode-toggle'),
            notesToggle: document.getElementById('notes-toggle'),
            notesPanel: document.getElementById('notes-panel'),
            notesTextarea: document.getElementById('notes-textarea'),
            readingProgressBar: document.getElementById('reading-progress-bar'),
        },

        // --- Initialization ---
        init() {
            this.initTheme();
            this.initMobileMenu();
            this.loadCourses();

            // Page-specific initializations
            if (this.state.currentPage.includes('index.html') || this.state.currentPage === '/') {
                this.initHomePage();
            }
            if (this.state.currentPage.includes('courses.html')) {
                this.initCoursesPage();
            }
            if (this.state.currentPage.includes('course.html')) {
                this.initCourseReaderPage();
            }
            if (this.state.currentPage.includes('contact.html')) {
                this.initContactPage();
            }
            this.initNewsletterForm();
        },

        // --- Global Modules ---

        // Theme Manager
        initTheme() {
            const savedTheme = localStorage.getItem('drownford:theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            if (this.elements.themeToggle) {
                this.elements.themeToggle.addEventListener('click', () => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('drownford:theme', newTheme);
                });
            }
        },

        // Mobile Navigation
        initMobileMenu() {
            if (this.elements.mobileMenuToggle && this.elements.mobileNavPanel) {
                this.elements.mobileMenuToggle.addEventListener('click', () => {
                    const isExpanded = this.elements.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                    this.elements.mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
                    this.elements.mobileNavPanel.classList.toggle('open');
                    document.body.style.overflow = !isExpanded ? 'hidden' : '';
                });
            }
        },

        // Data Fetching
        async loadCourses() {
            try {
                const response = await fetch('./data/courses.json');
                if (!response.ok) throw new Error('Network response was not ok.');
                this.state.courses = await response.json();
                
                // Once data is loaded, trigger page-specific renders
                if (this.state.currentPage.includes('index.html') || this.state.currentPage === '/') {
                    this.renderFeaturedCourses();
                }
                if (this.state.currentPage.includes('courses.html')) {
                    this.renderAllCourses();
                    this.populateFilters();
                }
                 if (this.state.currentPage.includes('course.html')) {
                    this.renderCourseReader();
                }
            } catch (error) {
                console.error('Failed to load courses:', error);
                if(this.elements.featuredCoursesGrid) this.elements.featuredCoursesGrid.innerHTML = '<p>Could not load courses.</p>';
                if(this.elements.allCoursesGrid) this.elements.allCoursesGrid.innerHTML = '<p>Could not load courses.</p>';
            }
        },
        
        // --- UI Components ---

        // Toast Notifications
        showToast(message, type = 'success') {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <div class="toast-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>
                </div>
                <span>${message}</span>
            `;
            toastContainer.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                toast.addEventListener('transitionend', () => toast.remove());
            }, 4000);
        },

        // Course Card Renderer
        createCourseCard(course) {
            const heroSvgs = {
                math: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
                english: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
                reasoning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.73 18a2.64 2.64 0 0 0-3.72 0L12 24l-6.01-6.01a2.64 2.64 0 0 0-3.72 0L12 12l8.73-8.73a2.64 2.64 0 0 0 0-3.72L12 0 2.27 9.73a2.64 2.64 0 0 0 0 3.72L12 24l9.73-9.73a2.64 2.64 0 0 0 0-3.72z"></path></svg>`,
                science: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
                programming: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
                history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
                wellness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
                finance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            };
            const difficultyColors = {
                'Beginner': 'badge-green',
                'Intermediate': 'badge-yellow',
                'Advanced': 'badge-blue' // Re-using blue for advanced
            };

            return `
                <a href="./course.html?id=${course.id}" class="course-card">
                    <div class="card-hero">
                        ${heroSvgs[course.heroSvg] || heroSvgs['reasoning']}
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="badge ${difficultyColors[course.difficulty]}">${course.difficulty}</span>
                            <span>${course.duration}</span>
                        </div>
                        <h4>${course.title}</h4>
                        <p class="card-description">${course.description}</p>
                        <div class="card-footer">
                            <div class="rating">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clip-rule="evenodd" /></svg>
                                <span>${course.rating}</span>
                            </div>
                            <span class="btn btn-ghost">Start</span>
                        </div>
                    </div>
                </a>
            `;
        },

        // --- Page Initializers ---

        initHomePage() {
            // Logic specific to the Home page
        },
        
        initCoursesPage() {
            if (this.elements.filtersForm) {
                this.elements.filtersForm.addEventListener('input', () => this.handleFilterChange());
                this.elements.filtersForm.addEventListener('submit', (e) => e.preventDefault());
            }
            if (this.elements.resetFiltersBtn) {
                this.elements.resetFiltersBtn.addEventListener('click', () => {
                    this.elements.filtersForm.reset();
                    this.handleFilterChange();
                });
            }
        },

        initCourseReaderPage() {
            const urlParams = new URLSearchParams(window.location.search);
            this.state.currentCourseId = urlParams.get('id');
            this.state.currentLessonId = urlParams.get('lesson') || 'l1'; // Default to first lesson
            
            if (!this.state.currentCourseId) {
                this.elements.readerContent.innerHTML = '<h2>Course not found.</h2><p>Please select a course from the <a href="./courses.html">catalog</a>.</p>';
                return;
            }

            this.initReaderControls();
        },

        initContactPage() {
            if (this.elements.contactForm) {
                this.elements.contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (this.validateForm(this.elements.contactForm)) {
                        this.showToast('Message sent successfully!');
                        this.elements.contactForm.reset();
                    } else {
                        this.showToast('Please fix the errors in the form.', 'error');
                    }
                });
            }
        },
        
        initNewsletterForm() {
            if (this.elements.newsletterForm) {
                this.elements.newsletterForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (this.validateForm(this.elements.newsletterForm)) {
                        this.showToast('Thanks for subscribing!');
                        this.elements.newsletterForm.reset();
                    }
                });
            }
        },

        // --- Page-Specific Renderers & Logic ---

        // Home Page
        renderFeaturedCourses() {
            if (!this.elements.featuredCoursesGrid) return;
            const featured = this.state.courses.slice(0, 3); // Simple logic: first 3
            this.elements.featuredCoursesGrid.innerHTML = featured.map(c => this.createCourseCard(c)).join('');
        },

        // Courses Page
        renderAllCourses() {
            if (!this.elements.allCoursesGrid) return;
            
            let filteredCourses = [...this.state.courses];

            // Apply search filter
            if (this.state.currentFilters.search) {
                const searchTerm = this.state.currentFilters.search.toLowerCase();
                filteredCourses = filteredCourses.filter(c => 
                    c.title.toLowerCase().includes(searchTerm) || 
                    c.description.toLowerCase().includes(searchTerm)
                );
            }

            // Apply category filter
            if (this.state.currentFilters.category.length > 0) {
                filteredCourses = filteredCourses.filter(c => this.state.currentFilters.category.includes(c.category));
            }
            
            // Apply difficulty filter
            if (this.state.currentFilters.difficulty.length > 0) {
                filteredCourses = filteredCourses.filter(c => this.state.currentFilters.difficulty.includes(c.difficulty));
            }

            // Apply sorting
            switch (this.state.currentFilters.sort) {
                case 'popular':
                    filteredCourses.sort((a, b) => b.rating - a.rating);
                    break;
                case 'title-asc':
                    filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'title-desc':
                    filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                // 'newest' is default, no sorting needed if data is pre-sorted
            }

            if (filteredCourses.length === 0) {
                this.elements.allCoursesGrid.innerHTML = '';
                this.elements.emptyState.classList.remove('hidden');
            } else {
                this.elements.allCoursesGrid.innerHTML = filteredCourses.map(c => this.createCourseCard(c)).join('');
                this.elements.emptyState.classList.add('hidden');
            }
        },
        
        populateFilters() {
            const categories = [...new Set(this.state.courses.map(c => c.category))];
            const categoryFiltersContainer = document.getElementById('category-filters');
            if (categoryFiltersContainer) {
                categoryFiltersContainer.innerHTML = categories.map(cat => `
                    <div class="form-group">
                        <label><input type="checkbox" name="category" value="${cat}"> ${cat}</label>
                    </div>
                `).join('');
            }
        },

        handleFilterChange() {
            const formData = new FormData(this.elements.filtersForm);
            this.state.currentFilters.search = formData.get('search');
            this.state.currentFilters.category = formData.getAll('category');
            this.state.currentFilters.difficulty = formData.getAll('difficulty');
            this.state.currentFilters.sort = formData.get('sort');
            this.renderAllCourses();
        },

        // Course Reader Page
        renderCourseReader() {
            const course = this.state.courses.find(c => c.id === this.state.currentCourseId);
            if (!course) {
                this.elements.readerContent.innerHTML = '<h2>Course not found.</h2>';
                return;
            }

            const lesson = course.lessons.find(l => l.id === this.state.currentLessonId);
            if (!lesson) {
                // Fallback to first lesson if current is invalid
                this.state.currentLessonId = course.lessons[0].id;
                this.renderCourseReader();
                return;
            }

            // Update page title
            document.title = `${lesson.title} | ${course.title} | Drownford`;

            // Render sidebar
            this.renderSidebar(course);
            
            // Render header
            this.renderReaderHeader(course);
            
            // Render content (dummy content for now)
            this.renderLessonContent(lesson);
            
            // Render quiz (dummy quiz)
            this.renderQuiz(lesson);

            // Update navigation buttons
            this.updateLessonNav(course, lesson);
            
            // Load notes for this lesson
            this.loadNotes();
        },

        renderSidebar(course) {
            if (!this.elements.lessonList || !this.elements.sidebarCourseTitle) return;
            this.elements.sidebarCourseTitle.textContent = course.title;
            const progress = this.getCourseProgress(course.id);
            
            this.elements.lessonList.innerHTML = course.lessons.map(l => `
                <li class="lesson-item">
                    <a href="?id=${course.id}&lesson=${l.id}" class="${l.id === this.state.currentLessonId ? 'active' : ''} ${progress.completedLessons.includes(l.id) ? 'completed' : ''}">
                        <span class="lesson-icon">
                            ${progress.completedLessons.includes(l.id) ? 
                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>` :
                                `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3" /></svg>`
                            }
                        </span>
                        <span class="lesson-title">${l.title}</span>
                        <span class="lesson-duration">${l.duration}</span>
                    </a>
                </li>
            `).join('');
        },

        renderReaderHeader(course) {
            if (!this.elements.readerHeader) return;
            const progress = this.getCourseProgress(course.id);
            const progressPercent = (progress.completedLessons.length / course.lessons.length) * 100;

            this.elements.readerHeader.innerHTML = `
                <h1>${course.title}</h1>
                <div class="card-meta">
                    <span class="badge badge-blue">${course.category}</span>
                    <span class="badge ${ { 'Beginner': 'badge-green', 'Intermediate': 'badge-yellow', 'Advanced': 'badge-blue' }[course.difficulty] }">${course.difficulty}</span>
                </div>
                <div class="progress-bar-container" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                </div>
            `;
        },

        renderLessonContent(lesson) {
            if (!this.elements.readerContent) return;
            // NOTE: In a real app, this would fetch lesson content (e.g., a Markdown file).
            // Here, we generate placeholder content.
            this.elements.readerContent.innerHTML = `
                <h2>${lesson.title}</h2>
                <p>This is the introductory paragraph for the lesson on <strong>${lesson.title}</strong>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                <p>Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.</p>
                <h3>A Key Sub-heading</h3>
                <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Sorbi in nibh quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat.</p>
                <pre><code>// Example code block
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Drownford User');</code></pre>
                <p>Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis. Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat.</p>
            `;
        },

        renderQuiz(lesson) {
            if (!this.elements.quizSection) return;
            // Dummy quiz data
            const quiz = {
                question: `Which concept is central to "${lesson.title}"?`,
                options: ["Concept A", "Concept B", "The Main Concept", "Concept D"],
                correctAnswer: "The Main Concept"
            };

            this.elements.quizSection.innerHTML = `
                <h3>Test Your Knowledge</h3>
                <p>${quiz.question}</p>
                <div class="quiz-options">
                    ${quiz.options.map(opt => `<button class="quiz-option" data-answer="${opt}">${opt}</button>`).join('')}
                </div>
                <div class="quiz-feedback" id="quiz-feedback"></div>
                <button id="submit-quiz" class="btn btn-primary" disabled>Submit Answer</button>
            `;

            const options = this.elements.quizSection.querySelectorAll('.quiz-option');
            const submitBtn = document.getElementById('submit-quiz');
            let selectedAnswer = null;

            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    options.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    selectedAnswer = opt.dataset.answer;
                    submitBtn.disabled = false;
                });
            });

            submitBtn.addEventListener('click', () => {
                const feedbackEl = document.getElementById('quiz-feedback');
                const isCorrect = selectedAnswer === quiz.correctAnswer;
                
                options.forEach(opt => {
                    opt.disabled = true;
                    if (opt.dataset.answer === quiz.correctAnswer) {
                        opt.classList.add('correct');
                    } else if (opt.classList.contains('selected')) {
                        opt.classList.add('incorrect');
                    }
                });

                if (isCorrect) {
                    feedbackEl.textContent = "Correct! Great job.";
                    feedbackEl.className = 'quiz-feedback correct';
                    this.markLessonAsComplete();
                } else {
                    feedbackEl.textContent = `Not quite. The correct answer is "${quiz.correctAnswer}".`;
                    feedbackEl.className = 'quiz-feedback incorrect';
                }
                feedbackEl.style.display = 'block';
                submitBtn.style.display = 'none';
            });
        },

        updateLessonNav(course, lesson) {
            if (!this.elements.prevLessonBtn || !this.elements.nextLessonBtn) return;
            const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
            
            // Previous button
            if (currentIndex > 0) {
                const prevLesson = course.lessons[currentIndex - 1];
                this.elements.prevLessonBtn.disabled = false;
                this.elements.prevLessonBtn.onclick = () => window.location.href = `?id=${course.id}&lesson=${prevLesson.id}`;
            } else {
                this.elements.prevLessonBtn.disabled = true;
            }

            // Next button
            if (currentIndex < course.lessons.length - 1) {
                const nextLesson = course.lessons[currentIndex + 1];
                this.elements.nextLessonBtn.disabled = false;
                this.elements.nextLessonBtn.onclick = () => window.location.href = `?id=${course.id}&lesson=${nextLesson.id}`;
            } else {
                this.elements.nextLessonBtn.disabled = true;
            }
        },
        
        initReaderControls() {
            // Sidebar toggle
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.elements.courseSidebar.classList.toggle('open');
                this.elements.mainContentArea.classList.toggle('sidebar-open');
            });

            // Notes toggle
            this.elements.notesToggle.addEventListener('click', () => {
                this.elements.notesPanel.classList.toggle('open');
            });
            
            // Notes auto-save
            this.elements.notesTextarea.addEventListener('input', () => this.saveNotes());

            // Reading progress bar
            this.elements.mainContentArea.addEventListener('scroll', () => this.updateReadingProgress());

            // Keyboard shortcuts
            window.addEventListener('keydown', (e) => {
                if (e.key === 't') this.elements.themeToggle.click();
                if (e.key === 'f') this.elements.focusModeToggle.click();
            });
        },
        
        // --- Persistence (localStorage) ---
        getCourseProgress(courseId) {
            const progress = JSON.parse(localStorage.getItem('drownford:progress') || '{}');
            return progress[courseId] || { completedLessons: [] };
        },

        markLessonAsComplete() {
            const progress = JSON.parse(localStorage.getItem('drownford:progress') || '{}');
            if (!progress[this.state.currentCourseId]) {
                progress[this.state.currentCourseId] = { completedLessons: [] };
            }
            
            const completed = progress[this.state.currentCourseId].completedLessons;
            if (!completed.includes(this.state.currentLessonId)) {
                completed.push(this.state.currentLessonId);
                localStorage.setItem('drownford:progress', JSON.stringify(progress));
                this.showToast('Lesson complete!');
                this.renderCourseReader(); // Re-render to show progress update
            }
        },
        
        loadNotes() {
            const key = `drownford:notes:${this.state.currentCourseId}:${this.state.currentLessonId}`;
            this.elements.notesTextarea.value = localStorage.getItem(key) || '';
        },

        saveNotes() {
            const key = `drownford:notes:${this.state.currentCourseId}:${this.state.currentLessonId}`;
            localStorage.setItem(key, this.elements.notesTextarea.value);
        },
        
        // --- Utilities ---
        
        updateReadingProgress() {
            if (!this.elements.readingProgressBar || !this.elements.mainContentArea) return;
            const el = this.elements.mainContentArea;
            const scrollableHeight = el.scrollHeight - el.clientHeight;
            const progress = (el.scrollTop / scrollableHeight) * 100;
            this.elements.readingProgressBar.style.width = `${progress}%`;
        },

        validateForm(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('[required]');
            inputs.forEach(input => {
                const isInputValid = this.validateInput(input);
                if (!isInputValid) isValid = false;
            });
            return isValid;
        },
        
        validateInput(input) {
            let valid = true;
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    valid = false;
                }
            } else {
                if (input.value.trim() === '') {
                    valid = false;
                }
            }
            
            if (!valid) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
            return valid;
        }
    };

    // --- Start the App ---
    App.init();
});
