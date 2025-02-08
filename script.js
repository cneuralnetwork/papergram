const container = document.getElementById('container');
const favoritesPanel = document.getElementById('favoritesPanel');
const favoritesList = document.getElementById('favoritesList');
const favoritesToggle = document.getElementById('favoritesToggle');

let currentIndex = 0;
let papers = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let startIndex = 0;
let isLoading = false;

favoritesToggle.addEventListener('click', () => {
    favoritesPanel.classList.toggle('show');
});

function updateFavoritesList() {
    favoritesList.innerHTML = '';
    favorites.forEach((paper) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${paper.title}</div>
                    <div style="font-size: 0.8rem; color: var(--secondary-text);">${paper.authors}</div>
                `;
        item.addEventListener('click', () => {
            window.open(paper.link, '_blank');
        });
        favoritesList.appendChild(item);
    });
}

function toggleFavorite(paper, button) {
    const index = favorites.findIndex(f => f.title === paper.title);

    if (index === -1) {
        favorites.push(paper);
        button.classList.add('liked');
        button.textContent = '❤️';
    } else {
        favorites.splice(index, 1);
        button.classList.remove('liked');
        button.textContent = '🤍';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesList();
}

async function fetchPapers(start = 0) {
    if (isLoading) return;
    isLoading = true;

    try {
        const query = 'cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.CV+OR+cat:stat.ML';
        const response = await fetch(
            `https://export.arxiv.org/api/query?search_query=${query}&start=${start}&max_results=10&sortBy=submittedDate&sortOrder=descending`
        );
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const entries = xmlDoc.getElementsByTagName('entry');

        const newPapers = Array.from(entries).map(entry => ({
            title: entry.getElementsByTagName('title')[0].textContent,
            authors: Array.from(entry.getElementsByTagName('author'))
                .map(author => author.getElementsByTagName('name')[0].textContent)
                .join(', '),
            abstract: entry.getElementsByTagName('summary')[0].textContent,
            published: new Date(entry.getElementsByTagName('published')[0].textContent)
                .toLocaleDateString(),
            link: entry.getElementsByTagName('id')[0].textContent
        }));

        papers = [...papers, ...newPapers];
        startIndex += newPapers.length;

        renderPapers();
        updateFavoritesList();
    } catch (error) {
        console.error('Error fetching papers:', error);
    } finally {
        isLoading = false;
    }
}

function renderLatex(element) {
    renderMathInElement(element, {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        output: 'html'
    });
}

function highlightKeywords(text) {
    const keywords = [
        'neural network', 'deep learning', 'transformer', 'attention mechanism',
        'state-of-the-art', 'performance', 'accuracy', 'efficiency',
        'novel', 'framework', 'architecture', 'significantly'
    ];

    let highlightedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
    });
    return highlightedText;
}

