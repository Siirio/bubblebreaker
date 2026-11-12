const sequence = document.querySelector('.sequence')
const stage = sequence.querySelector('.stage')
const film = stage.querySelector('.film')
const sideClippings = [...stage.querySelectorAll('.left, .right')]
const dialogue = document.querySelector('.dialogue')
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const clamp = value => Math.min(1, Math.max(0, value))
const ease = value => value * value * (3 - 2 * value)
let frame = 0

function paintStory() {
  frame = 0
  if (reducedMotion.matches) return
  const bounds = sequence.getBoundingClientRect()
  const progress = clamp(-bounds.top / Math.max(1, bounds.height - stage.clientHeight))
  const distance = ease(clamp((progress - .12) / .45))
  const rupture = ease(clamp((progress - .53) / .15))
  const wobble = Math.sin(progress * 58) * Math.sin(Math.PI * clamp(progress / .54)) * .065
  stage.style.setProperty('--scale', 1.12 - distance * .37)
  film.style.setProperty('--wobble', 1 + wobble)
  film.style.setProperty('--hole', `${rupture * film.clientWidth * 1.3 - 2}px`)
  film.style.setProperty('--film-opacity', 1 - rupture * .75)

  sideClippings.forEach((clipping, index) => {
    const focus = ease(clamp((progress - .59 - index * .14) / .19))
    clipping.style.setProperty('--blur', `${12 * (1 - focus)}px`)
    clipping.style.setProperty('--visibility', .32 + focus * .68)
  })
}

function schedulePaint() {
  if (!frame) frame = requestAnimationFrame(paintStory)
}

addEventListener('scroll', schedulePaint, { passive: true })
addEventListener('resize', schedulePaint)
reducedMotion.addEventListener('change', schedulePaint)
schedulePaint()

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const plato = dialogue.querySelector('.plato')
  const mill = dialogue.querySelector('.mill')
  let platoReady = false
  let platoStarted = false
  let millInView = false
  let millStarted = false

  function startMill() {
    if (!platoReady || !millInView || millStarted) return
    millStarted = true
    mill.classList.add('arrived')
    setTimeout(() => dialogue.classList.add('responding'), 1900)
  }

  function startPlato() {
    if (platoStarted) return
    platoStarted = true
    plato.classList.add('arrived')
    setTimeout(() => {
      platoReady = true
      startMill()
    }, 1450)
  }

  dialogue.classList.add('animated-dialogue')
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === mill) {
        millInView = entry.isIntersecting
        if (millInView) startPlato()
        startMill()
      } else if (entry.isIntersecting) {
        startPlato()
        observer.unobserve(plato)
      }
    }
  }, { threshold: .18 })
  observer.observe(plato)
  observer.observe(mill)
}

const topics = [
  ['Нужен ли компаниям гибридный график?',
    'В эксперименте Trip.com гибридный режим снизил число увольнений без ухудшения оценок работы.',
    'В другой IT-компании при гибридном режиме сотрудники предлагали меньше идей.',
    ['Эксперимент Trip.com', 'https://www.nature.com/articles/s41586-024-07500-2'],
    ['Исследование рабочих режимов', 'https://www.nature.com/articles/s41598-024-67122-6']],
  ['Стоит ли поручать ИИ задачи разработчика?',
    'Если инструмент быстро справляется с рутинной задачей, разработчик может уделить больше времени проверке и проектированию.',
    'В эксперименте METR опытные разработчики на знакомых проектах работали медленнее с ИИ-инструментами начала 2025 года.',
    ['Исследование рынка труда', 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/2-jobs-outlook'],
    ['Эксперимент METR', 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/']],
  ['Показывать ли свежие посты первыми?',
    'Порядок по времени легко понять. В эксперименте пользователи такой ленты проводили меньше времени в Facebook и Instagram.',
    'Свежесть не гарантирует качество. В том же эксперименте хронологическая лента Facebook чаще показывала материалы из ненадёжных источников.',
    ['Эксперимент Facebook и Instagram', 'https://www.science.org/doi/10.1126/science.abp9364'],
    ['Исследование ленты X', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13061628/']]
]
const argument = document.querySelector('#argument')
let previous = -1

function drawTopic() {
  const choices = topics.filter((_, index) => index !== previous)
  const topic = choices[Math.floor(Math.random() * choices.length)]
  const [question, pro, con, ...sources] = topic
  previous = topics.indexOf(topic)
  argument.innerHTML = `<h3>${question}</h3><p><strong>За.</strong> ${pro}</p><p><strong>Против.</strong> ${con}</p>${
    sources.map(([label, url]) => `<a href="${url}">${label} ↗</a>`).join('')
  }`
}
document.querySelector('#draw').addEventListener('click', drawTopic)
drawTopic()
