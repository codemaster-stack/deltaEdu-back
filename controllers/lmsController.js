/* ================================================================
   lms.js — Learning Management System
================================================================ */

'use strict';

/* ----------------------------------------------------------------
   STATIC COURSE DATA (fallback)
---------------------------------------------------------------- */
const COURSES = [
  {
    id: 1, title: 'Mathematics — SSS 2', subject: 'Mathematics',
    level: 'senior', levelLabel: 'Senior Secondary', class: 'SSS 2',
    icon: '📐', colour: '#1B4F8A', teacher: 'Mr. Chukwudi Nwachukwu',
    duration: '5h 20m', enrolled: true,
    desc: 'Algebra, trigonometry, statistics and coordinate geometry for Senior Secondary 2 students.',
    modules: [
      { title: 'Module 1: Algebra', lessons: [
        { id: 101, title: 'Simultaneous Equations', type: 'video', duration: '18 min',
          body: 'Simultaneous equations involve two or more equations that share the same unknowns.\n\nThe two main methods are substitution and elimination.',
          keypoints: ['Substitution method', 'Elimination method', 'Always verify your solution'],
          assignment: { title: 'Solve 5 pairs of simultaneous equations', due: '7 days', marks: 10 } },
        { id: 102, title: 'Quadratic Equations', type: 'video', duration: '22 min',
          body: 'A quadratic equation has the form ax² + bx + c = 0.\n\nThree methods: factorisation, completing the square, quadratic formula.',
          keypoints: ['Discriminant b²−4ac', 'Two roots, one root, or no real roots'],
          assignment: null },
      ]},
      { title: 'Module 2: Trigonometry', lessons: [
        { id: 104, title: 'SOH-CAH-TOA', type: 'video', duration: '20 min',
          body: 'Trigonometry studies relationships between sides and angles of triangles.',
          keypoints: ['sin θ = Opposite/Hypotenuse', 'cos θ = Adjacent/Hypotenuse', 'tan θ = Opposite/Adjacent'],
          assignment: null },
      ]},
    ],
  },
  {
    id: 2, title: 'English Language — SSS 1', subject: 'English Language',
    level: 'senior', levelLabel: 'Senior Secondary', class: 'SSS 1',
    icon: '📖', colour: '#1A6B4A', teacher: 'Mrs. Ngozi Onyekachi',
    duration: '4h 10m', enrolled: true,
    desc: 'Comprehension, essay writing, grammar and oral English for Senior Secondary 1 students.',
    modules: [
      { title: 'Module 1: Essay Writing', lessons: [
        { id: 201, title: 'The Expository Essay', type: 'video', duration: '16 min',
          body: 'An expository essay explains or describes a topic objectively.\n\nStructure: Introduction → Body → Conclusion.',
          keypoints: ['Each body paragraph needs a topic sentence', 'Use formal register', 'No personal opinion'],
          assignment: { title: 'Write a 400-word expository essay', due: '7 days', marks: 20 } },
      ]},
    ],
  },
  {
    id: 3, title: 'Basic Science — JSS 2', subject: 'Basic Science',
    level: 'junior', levelLabel: 'Junior Secondary', class: 'JSS 2',
    icon: '🔬', colour: '#7B3FA0', teacher: 'Mr. Emeka Obi',
    duration: '3h 00m', enrolled: false,
    desc: 'Foundations of science — matter, energy, living things, and scientific investigation.',
    modules: [
      { title: 'Module 1: Matter', lessons: [
        { id: 301, title: 'States of Matter', type: 'video', duration: '15 min',
          body: 'Matter exists in three states: solid, liquid, and gas.',
          keypoints: ['Solids: fixed shape and volume', 'Liquids: fixed volume only', 'Gases: no fixed shape or volume'],
          assignment: null },
      ]},
    ],
  },
];

/* ----------------------------------------------------------------
   PROGRESS STORE
---------------------------------------------------------------- */
const progressStore = {};

function getProgress(courseId) {
  if (!progressStore[courseId]) progressStore[courseId] = new Set();
  return progressStore[courseId];
}

