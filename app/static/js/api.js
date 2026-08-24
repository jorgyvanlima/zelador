const API_BASE = '/api/v1';

const api = {
    getToken() {
        return localStorage.getItem('zelador_token');
    },

    setToken(token) {
        localStorage.setItem('zelador_token', token);
    },

    logout() {
        localStorage.removeItem('zelador_token');
        window.location.href = '/login';
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token && !options.noAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Se for FormData (ex: login com OAuth2PasswordRequestForm), não setar Content-Type
        if (options.body instanceof URLSearchParams) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const config = {
            ...options,
            headers
        };

        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada');
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Erro na requisição');
        }

        return data;
    },

    async login(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const data = await this.request('/auth/login', {
            method: 'POST',
            body: params,
            noAuth: true
        });
        
        this.setToken(data.access_token);
        return data;
    },

    async getMe() {
        return this.request('/users/me');
    },

    async getDepartments() {
        return this.request('/departments/');
    },

    async getActiveVisits() {
        return this.request('/visits/active');
    },

    async getVisitorByDoc(docNumber) {
        try {
            return await this.request(`/visitors/${docNumber}`);
        } catch (e) {
            return null; // Não achou
        }
    },

    async createVisitor(visitorData) {
        return this.request('/visitors/', {
            method: 'POST',
            body: JSON.stringify(visitorData)
        });
    },

    async checkIn(visitData) {
        return this.request('/visits/check-in', {
            method: 'POST',
            body: JSON.stringify(visitData)
        });
    },

    async checkOut(visitId) {
        return this.request(`/visits/${visitId}/check-out`, {
            method: 'POST'
        });
    }
};
