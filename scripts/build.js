const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOGS_DIR = path.join(__dirname, '..', 'blogs');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_DIR = path.join(__dirname, '..', 'src');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function ensureDirectories() {
    await fs.mkdir(path.join(DIST_DIR, 'blogs'), { recursive: true });
    await fs.mkdir(path.join(DIST_DIR, 'assets'), { recursive: true });
}

async function copyStaticFiles() {
    // Copy HTML files
    const htmlFiles = ['index.html', 'blog.html', 'contact.html'];
    for (const file of htmlFiles) {
        try {
            const content = await fs.readFile(path.join(SRC_DIR, file), 'utf-8');
            await fs.writeFile(path.join(DIST_DIR, file), content);
        } catch (error) {
            console.log(`Skipping ${file}: not found`);
        }
    }

    // Copy CSS
    const cssContent = await fs.readFile(path.join(SRC_DIR, 'styles.css'), 'utf-8');
    await fs.writeFile(path.join(DIST_DIR, 'styles.css'), cssContent);

    // Copy JavaScript
    const jsContent = await fs.readFile(path.join(SRC_DIR, 'script.js'), 'utf-8');
    await fs.writeFile(path.join(DIST_DIR, 'script.js'), jsContent);

    // Copy assets if they exist
    try {
        const assets = await fs.readdir(ASSETS_DIR);
        for (const asset of assets) {
            const src = path.join(ASSETS_DIR, asset);
            const dest = path.join(DIST_DIR, 'assets', asset);
            await fs.copyFile(src, dest);
        }
    } catch (error) {
        console.log('No assets to copy or assets directory not found');
    }
}

async function generateBlogPosts() {
    const blogPosts = [];
    
    try {
        const files = await fs.readdir(BLOGS_DIR);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        for (const file of mdFiles) {
            const filePath = path.join(BLOGS_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const { attributes, body } = frontMatter(content);
            
            const slug = file.replace('.md', '');
            const htmlContent = marked(body);
            
            // Generate blog post HTML
            const blogHtml = generateBlogHTML({
                title: attributes.title || 'Untitled',
                date: attributes.date || new Date().toISOString(),
                content: htmlContent,
                author: attributes.author || 'Kushal Khandelwal'
            });
            
            await fs.writeFile(path.join(DIST_DIR, 'blogs', `${slug}.html`), blogHtml);
            
            // Add to blog posts array
            blogPosts.push({
                title: attributes.title || 'Untitled',
                date: attributes.date || new Date().toISOString(),
                excerpt: attributes.excerpt || body.substring(0, 150) + '...',
                slug: slug,
                author: attributes.author || 'Kushal Khandelwal'
            });
        }
        
        // Sort posts by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        console.log('No blog posts found or blogs directory not found');
    }
    
    // Write blog data JSON
    await fs.writeFile(
        path.join(DIST_DIR, 'blog-data.json'),
        JSON.stringify(blogPosts, null, 2)
    );
    
    return blogPosts;
}

function generateBlogHTML(post) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - Kushal Khandelwal</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <main class="container">
        <header>
            <nav>
                <a href="../index.html">Home</a>
                <a href="../blog.html">Blog</a>
                <a href="../contact.html">Contact</a>
                <a href="https://github.com/kushal124">GitHub</a>
                <a href="https://www.linkedin.com/in/kushal124/">LinkedIn</a>
                <a href="https://x.com/kushal124">Twitter</a>
            </nav>
        </header>

        <a href="../blog.html" class="back-link">← Back to Blog</a>

        <article>
            <h1 class="page-title">${post.title}</h1>
            <p class="blog-meta">${formatDate(post.date)}</p>

            <div class="blog-post-content">
                ${post.content}
            </div>
        </article>

        <hr>

        <footer>
            <div class="social-icons">
                <a href="https://x.com/kushal124" title="Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/kushal124/" title="LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
            </div>
            <p>&copy; 2025 Kushal Khandelwal</p>
        </footer>
    </main>
</body>
</html>`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

async function build() {
    console.log('Building static site...');
    
    try {
        await ensureDirectories();
        console.log('✓ Directories created');
        
        await copyStaticFiles();
        console.log('✓ Static files copied');
        
        const posts = await generateBlogPosts();
        console.log(`✓ Generated ${posts.length} blog posts`);
        
        console.log('\nBuild complete! Site generated in ./dist');
        console.log('Run "npm run serve" to preview the site');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();