function markLessonComplete(courseId, lessonId) {
  getProgress(courseId).add(lessonId);
}

function courseProgressPct(course) {
  const cid   = course.id || course._id;
  const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  return total === 0 ? 0 : Math.round((getProgress(cid).size / total) * 100);
}

function allLessons(course) {
  return course.modules.flatMap(m => m.lessons);
}

function totalLessons(course) {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

/* ----------------------------------------------------------------
   STATS STRIP
---------------------------------------------------------------- */
function renderStatsStrip() {
  const el = document.getElementById('lms-stats-inner');
  if (!el) return;
  const total    = COURSES.length;
  const enrolled = COURSES.filter(c => c.enrolled).length;
  const lessons  = COURSES.reduce((n, c) => n + totalLessons(c), 0);
  const teachers = [...new Set(COURSES.map(c => c.teacher))].length;
  const items = [
    { num: total,    label: 'Total Courses' },
    { num: enrolled, label: 'Enrolled'      },
    { num: lessons,  label: 'Total Lessons' },
    { num: teachers, label: 'Teachers'      },
  ];
  el.innerHTML = items.map((item, i) => `
    ${i > 0 ? '<div class="lms-stat-divider" aria-hidden="true"></div>' : ''}
    <div class="lms-stat">
      <span class="lms-stat-num">${item.num}</span>
      <span class="lms-stat-label">${item.label}</span>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   SCREEN SWITCHING
---------------------------------------------------------------- */
function showCatalogue() {
  document.getElementById('screen-catalogue').hidden = false;
  document.getElementById('screen-course').hidden    = true;
  if (document.getElementById('screen-admin')) {
    document.getElementById('screen-admin').hidden = true;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showCatalogue = showCatalogue;

window.showCourseView = function(courseId) {
  const course = COURSES.find(c => (c.id || c._id) === courseId || (c.id || c._id) === String(courseId));
  if (!course) return;
  document.getElementById('screen-catalogue').hidden = true;
  document.getElementById('screen-course').hidden    = false;
  if (document.getElementById('screen-admin')) {
    document.getElementById('screen-admin').hidden = true;
  }
  renderCourseView(course);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ----------------------------------------------------------------
   ENROL
---------------------------------------------------------------- */
window.enrollCourse = function(courseId) {
  const course = COURSES.find(c => (c.id || c._id) === courseId);
  if (!course) return;
  course.enrolled = true;
  showToast(`You have enrolled in ${course.title}!`, 'success');
  renderCourseView(course);
  renderCatalogue();
};

/* ----------------------------------------------------------------
   COURSE CATALOGUE
---------------------------------------------------------------- */
let activeFilter = 'all';
let searchQuery  = '';

function filteredCourses() {
  return COURSES.filter(c => {
    const matchFilter =
      activeFilter === 'all'      ? true :
      activeFilter === 'enrolled' ? c.enrolled :
      c.level === activeFilter;
    const matchSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery) ||
      c.subject.toLowerCase().includes(searchQuery) ||
      c.teacher.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });
}

function renderCatalogue() {
  const skeletonEl = document.getElementById('skeleton-grid');
  const gridEl     = document.getElementById('courses-grid');
  const emptyEl    = document.getElementById('courses-empty');
  if (!gridEl) return;

  if (skeletonEl) skeletonEl.hidden = true;
  const courses = filteredCourses();

  if (courses.length === 0) {
    gridEl.hidden  = true;
    emptyEl.hidden = false;
    emptyEl.classList.add('visible');
    return;
  }

  emptyEl.hidden = true;
  emptyEl.classList.remove('visible');
  gridEl.hidden  = false;

  gridEl.innerHTML = courses.map(c => {
    const cid = c.id || c._id;
    const pct = c.enrolled ? courseProgressPct(c) : 0;
    return `
      <article class="course-card stagger" onclick="showCourseView('${cid}')"
        tabindex="0" role="button" aria-label="${c.title}"
        onkeydown="if(event.key==='Enter')showCourseView('${cid}')">
        <div class="course-card-cover" style="background:${c.colour}22">
          <span style="position:relative;z-index:1">${c.icon}</span>
        </div>
        <div class="course-card-body">
          <div class="course-level-badge">${c.levelLabel} · ${c.class}</div>
          <div class="course-card-title">${c.title}</div>
          <div class="course-card-desc">${c.desc}</div>
          ${c.enrolled ? `
            <div class="course-progress-wrap">
              <div class="course-progress-label"><span>Progress</span><span>${pct}%</span></div>
              <div class="course-progress-track">
                <div class="course-progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="course-card-footer">
          <span class="course-meta-item">${Icon.book} ${totalLessons(c)} lessons</span>
          <span class="course-meta-item">${Icon.clock} ${c.duration}</span>
          ${c.enrolled
            ? `<span class="badge badge-green" style="font-size:.7rem">Enrolled</span>`
            : `<span class="badge badge-grey"  style="font-size:.7rem">Not enrolled</span>`}
        </div>
      </article>
    `;
  }).join('');
}

function initCatalogue() {
  document.querySelectorAll('.lms-filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lms-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderCatalogue();
    });
  });

  const slot = document.getElementById('lms-search-icon');
  if (slot) slot.outerHTML = `<span class="search-icon-el" aria-hidden="true">${Icon.search}</span>`;

  document.getElementById('lms-search')
    ?.addEventListener('input', debounce(e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCatalogue();
    }, 200));
}

