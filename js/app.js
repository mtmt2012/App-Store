new Vue({
    el: '#app',
    data: {
        isLoggedIn: false,
        showLoginModal: false,
        loginForm: {
            username: '',
            password: ''
        },
        loginError: '',
        
        searchQuery: '',
        currentCategory: '全部',
        apps: [],
        categories: [],
        showAddModal: false,
        showEditModal: false,
        showCategoryModal: false,
        showPreviewModal: false,
        previewContent: '',
        newCategory: '',
        categoryError: '',
        form: {
            id: null,
            name: '',
            category: '其他',
            icon: '',
            downloadUrl: '',
            iconPreviewError: false
        }
    },
    computed: {
        filteredApps() {
            let result = this.apps;
            if (this.currentCategory !== '全部') {
                result = result.filter(app => app.category === this.currentCategory);
            }
            if (this.searchQuery.trim() !== '') {
                const q = this.searchQuery.trim().toLowerCase();
                result = result.filter(app =>
                    app.name.toLowerCase().includes(q) ||
                    app.category.includes(q)
                );
            }
            return result;
        }
    },
    created() {
        const savedLogin = sessionStorage.getItem('storeLoggedIn');
        if (savedLogin === 'true') {
            this.isLoggedIn = true;
        }
        
        const savedCategories = localStorage.getItem('storeCategories');
        if (savedCategories) {
            try {
                this.categories = JSON.parse(savedCategories);
            } catch (e) {
                this.categories = JSON.parse(JSON.stringify(defaultCategories));
            }
        } else {
            this.categories = JSON.parse(JSON.stringify(defaultCategories));
        }
        
        const saved = localStorage.getItem('storeApps');
        if (saved) {
            try {
                this.apps = JSON.parse(saved);
            } catch (e) {
                this.apps = JSON.parse(JSON.stringify(defaultApps));
            }
        } else {
            this.apps = JSON.parse(JSON.stringify(defaultApps));
        }
    },
    methods: {
        handleImageError(event, app) {
            event.target.style.display = 'none';
            const parent = event.target.parentElement;
            const oldPlaceholder = parent.querySelector('.icon-placeholder');
            if (oldPlaceholder) oldPlaceholder.remove();
            const placeholder = document.createElement('span');
            placeholder.className = 'icon-placeholder';
            placeholder.textContent = app.name ? app.name.charAt(0) : '📦';
            parent.appendChild(placeholder);
        },
        
        exportData() {
            const dataContent = `// 默认分类
var defaultCategories = ${JSON.stringify(this.categories, null, 4)};

// 默认应用数据 - 从浏览器导出
var defaultApps = ${JSON.stringify(this.apps, null, 4)};`;
            
            this.previewContent = dataContent;
            this.showPreviewModal = true;
        },
        
        copyData() {
            const textarea = document.getElementById('previewText');
            if (!textarea) return;
            
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            
            try {
                document.execCommand('copy');
                alert('✅ 已复制到剪贴板！');
            } catch (e) {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    alert('✅ 已复制到剪贴板！');
                }).catch(() => {
                    alert('❌ 复制失败，请手动选中复制');
                });
            }
        },
        
        addCategory() {
            const name = this.newCategory.trim();
            if (!name) {
                this.categoryError = '请输入分类名称';
                return;
            }
            if (this.categories.includes(name)) {
                this.categoryError = '分类已存在';
                return;
            }
            this.categories.push(name);
            this.saveCategoriesToLocal();
            this.showCategoryModal = false;
            this.newCategory = '';
            this.categoryError = '';
        },
        
        moveCategory(index, direction) {
            const newIndex = direction === 'left' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= this.categories.length) return;
            
            const temp = this.categories[index];
            this.categories[index] = this.categories[newIndex];
            this.categories[newIndex] = temp;
            
            this.saveCategoriesToLocal();
        },
        
        saveCategoriesToLocal() {
            localStorage.setItem('storeCategories', JSON.stringify(this.categories));
        },
        
        handleLogin() {
            if (this.loginForm.username === 'admin' && 
                this.loginForm.password === '201203102438gtGT') {
                this.isLoggedIn = true;
                this.loginError = '';
                this.showLoginModal = false;
                sessionStorage.setItem('storeLoggedIn', 'true');
                this.loginForm.username = '';
                this.loginForm.password = '';
            } else {
                this.loginError = '用户名或密码错误，请重试';
                this.loginForm.password = '';
            }
        },
        
        logout() {
            if (confirm('确定要退出登录吗？')) {
                this.isLoggedIn = false;
                this.showLoginModal = false;
                sessionStorage.removeItem('storeLoggedIn');
            }
        },
        
        filterApps() {},
        
        setCategory(cat) {
            this.currentCategory = cat;
        },
        
        saveToLocal() {
            localStorage.setItem('storeApps', JSON.stringify(this.apps));
        },
        
        addApp() {
            if (!this.form.name.trim()) {
                alert('请输入软件名称');
                return;
            }
            if (!this.form.downloadUrl.trim()) {
                alert('请输入官网下载链接');
                return;
            }
            const newApp = {
                id: Date.now(),
                name: this.form.name.trim(),
                category: this.form.category,
                icon: this.form.icon || 'https://cdn.jsdelivr.net/npm/simple-icons@v12/icons/default.svg',
                downloadUrl: this.form.downloadUrl.trim()
            };
            this.apps.push(newApp);
            this.saveToLocal();
            this.closeModal();
        },
        
        editApp(app) {
            this.form = {
                id: app.id,
                name: app.name,
                category: app.category,
                icon: app.icon,
                downloadUrl: app.downloadUrl,
                iconPreviewError: false
            };
            this.showEditModal = true;
        },
        
        updateApp() {
            if (!this.form.name.trim()) {
                alert('请输入软件名称');
                return;
            }
            if (!this.form.downloadUrl.trim()) {
                alert('请输入官网下载链接');
                return;
            }
            const index = this.apps.findIndex(app => app.id === this.form.id);
            if (index !== -1) {
                this.apps[index] = {
                    id: this.form.id,
                    name: this.form.name.trim(),
                    category: this.form.category,
                    icon: this.form.icon || 'https://cdn.jsdelivr.net/npm/simple-icons@v12/icons/default.svg',
                    downloadUrl: this.form.downloadUrl.trim()
                };
                this.saveToLocal();
                this.closeModal();
            }
        },
        
        deleteApp(id) {
            if (confirm('确定要删除这个软件吗？')) {
                this.apps = this.apps.filter(app => app.id !== id);
                this.saveToLocal();
            }
        },
        
        saveApp() {
            if (this.showEditModal) {
                this.updateApp();
            } else {
                this.addApp();
            }
        },
        
        closeModal() {
            this.showAddModal = false;
            this.showEditModal = false;
            this.form = {
                id: null,
                name: '',
                category: '其他',
                icon: '',
                downloadUrl: '',
                iconPreviewError: false
            };
        }
    }
});