function boldHighlightText(text) {
    const importantPhrases = [
        'outperforms', 'state-of-the-art', 'novel', 'breakthrough',
        'significant improvement', 'better than', 'achieves',
        'first time', 'innovative', 'superior', 'advancement',
        'key findings', 'main contributions', 'results show'
    ];

    let highlightedText = text;
    importantPhrases.forEach(phrase => {
        const regex = new RegExp(`(${phrase})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="bold-highlight">$1</span>');
    });
    return highlightedText;
}

function generateDiagram(paper) {
    const abstract = paper.abstract.toLowerCase();
    let diagramType = null;

    if (abstract.includes('neural network') || abstract.includes('deep learning')) {
        diagramType = 'network';
    } else if (abstract.includes('transformer') || abstract.includes('attention')) {
        diagramType = 'transformer';
    } else if (abstract.includes('algorithm') || abstract.includes('pipeline')) {
        diagramType = 'flowchart';
    }

    return diagramType ? getDiagramSVG(diagramType) : '';
}

function getDiagramSVG(type) {
    const diagrams = {
        network: `
                    <div class="diagram-container">
                        <svg viewBox="0 0 200 100">
                            <circle cx="30" cy="30" r="5" fill="#64ffda"/>
                            <circle cx="30" cy="70" r="5" fill="#64ffda"/>
                            <circle cx="100" cy="20" r="5" fill="#64ffda"/>
                            <circle cx="100" cy="50" r="5" fill="#64ffda"/>
                            <circle cx="100" cy="80" r="5" fill="#64ffda"/>
                            <circle cx="170" cy="50" r="5" fill="#64ffda"/>
                            <!-- Connections -->
                            <path d="M30,30 C60,30 70,20 100,20" stroke="#64ffda" fill="none"/>
                            <path d="M30,30 C60,30 70,50 100,50" stroke="#64ffda" fill="none"/>
                            <path d="M30,70 C60,70 70,50 100,50" stroke="#64ffda" fill="none"/>
                            <path d="M30,70 C60,70 70,80 100,80" stroke="#64ffda" fill="none"/>
                            <path d="M100,20 C130,20 140,50 170,50" stroke="#64ffda" fill="none"/>
                            <path d="M100,50 C130,50 140,50 170,50" stroke="#64ffda" fill="none"/>
                            <path d="M100,80 C130,80 140,50 170,50" stroke="#64ffda" fill="none"/>
                        </svg>
                        <div class="media-caption">Neural Network Architecture</div>
                    </div>
                `,
        transformer: `
                    <div class="diagram-container">
                        <svg viewBox="0 0 200 120">
                            <rect x="40" y="20" width="40" height="80" fill="none" stroke="#64ffda" rx="4"/>
                            <rect x="120" y="20" width="40" height="80" fill="none" stroke="#64ffda" rx="4"/>
                            <path d="M80,60 C90,60 110,60 120,60" stroke="#64ffda" fill="none" marker-end="url(#arrow)"/>
                            <text x="100" y="55" fill="#64ffda" text-anchor="middle" font-size="8">Attention</text>
                            <text x="60" y="70" fill="#64ffda" text-anchor="middle" font-size="8">Encoder</text>
                            <text x="140" y="70" fill="#64ffda" text-anchor="middle" font-size="8">Decoder</text>
                        </svg>
                        <div class="media-caption">Transformer Architecture</div>
                    </div>
                `,
        flowchart: `
                    <div class="diagram-container">
                        <svg viewBox="0 0 200 120">
                            <rect x="60" y="10" width="80" height="25" rx="5" fill="none" stroke="#64ffda"/>
                            <rect x="60" y="50" width="80" height="25" rx="5" fill="none" stroke="#64ffda"/>
                            <rect x="60" y="90" width="80" height="25" rx="5" fill="none" stroke="#64ffda"/>
                            <line x1="100" y1="35" x2="100" y2="50" stroke="#64ffda" stroke-width="2" marker-end="url(#arrow)"/>
                            <line x1="100" y1="75" x2="100" y2="90" stroke="#64ffda" stroke-width="2" marker-end="url(#arrow)"/>
                        </svg>
                        <div class="media-caption">Algorithm Pipeline</div>
                    </div>
                `
    };
    return diagrams[type] || '';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function sharePaper(platform, paper) {
    const title = paper.title;
    const url = paper.link;

    switch (platform) {
        case 'twitter':
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                '_blank'
            );
            break;
        case 'linkedin':
            window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                '_blank'
            );
            break;
        case 'copy':
            navigator.clipboard.writeText(`${title}\n${url}`);
            showToast('Link copied to clipboard!');
            break;
    }
}

function renderPapers() {
    container.innerHTML = '';
    papers.forEach((paper, index) => {
        const paperCard = document.createElement('div');
        paperCard.className = 'paper-card';
        if (index === currentIndex) paperCard.classList.add('active');

        const isLiked = favorites.some(f => f.title === paper.title);
        const keyResults = extractKeyResults(paper.abstract);

        paperCard.innerHTML = `
                    <div class="paper-content">
                        <div class="share-container">
                            <button class="share-btn twitter-share" title="Share on Twitter">
                                <i class="fab fa-twitter"></i>
                            </button>
                            <button class="share-btn linkedin-share" title="Share on LinkedIn">
                                <i class="fab fa-linkedin-in"></i>
                            </button>
                            <button class="share-btn copy-link" title="Copy Link">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                        <div class="paper-header">
                            <h2 class="title">${paper.title}</h2>
<div class="authors">${paper.authors.split(', ').length > 4 ? paper.authors.split(', ').slice(0, 4).join(', ') + ', et al.' : paper.authors}</div>

                        </div>
                        <div class="key-results">
                            ${keyResults.map(result => `
                                <div class="result-item">
                                    <span class="result-icon">🔍</span>
                                    <span>${result}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p class="abstract">${paper.abstract.length > 400 ? paper.abstract.substring(0, 400) + '...' : paper.abstract}</p>
                        <div class="metadata">
                            <span>${paper.published}</span>
                            <button class="like-button ${isLiked ? 'liked' : ''}">${isLiked ? '❤️' : '🤍'}</button>
                            <a href="${paper.link}" target="_blank" class="read-more">Read More</a>
                        </div>
                    </div>
                `;

        const twitterBtn = paperCard.querySelector('.twitter-share');
        const linkedinBtn = paperCard.querySelector('.linkedin-share');
        const copyBtn = paperCard.querySelector('.copy-link');
        const likeButton = paperCard.querySelector('.like-button');

        twitterBtn.addEventListener('click', () => sharePaper('twitter', paper));
        linkedinBtn.addEventListener('click', () => sharePaper('linkedin', paper));
        copyBtn.addEventListener('click', () => sharePaper('copy', paper));
        likeButton.addEventListener('click', () => toggleFavorite(paper, likeButton));

        container.appendChild(paperCard);
        renderLatex(paperCard);
    });
}

function extractKeyResults(abstract) {
    const results = [];
    const sentences = abstract.split(/[.!?]+/);

    const keyPhrases = [
        'propose', 'present', 'introduce',
        'achieve', 'show', 'demonstrate',
        'improve', 'outperform', 'better',
        'novel', 'new', 'first'
    ];

    sentences.forEach(sentence => {
        if (results.length < 3 &&
            keyPhrases.some(phrase => sentence.toLowerCase().includes(phrase))) {
            results.push(sentence.trim());
        }
    });
    if (results.length === 0) {
        results.push(sentences[0].trim());
    }

    return results;
}

function createCatchyTitle(originalTitle) {
    return originalTitle
        .replace(/A Novel Approach to|On the|Towards|An Analysis of/gi, '')
        .replace(/Using|Via|Through/gi, 'with')
        .trim();
}

function generatePaperMedia(paper) {
    if (paper.abstract.includes('neural network') || paper.abstract.includes('deep learning')) {
        return `
                    <div class="paper-media">
                        <img src="https://via.placeholder.com/600x300/1a1b2e/64ffda?text=Neural+Network+Architecture" alt="Paper visualization">
                        <div class="media-caption">Model Architecture Visualization</div>
                    </div>
                `;
    }
    return '';
}

function handleScroll() {
    const cards = document.querySelectorAll('.paper-card');
    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (Math.abs(rect.top - 60) < window.innerHeight / 2) {
            card.classList.add('active');
            currentIndex = index;
        } else {
            card.classList.remove('active');
        }
    });

    const lastCard = cards[cards.length - 1];
    if (lastCard) {
        const rect = lastCard.getBoundingClientRect();
        if (rect.bottom <= window.innerHeight * 1.5) {
            fetchPapers(startIndex);
        }
    }
}

function scrollToIndex(index) {
    const cards = document.querySelectorAll('.paper-card');
    if (index >= 0 && index < cards.length) {
        cards[index].scrollIntoView({ behavior: 'smooth' });
    }
}

container.addEventListener('scroll', handleScroll);

let touchStartY = 0;
let touchEndY = 0;

container.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

container.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    const threshold = 50; // minimum distance for swipe

    if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
            scrollToIndex(currentIndex + 1);
        } else {
            scrollToIndex(currentIndex - 1);
        }
    }
}

fetchPapers();