/* ----------------------------------------------------------------
   COURSE VIEW
---------------------------------------------------------------- */
let activeCourse = null;
let activeLesson = null;

function renderCourseView(course) {
  activeCourse = course;
  activeLesson = null;
  const cid = course.id || course._id;

  const hero = document.getElementById('course-hero');
  if (hero) hero.style.background = `linear-gradient(135deg, ${course.colour} 0%, ${course.colour}cc 100%)`;

  const heroInner = document.getElementById('course-hero-inner');
  const pct       = courseProgressPct(course);
  const completed = getProgress(cid).size;
  const total     = totalLessons(course);

  if (heroInner) {
    heroInner.innerHTML = `
      <div class="course-hero-icon" style="background:${course.colour}33">${course.icon}</div>
      <div class="course-hero-text">
        <div class="course-hero-level">${course.levelLabel} · ${course.class}</div>
        <h1 class="course-hero-title">${course.title}</h1>
        <div class="course-hero-meta">
          <span class="course-hero-meta-item">${Icon.users} Teacher: <span>${course.teacher}</span></span>
          <span class="course-hero-meta-item">${Icon.book} <span>${total} lessons</span></span>
          <span class="course-hero-meta-item">${Icon.clock} <span>${course.duration}</span></span>
        </div>
      </div>
      <div class="course-hero-progress">
        <div class="chp-label">Your Progress</div>
        <div class="chp-pct">${pct}%</div>
        <div class="chp-track"><div class="chp-fill" style="width:${pct}%"></div></div>
        <div class="chp-sub">${completed} of ${total} lessons complete</div>
      </div>
      ${!course.enrolled ? `
        <button class="btn btn-gold" style="margin-top:var(--s4)" onclick="enrollCourse('${cid}')">
          Enrol in this Course →
        </button>
      ` : ''}
    `;
  }

  const metaEl = document.getElementById('lessons-meta');
  if (metaEl) metaEl.textContent = `${total} lessons · ${course.modules.length} modules`;

  renderLessonsList(course);

  document.getElementById('lesson-placeholder').hidden = false;
  document.getElementById('lesson-content').hidden     = true;
}

