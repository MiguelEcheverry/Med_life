// ===== Botón de like (toggle) =====
// Un like por navegador, guardado en localStorage (mismo criterio que el carrito de Farmacia)
const LIKES_KEY = 'medlife_blog_likes';

function getLikes() {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLikes(likes) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

document.querySelectorAll('.like-btn').forEach(btn => {
  const postId = btn.dataset.post;
  const countEl = btn.querySelector('.like-count');
  const likedAlready = getLikes().includes(postId);

  if (likedAlready) {
    btn.classList.add('liked');
    countEl.textContent = '1';
  }

  btn.addEventListener('click', () => {
    let likes = getLikes();
    const isLiked = likes.includes(postId);

    if (isLiked) {
      likes = likes.filter(id => id !== postId);
      btn.classList.remove('liked');
      countEl.textContent = '0';
    } else {
      likes.push(postId);
      btn.classList.add('liked');
      countEl.textContent = '1';
    }

    saveLikes(likes);
  });
});

// ===== Botón "Leer más" / "Leer menos" en los artículos nuevos =====
document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetArticle = document.getElementById(btn.dataset.target);
    if (!targetArticle) return;

    const fullText = targetArticle.querySelector('.mini-full');
    const isHidden = fullText.classList.contains('hidden');

    fullText.classList.toggle('hidden');
    btn.textContent = isHidden ? 'Leer menos' : 'Leer más';
  });
});