document.addEventListener('DOMContentLoaded', loadBlogPosts);

async function loadBlogPosts() {
    try {
        const response = await fetch('blog-data.json');
        const posts = await response.json();
        displayBlogPosts(posts);
    } catch (error) {
        displayNoBlogPosts();
    }
}

function displayBlogPosts(posts) {
    const container = document.getElementById('blog-posts');

    if (posts.length === 0) {
        displayNoBlogPosts();
        return;
    }

    posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'blog-item';
        item.innerHTML = `<a href="blogs/${post.slug}.html">${post.title}</a><span class="date">${formatDate(post.date)}</span>`;
        container.appendChild(item);
    });
}

function displayNoBlogPosts() {
    const container = document.getElementById('blog-posts');
    container.innerHTML = '<p class="no-posts">No posts yet.</p>';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