function renderLessonsList(course) {
  const list = document.getElementById('lessons-list');
  if (!list) return;
  const cid      = course.id || course._id;
  const progress = getProgress(cid);
  const typeIcon = { video: '▶', reading: '📄' };

  list.innerHTML = course.modules.map(mod => `
    <div class="lesson-module">
      <div class="lesson-module-header">
        <span>${mod.title}</span>
        <span class="module-count">${mod.lessons.length} lessons</span>
      </div>
      ${mod.lessons.map(lesson => {
        const lid     = lesson.id || lesson._id;
        const done    = progress.has(String(lid));
        const current = activeLesson && (activeLesson.id || activeLesson._id) === lid;
        return `
          <div class="lesson-row ${current ? 'active' : ''} ${done ? 'completed' : ''}"
            onclick="openLesson('${cid}', '${lid}')" tabindex="0" role="button">
            <div class="lesson-row-icon ${done ? 'done' : current ? 'active' : 'pending'}">
              ${done ? '✅' : typeIcon[lesson.type] || '📄'}
            </div>
            <div class="lesson-row-info">
              <div class="lesson-row-title">${lesson.title}</div>
              <div class="lesson-row-meta">
                <span>${lesson.type}</span><span>·</span><span>${lesson.duration}</span>
              </div>
            </div>
            ${done ? '<span class="lesson-check">✓</span>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   LESSON VIEWER
---------------------------------------------------------------- */
window.openLesson = function(courseId, lessonId) {
  const course  = COURSES.find(c => (c.id || c._id) === courseId || String(c.id || c._id) === String(courseId));
  if (!course) return;
  const lessons = allLessons(course);
  const lesson  = lessons.find(l => String(l.id || l._id) === String(lessonId));
  if (!lesson) return;

  activeLesson = lesson;
  renderLessonsList(course);

  const placeholder = document.getElementById('lesson-placeholder');
  const content     = document.getElementById('lesson-content');
  if (!placeholder || !content) return;

  placeholder.hidden = true;
  content.hidden     = false;

  const cid    = course.id || course._id;
  const lid    = lesson.id || lesson._id;
  const modName = course.modules.find(m => m.lessons.some(l => (l.id || l._id) === (lesson.id || lesson._id)))?.title || '';

  const bodyText   = lesson.body || lesson.content || '';
  const paragraphs = bodyText.split('\n\n').filter(Boolean).map(p => `<p class="lc-text">${p}</p>`).join('');

  const kpoints = lesson.keypoints || lesson.keyPoints || [];
  const keypointsHTML = kpoints.length ? `
    <div class="lc-keypoints">
      <div class="lc-keypoints-title">Key Points</div>
      <div class="lc-keypoints-list">
        ${kpoints.map(k => `<div class="lc-keypoint"><div class="lc-keypoint-dot"></div><span>${k}</span></div>`).join('')}
      </div>
    </div>
  ` : '';

  const assignmentHTML = lesson.assignment ? `
    <div class="lc-assignment">
      <div class="lc-assignment-icon">📝</div>
      <div class="lc-assignment-body">
        <div class="lc-assignment-title">${lesson.assignment.title}</div>
        <div class="lc-assignment-desc">Due in ${lesson.assignment.due} · ${lesson.assignment.marks} marks</div>
        <button class="btn btn-gold btn-sm" onclick="showToast('Assignment submission coming in Stage 6','info')">Submit Assignment →</button>
      </div>
    </div>
  ` : '';

  const videoUrl  = lesson.videoUrl || lesson.video_url || '';
  const videoHTML = lesson.type === 'video' ? (
    videoUrl ? `
      <div class="lc-video-player">
        <video controls style="width:100%;border-radius:var(--r-lg);background:#000;max-height:420px">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    ` : `
      <div class="lc-video" onclick="showToast('No video uploaded for this lesson yet.','info')">
        <div class="lc-video-play">▶</div>
        <span class="lc-video-label">${lesson.title} · ${lesson.duration}</span>
      </div>
    `
  ) : '';

  const idx   = lessons.indexOf(lesson);
  const prevL = lessons[idx - 1];
  const nextL = lessons[idx + 1];
  const isDone = getProgress(String(cid)).has(String(lid));

  content.innerHTML = `
    <div class="lc-header">
      <div class="lc-breadcrumb">${course.title} › ${modName}</div>
      <h2 class="lc-title">${lesson.title}</h2>
      <div class="lc-meta">
        <span class="lc-meta-item">${lesson.type === 'video' ? '▶ Video' : '📄 Reading'}</span>
        <span class="lc-meta-item">${Icon.clock} ${lesson.duration}</span>
      </div>
    </div>
    ${videoHTML}
    <div class="lc-body">${paragraphs}${keypointsHTML}${assignmentHTML}</div>
    <div class="lc-footer">
      <div>
        ${prevL ? `<button class="btn btn-outline btn-sm" onclick="openLesson('${cid}','${prevL.id || prevL._id}')">← Previous</button>` : '<span></span>'}
      </div>
      <button class="btn ${isDone ? 'btn-outline' : 'btn-gold'} btn-sm lc-complete-btn" id="complete-btn"
        onclick="toggleComplete('${cid}','${lid}')">
        ${isDone ? '✅ Completed' : 'Mark as Complete ✓'}
      </button>
      <div>
        ${nextL ? `<button class="btn btn-gold btn-sm" onclick="openLesson('${cid}','${nextL.id || nextL._id}')">Next →</button>` : '<span></span>'}
      </div>
    </div>
  `;
};

/* ----------------------------------------------------------------
   COMPLETE / UNCOMPLETE
---------------------------------------------------------------- */
window.toggleComplete = function(courseId, lessonId) {
  const cid      = String(courseId);
  const lid      = String(lessonId);
  const progress = getProgress(cid);

  if (progress.has(lid)) {
    progress.delete(lid);
    showToast('Lesson marked as incomplete.', 'info');
  } else {
    progress.add(lid);
    showToast('Lesson completed! Well done.', 'success');
  }

  const course = COURSES.find(c => String(c.id || c._id) === cid);
  if (course) renderLessonsList(course);

  const pct       = course ? courseProgressPct(course) : 0;
  const completed = progress.size;
  const total     = course ? totalLessons(course) : 0;

  const pctEl  = document.querySelector('.chp-pct');
  const fillEl = document.querySelector('.chp-fill');
  const subEl  = document.querySelector('.chp-sub');
  if (pctEl)  pctEl.textContent  = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (subEl)  subEl.textContent  = `${completed} of ${total} lessons complete`;

  const btn  = document.getElementById('complete-btn');
  const done = progress.has(lid);
  if (btn) {
    btn.className   = `btn ${done ? 'btn-outline' : 'btn-gold'} btn-sm lc-complete-btn`;
    btn.textContent = done ? '✅ Completed' : 'Mark as Complete ✓';
  }
};

/* ----------------------------------------------------------------
   LOAD COURSES FROM API
---------------------------------------------------------------- */
async function loadCourses() {
  document.getElementById('skeleton-grid').hidden = true;
  renderCatalogue();

  try {
    const data = await apiFetch('/lms/courses');
    if (data?.courses?.length) {
      COURSES.length = 0;
      COURSES.push(...data.courses.map(c => ({ ...c, id: c._id, enrolled: false })));
      renderStatsStrip();
      renderCatalogue();
    }
  } catch { /* keep static */ }
}

/* ================================================================
   LMS ADMIN
================================================================ */

let adminCourses           = [];
let currentCourseForModule = null;

function isLmsAdmin() {
  const user = session?.getUser?.();
  return user && (user.role === 'ministry_admin' || user.role === 'staff');
}

function initAdminButton() {
  if (!isLmsAdmin()) return;
  const toolbar = document.querySelector('.lms-toolbar');
  if (!toolbar) return;
  const btn = document.createElement('button');
  btn.className   = 'btn btn-outline';
  btn.textContent = '⚙️ Manage Courses';
  btn.addEventListener('click', () => window.showAdminScreen());
  toolbar.appendChild(btn);
}

window.showAdminScreen = async function() {
  document.getElementById('screen-catalogue').hidden = true;
  document.getElementById('screen-course').hidden    = true;
  document.getElementById('screen-admin').hidden     = false;
  await loadAdminCourses();
};

async function loadAdminCourses() {
  try {
    const data = await apiFetch('/lms/courses/all');
    adminCourses = data?.courses || [];
    renderAdminCourseStats();
    renderCoursesTable();
  } catch {
    showToast('Failed to load courses.', 'error');
  }
}

function renderAdminCourseStats() {
  const el = document.getElementById('lms-admin-stats');
  if (!el) return;
  const total     = adminCourses.length;
  const published = adminCourses.filter(c => c.status === 'published').length;
  const draft     = adminCourses.filter(c => c.status === 'draft').length;
  el.innerHTML = `
    <div class="cbt-admin-stat"><span class="cbt-admin-stat-num">${total}</span><span class="cbt-admin-stat-label">Total Courses</span></div>
    <div class="cbt-admin-stat"><span class="cbt-admin-stat-num" style="color:var(--green)">${published}</span><span class="cbt-admin-stat-label">Published</span></div>
    <div class="cbt-admin-stat"><span class="cbt-admin-stat-num" style="color:var(--gold)">${draft}</span><span class="cbt-admin-stat-label">Draft</span></div>
  `;
}

function renderCoursesTable() {
  const tbody   = document.getElementById('courses-tbody');
  const emptyEl = document.getElementById('courses-admin-empty');
  if (!tbody) return;

  if (adminCourses.length === 0) {
    tbody.closest('.cbt-admin-table-wrap').hidden = true;
    emptyEl.hidden = false;
    emptyEl.classList.add('visible');
    return;
  }

  tbody.closest('.cbt-admin-table-wrap').hidden = false;
  emptyEl.hidden = true;
  emptyEl.classList.remove('visible');

  const statusBadge = { published: 'badge-green', draft: 'badge-gold' };
  tbody.innerHTML = adminCourses.map(course => {
    const cid = course._id;
    const safeTitle = course.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `
      <tr>
        <td style="font-size:1.5rem">${course.icon || '📚'}</td>
        <td>${course.title}</td>
        <td>${course.levelLabel || course.level}</td>
        <td>${course.class || '—'}</td>
        <td>${course.modules?.length || 0}</td>
        <td><span class="badge ${statusBadge[course.status] || 'badge-grey'}">${course.status}</span></td>
        <td>
          <div class="exam-actions">
            <button class="btn btn-ghost btn-sm" onclick="openAddModuleModal('${cid}', '${safeTitle}')">Add Module</button>
            <button class="btn btn-outline btn-sm" onclick="toggleCourseStatus('${cid}', '${course.status}')">
              ${course.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteCourseItem('${cid}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initCreateCourseModal() {
  const backdrop = document.getElementById('modal-create-course');
  if (!backdrop) return;

  document.getElementById('create-course-btn')?.addEventListener('click', () => backdrop.classList.add('open'));
  document.getElementById('close-create-course')?.addEventListener('click',  () => backdrop.classList.remove('open'));
  document.getElementById('cancel-create-course')?.addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  document.getElementById('submit-create-course')?.addEventListener('click', async () => {
    const title   = document.getElementById('cc-title').value.trim();
    const subject = document.getElementById('cc-subject').value;
    const cls     = document.getElementById('cc-class').value;
    const level   = document.getElementById('cc-level').value;
    const teacher = document.getElementById('cc-teacher').value.trim();
    const desc    = document.getElementById('cc-desc').value.trim();
    const icon    = document.getElementById('cc-icon').value.trim() || '📚';
    const status  = document.getElementById('cc-status').value;
    const levelLabels = { 'primary': 'Primary', 'junior-secondary': 'Junior Secondary', 'senior-secondary': 'Senior Secondary' };

    let hasError = false;
    ['cc-title','cc-subject','cc-class','cc-level'].forEach(id => {
      const el = document.getElementById(id);
      const err = document.getElementById(`${id}-error`);
      if (!el?.value) { if (err) { err.textContent = 'Required.'; err.hidden = false; } hasError = true; }
      else { if (err) err.hidden = true; }
    });
    if (hasError) return;

    const btn     = document.getElementById('submit-create-course');
    const restore = setLoadingBtn(btn, 'Creating…');

    try {
      const data = await apiFetch('/lms/courses', {
        method: 'POST',
        body: { title, subject, class: cls, level, levelLabel: levelLabels[level] || level, teacher, desc, icon, status },
      });
      adminCourses.unshift(data.course);
      renderAdminCourseStats();
      renderCoursesTable();
      backdrop.classList.remove('open');
      ['cc-title','cc-subject','cc-class','cc-level','cc-teacher','cc-desc','cc-icon'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      showToast(`Course "${data.course.title}" created.`, 'success');
      restore();
    } catch (err) {
      showToast(err.message || 'Failed to create course.', 'error');
      restore();
    }
  });
}

window.toggleCourseStatus = async function(courseId, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const confirmed = await confirmDialog(newStatus === 'published' ? 'Publish this course?' : 'Unpublish this course?');
  if (!confirmed) return;
  try {
    const data = await apiFetch(`/lms/courses/${courseId}`, { method: 'PATCH', body: { status: newStatus } });
    const idx = adminCourses.findIndex(c => c._id === courseId);
    if (idx !== -1) adminCourses[idx] = data.course;
    renderAdminCourseStats();
    renderCoursesTable();
    showToast(`Course ${newStatus}.`, 'success');
  } catch (err) { showToast(err.message || 'Failed.', 'error'); }
};

window.deleteCourseItem = async function(courseId) {
  const confirmed = await confirmDialog('Delete this course? This cannot be undone.');
  if (!confirmed) return;
  try {
    await apiFetch(`/lms/courses/${courseId}`, { method: 'DELETE' });
    adminCourses = adminCourses.filter(c => c._id !== courseId);
    renderAdminCourseStats();
    renderCoursesTable();
    showToast('Course deleted.', 'success');
  } catch (err) { showToast(err.message || 'Failed.', 'error'); }
};

/* ----------------------------------------------------------------
   ADD LESSON ROW (defined before openAddModuleModal uses it)
---------------------------------------------------------------- */
function addLessonRow() {
  const container = document.getElementById('lessons-container');
  if (!container) return;
  const index = container.children.length;
  const div   = document.createElement('div');
  div.className = 'question-block';
  div.id        = `lblock-${index}`;
  div.innerHTML = `
    <div class="question-block-header">
      <span class="question-num-label">Lesson ${index + 1}</span>
      <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="this.closest('.question-block').remove()">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Lesson Title *</label>
        <input type="text" class="form-control l-title" placeholder="e.g. Introduction to Algebra" />
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control form-select l-type" onchange="toggleVideoUpload(this)">
          <option value="reading">Reading</option>
          <option value="video">Video</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Duration</label>
        <input type="text" class="form-control l-duration" placeholder="e.g. 30 min" />
      </div>
    </div>
    <div class="video-upload-section" style="display:none">
      <div class="form-group">
        <label class="form-label">Upload Video *</label>
        <div class="video-drop-zone" onclick="this.querySelector('.l-video-input').click()">
          <div class="video-drop-inner">
            <span style="font-size:2rem">🎬</span>
            <span class="video-drop-text">Click to upload video</span>
            <span class="video-drop-hint">MP4, MOV, AVI, WEBM — Max 500MB</span>
          </div>
          <input type="file" class="l-video-input" accept="video/*" style="display:none" onchange="handleVideoUpload(this)" />
        </div>
        <div class="video-upload-progress" style="display:none">
          <div class="vup-bar-track"><div class="vup-bar-fill"></div></div>
          <span class="vup-label">Uploading…</span>
        </div>
        <input type="hidden" class="l-video-url" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Content / Notes</label>
      <textarea class="form-control l-content" rows="2" placeholder="Lesson notes or reading content…"></textarea>
    </div>
  `;
  container.appendChild(div);
}

window.toggleVideoUpload = function(select) {
  const block   = select.closest('.question-block');
  const section = block.querySelector('.video-upload-section');
  if (section) section.style.display = select.value === 'video' ? 'block' : 'none';
};

window.handleVideoUpload = async function(input) {
  const block     = input.closest('.question-block');
  const progress  = block.querySelector('.video-upload-progress');
  const fill      = block.querySelector('.vup-bar-fill');
  const label     = block.querySelector('.vup-label');
  const urlInput  = block.querySelector('.l-video-url');
  const dropInner = block.querySelector('.video-drop-inner');
  const file      = input.files[0];
  if (!file) return;

  progress.style.display = 'block';
  fill.style.width = '0%';
  label.textContent = 'Uploading…';

  try {
    const token    = localStorage.getItem('edu_access_token') || sessionStorage.getItem('edu_access_token');
    const formData = new FormData();
    formData.append('video', file);

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${window.API_BASE}/upload/video`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          fill.style.width  = `${pct}%`;
          label.textContent = `Uploading… ${pct}%`;
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data     = JSON.parse(xhr.responseText);
          urlInput.value = data.url;
          fill.style.width  = '100%';
          label.textContent = '✅ Upload complete';
          dropInner.innerHTML = `<span style="font-size:2rem">✅</span><span class="video-drop-text">${file.name}</span><span class="video-drop-hint">Click to change</span>`;
          resolve(data);
        } else { reject(new Error('Upload failed')); }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  } catch (err) {
    label.textContent = '❌ Upload failed. Try again.';
    fill.style.width  = '0%';
    showToast(err.message || 'Video upload failed.', 'error');
  }
};

/* ----------------------------------------------------------------
   ADD MODULE MODAL
---------------------------------------------------------------- */
window.openAddModuleModal = function(courseId, courseTitle) {
  document.getElementById('am-course-title').textContent = courseTitle;
  document.getElementById('am-module-title').value = '';
  document.getElementById('lessons-container').innerHTML = '';
  addLessonRow();

  const modal = document.getElementById('modal-add-module');
  modal.classList.add('open');

  document.getElementById('close-add-module').onclick  = () => modal.classList.remove('open');
  document.getElementById('cancel-add-module').onclick = () => modal.classList.remove('open');
  document.getElementById('add-lesson-row').onclick    = () => addLessonRow();

  const submitBtn = document.getElementById('submit-add-module');
  const newBtn    = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newBtn, submitBtn);

  newBtn.addEventListener('click', async () => {
    const moduleTitle = document.getElementById('am-module-title').value.trim();
    if (!moduleTitle) { showToast('Please enter a module title.', 'error'); return; }

    const lessonBlocks = document.querySelectorAll('#lessons-container .question-block');
    const lessons = [];
    let hasError  = false;

    lessonBlocks.forEach(block => {
      const title    = block.querySelector('.l-title')?.value.trim();
      const type     = block.querySelector('.l-type')?.value;
      const duration = block.querySelector('.l-duration')?.value.trim() || '30 min';
      const content  = block.querySelector('.l-content')?.value.trim();
      const videoUrl = block.querySelector('.l-video-url')?.value || '';
      if (!title) { hasError = true; return; }
      lessons.push({ title, type, duration, content, videoUrl });
    });

    if (hasError)       { showToast('Please fill in all lesson titles.', 'error'); return; }
    if (!lessons.length){ showToast('Please add at least one lesson.', 'error');   return; }

    const restore = setLoadingBtn(newBtn, 'Saving…');

    try {
      const data = await apiFetch(`/lms/courses/${courseId}/modules`, {
        method: 'POST',
        body:   { title: moduleTitle, lessons },
      });
      const idx = adminCourses.findIndex(c => c._id === courseId);
      if (idx !== -1) adminCourses[idx] = data.course;
      renderCoursesTable();
      modal.classList.remove('open');
      showToast(`Module "${moduleTitle}" added with ${lessons.length} lesson(s).`, 'success');
      restore();
    } catch (err) {
      showToast(err.message || 'Failed to save module.', 'error');
      restore();
    }
  });
};

/* ----------------------------------------------------------------
   BOOT
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderStatsStrip();
  initCatalogue();
  loadCourses();
  initAdminButton();
  initCreateCourseModal();
});