import re

with open('timeline.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <style>
style_start = content.find('<style>')
style_end = content.find('</style>') + 8
new_style = """<style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fafafa; }
        .ig-gradient { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
        .like-icon.liked { fill: #ef4444; color: #ef4444; }
        
        /* Gallery Grid Styles */
        .gallery-item {
            position: relative;
            aspect-ratio: 1 / 1;
            overflow: hidden;
            background-color: #f1f5f9;
            cursor: pointer;
        }
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .gallery-item:hover img {
            transform: scale(1.05);
        }
        .gallery-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            color: white;
            font-weight: 600;
        }
        .gallery-item:hover .gallery-overlay {
            opacity: 1;
        }
        
        /* Lightbox Styles */
        .lightbox {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            align-items: center;
            justify-content: center;
        }
        .lightbox.active {
            display: flex;
            opacity: 1;
        }
        .lightbox-content {
            background: white;
            width: 100%;
            max-width: 900px;
            height: 90vh;
            max-height: 600px;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        @media (min-width: 768px) {
            .lightbox-content {
                flex-direction: row;
            }
        }
        .lightbox-img-container {
            flex: 1;
            background: black;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .lightbox-img-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .lightbox-sidebar {
            width: 100%;
            background: white;
            display: flex;
            flex-direction: column;
        }
        @media (min-width: 768px) {
            .lightbox-sidebar {
                width: 350px;
                border-left: 1px solid #e5e7eb;
            }
        }
        .lightbox-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            color: white;
            cursor: pointer;
            z-index: 101;
        }
        .upload-section {
            background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
    </style>"""
content = content[:style_start] + new_style + content[style_end:]

# Replace Main Feed
main_start = content.find('<!-- Main Feed -->')
main_end = content.find('</main>') + 7
new_main = """<!-- Main Feed -->
<main class="pt-20 px-0 sm:px-4 max-w-4xl mx-auto pb-20">
    
    <!-- Profile Header -->
    <div class="flex items-center gap-6 mb-10 px-4 sm:px-0 max-w-[470px] mx-auto md:max-w-full">
        <div class="w-20 h-20 md:w-28 md:h-28 rounded-full p-1 ig-gradient shrink-0">
            <img src="assets/img/profile.png" alt="Dipak" class="w-full h-full rounded-full border-2 border-white object-cover">
        </div>
        <div>
            <h1 class="font-bold text-xl md:text-2xl leading-tight mb-1">dipakkadamb</h1>
            <p class="text-sm md:text-base text-slate-500 font-medium">AI Web Developer & Zoho Specialist</p>
            <p class="text-sm mt-1">Pune, India 📍</p>
        </div>
    </div>

    <!-- Upload Section -->
    <div class="upload-section mx-4 sm:mx-0 max-w-[470px] md:max-w-full mx-auto md:mx-0">
        <h2 class="text-lg font-semibold mb-3">Upload to Gallery</h2>
        <textarea id="new-post-content" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition" placeholder="Write a caption for your photo..."></textarea>
        
        <div id="image-preview-container" class="hidden mt-3 relative w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
            <img id="image-preview" class="w-full h-auto object-contain max-h-64">
            <button onclick="removeImage()" class="absolute top-2 right-2 p-1.5 bg-slate-900/50 rounded-full text-white hover:bg-slate-900/70 transition"><i data-feather="x" class="w-4 h-4"></i></button>
        </div>
        
        <div class="flex justify-between items-center mt-4">
            <label for="new-post-image" class="cursor-pointer text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-blue-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm">
                <i data-feather="image" class="w-4 h-4"></i> Select Photo
            </label>
            <input type="file" id="new-post-image" accept="image/*" class="hidden" onchange="previewImage(event)">
            <button onclick="createNewPost()" class="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg">Upload</button>
        </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-6 max-w-[470px] md:max-w-full mx-auto flex justify-center">
        <div class="flex items-center gap-2 -mt-[1px] border-t border-slate-900 pt-3 px-2">
            <i data-feather="grid" class="w-4 h-4 text-slate-900"></i>
            <span class="text-xs font-semibold text-slate-900 uppercase tracking-widest">Gallery</span>
        </div>
    </div>

    <!-- Gallery Grid -->
    <div id="gallery-grid" class="grid grid-cols-3 gap-1 md:gap-4 md:px-0"></div>

</main>

<!-- Lightbox Modal -->
<div id="lightbox" class="lightbox" onclick="if(event.target === this) closeLightbox()">
    <div class="lightbox-close" onclick="closeLightbox()"><i data-feather="x" class="w-8 h-8"></i></div>
    <div class="lightbox-content m-4">
        <!-- Left: Image -->
        <div class="lightbox-img-container">
            <img id="lb-image" src="" alt="Gallery Image">
            <div id="lb-text-placeholder" class="hidden px-8 py-12 text-center text-white text-xl font-medium w-full h-full flex items-center justify-center bg-slate-800"></div>
        </div>
        <!-- Right: Info -->
        <div class="lightbox-sidebar flex flex-col h-full">
            <!-- Header -->
            <div class="flex items-center p-4 border-b border-gray-100 shrink-0">
                <div class="w-8 h-8 rounded-full p-[1px] ig-gradient mr-3">
                    <img src="assets/img/profile.png" class="w-full h-full rounded-full border border-white object-cover">
                </div>
                <div class="font-semibold text-sm">dipakkadamb</div>
            </div>
            <!-- Scrollable Content -->
            <div class="p-4 flex-1 overflow-y-auto" style="scrollbar-width: thin;">
                <!-- Caption -->
                <div class="flex gap-3 mb-4">
                    <div class="w-8 h-8 rounded-full shrink-0 overflow-hidden"><img src="assets/img/profile.png" class="w-full h-full object-cover"></div>
                    <div>
                        <span class="font-semibold text-sm mr-1">dipakkadamb</span>
                        <span id="lb-caption" class="text-sm text-slate-800 leading-snug"></span>
                        <div id="lb-date" class="text-[10px] text-gray-400 uppercase tracking-wide mt-2"></div>
                    </div>
                </div>
                <!-- Comments Section -->
                <div id="lb-comments" class="space-y-3 mt-4"></div>
            </div>
            <!-- Actions -->
            <div class="p-4 border-t border-gray-100 shrink-0">
                <div class="flex items-center gap-4 mb-3">
                    <button onclick="toggleLike(this)"><i data-feather="heart" class="w-6 h-6 hover:text-gray-500 transform transition active:scale-75 like-icon"></i></button>
                    <button><i data-feather="message-circle" class="w-6 h-6 hover:text-gray-500"></i></button>
                    <button onclick="shareLink()"><i data-feather="send" class="w-6 h-6 hover:text-gray-500"></i></button>
                </div>
                <div class="font-semibold text-sm mb-1">Liked by many</div>
            </div>
            <!-- Add Comment -->
            <div class="px-4 py-3 border-t border-gray-100 flex items-center gap-3 shrink-0">
                <i data-feather="smile" class="w-5 h-5 text-gray-400"></i>
                <input type="text" id="lb-comment-input" placeholder="Add a comment..." class="flex-1 text-sm outline-none bg-transparent" onkeydown="if(event.key === 'Enter') postLightboxComment()">
                <button onclick="postLightboxComment()" class="text-blue-500 text-sm font-semibold opacity-70 hover:opacity-100">Post</button>
            </div>
        </div>
    </div>
</div>"""
content = content[:main_start] + new_main + content[main_end:]

# Replace Script
script_start = content.find('<script>')
script_end = content.find('</script>', script_start) + 9
new_script = """<script>
    feather.replace();

    const POSTS_KEY = 'timeline_user_posts';
    const COMMENTS_KEY = 'timeline_comments';

    // Default post
    const defaultPost = {
        id: 'default-post',
        text: '"AI is not a substitute for human intelligence; it is a tool to amplify human creativity and ingenuity." — Fei-Fei Li',
        image: null,
        date: new Date().toISOString()
    };

    let customPosts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || { 'default-post': [] };
    
    let currentLightboxPostId = null;

    document.addEventListener("DOMContentLoaded", () => {
        renderGallery();
    });

    let selectedImageBase64 = null;

    function previewImage(event) {
        const file = event.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageBase64 = e.target.result;
            const container = document.getElementById('image-preview-container');
            const preview = document.getElementById('image-preview');
            preview.src = selectedImageBase64;
            container.classList.remove('hidden');
            if(window.feather) feather.replace();
        };
        reader.readAsDataURL(file);
    }

    function removeImage() {
        selectedImageBase64 = null;
        document.getElementById('new-post-image').value = '';
        const container = document.getElementById('image-preview-container');
        const preview = document.getElementById('image-preview');
        preview.src = '';
        container.classList.add('hidden');
    }

    function createNewPost() {
        const contentInput = document.getElementById('new-post-content');
        const text = contentInput.value.trim();
        
        if (!text && !selectedImageBase64) return;

        const newPost = {
            id: 'post-' + Date.now(),
            text: text,
            image: selectedImageBase64,
            date: new Date().toISOString()
        };

        customPosts.unshift(newPost);
        localStorage.setItem(POSTS_KEY, JSON.stringify(customPosts));
        
        contentInput.value = '';
        removeImage();
        renderGallery();
    }

    function getAllPosts() {
        return [...customPosts, defaultPost];
    }

    function renderGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const allPosts = getAllPosts();
        
        allPosts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.onclick = () => openLightbox(post.id);
            
            const commentsCount = (comments[post.id] || []).length;
            
            if (post.image) {
                div.innerHTML = `
                    <img src="${post.image}" alt="Gallery Post" loading="lazy">
                    <div class="gallery-overlay">
                        <span class="flex items-center gap-1"><i data-feather="heart" class="w-5 h-5 fill-white"></i> 0</span>
                        <span class="flex items-center gap-1"><i data-feather="message-circle" class="w-5 h-5 fill-white"></i> ${commentsCount}</span>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center">
                        <i data-feather="terminal" class="w-8 h-8 text-cyan-400"></i>
                    </div>
                    <div class="gallery-overlay">
                        <span class="flex items-center gap-1"><i data-feather="heart" class="w-5 h-5 fill-white"></i> 0</span>
                        <span class="flex items-center gap-1"><i data-feather="message-circle" class="w-5 h-5 fill-white"></i> ${commentsCount}</span>
                    </div>
                `;
            }
            grid.appendChild(div);
        });
        
        if(window.feather) feather.replace();
    }

    function openLightbox(postId) {
        currentLightboxPostId = postId;
        const post = getAllPosts().find(p => p.id === postId);
        if(!post) return;
        
        const lbImg = document.getElementById('lb-image');
        const lbTextPlaceholder = document.getElementById('lb-text-placeholder');
        
        if(post.image) {
            lbImg.src = post.image;
            lbImg.classList.remove('hidden');
            lbTextPlaceholder.classList.add('hidden');
        } else {
            lbImg.classList.add('hidden');
            lbTextPlaceholder.textContent = post.text;
            lbTextPlaceholder.classList.remove('hidden');
        }
        
        document.getElementById('lb-caption').innerHTML = post.text ? post.text.replace(/\\n/g, '<br>') : '';
        document.getElementById('lb-date').textContent = new Date(post.date).toLocaleDateString() + ' ' + new Date(post.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        renderLightboxComments();
        
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
        currentLightboxPostId = null;
    }

    function renderLightboxComments() {
        const container = document.getElementById('lb-comments');
        container.innerHTML = '';
        const postComments = comments[currentLightboxPostId] || [];
        
        postComments.forEach(c => {
            container.innerHTML += `
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">U</div>
                    <div>
                        <span class="font-semibold text-sm mr-1">${c.user}</span>
                        <span class="text-sm text-slate-800 leading-snug">${c.text}</span>
                    </div>
                </div>
            `;
        });
    }

    function postLightboxComment() {
        if(!currentLightboxPostId) return;
        
        const input = document.getElementById('lb-comment-input');
        const text = input.value.trim();
        if (!text) return;

        if (!comments[currentLightboxPostId]) {
            comments[currentLightboxPostId] = [];
        }
        
        comments[currentLightboxPostId].push({
            user: 'guest_user',
            text: text
        });

        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
        input.value = '';
        
        renderLightboxComments();
        renderGallery(); // Update comment count in grid
    }

    function toggleLike(btn) {
        const icon = btn.querySelector('.like-icon');
        icon.classList.toggle('liked');
        if(icon.classList.contains('liked')) {
            icon.style.fill = '#ef4444';
            icon.style.color = '#ef4444';
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => icon.style.transform = 'scale(1)', 150);
        } else {
            icon.style.fill = 'none';
            icon.style.color = 'currentColor';
        }
    }

    function shareLink() {
        if (navigator.share) {
            navigator.share({ title: 'Dipak Kadamb Portfolio', url: window.location.href });
        } else {
            alert('Share functionality unavailable');
        }
    }
</script>"""
content = content[:script_start] + new_script + content[script_end:]

with open('timeline.html', 'w', encoding='utf-8') as f:
    f.write(content)
