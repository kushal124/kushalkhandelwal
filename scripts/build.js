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
                <a href="https://github.com/kushalkhandelwal">GitHub</a>
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