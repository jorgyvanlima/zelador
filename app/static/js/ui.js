document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Lógica de Login ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        if (api.getToken()) {
            window.location.href = '/dashboard';
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                await api.login(user, pass);
                window.location.href = '/dashboard';
            } catch (err) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = err.message;
            }
        });
    }

    // --- Lógica do Dashboard ---
    const dashboardBody = document.querySelector('.dashboard-body');
    let currentUser = null;

    if (dashboardBody) {
        if (!api.getToken()) {
            window.location.href = '/login';
            return;
        }

        try {
            currentUser = await api.getMe();
            document.getElementById('current-user').textContent = currentUser.username;
            document.getElementById('current-role').textContent = currentUser.role === 'ADMIN' ? 'Administrador' : 'Porteiro';
            
            // Controle de Acesso (Exibe menus admin)
            if (currentUser.role === 'ADMIN') {
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
            }

            await loadDepartments();
            await loadActiveVisits();

        } catch (err) {
            console.error(err);
            if(err.message === 'Sessão expirada') return;
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            api.logout();
        });

        // Navegação Lateral
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Update active link
                document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                // Update visible section
                document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
                const targetId = e.target.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');

                // Lazy load data based on tab
                if (targetId === 'departments-view') await loadAdminDepartments();
                if (targetId === 'users-view') await loadUsers();
            });
        });

        // ------------------------------------
        // Fluxo: Portaria
        // ------------------------------------
        const modalVisit = document.getElementById('modal-visit');
        if(document.getElementById('new-visit-btn')) {
            document.getElementById('new-visit-btn').addEventListener('click', () => modalVisit.style.display = 'flex');
        }
        if(document.getElementById('close-modal-visit-btn')) {
            document.getElementById('close-modal-visit-btn').addEventListener('click', () => {
                modalVisit.style.display = 'none';
                document.getElementById('new-visit-form').reset();
                document.getElementById('new-visitor-fields').style.display = 'none';
                currentVisitorId = null;
            });
        }

        const docInput = document.getElementById('doc_number');
        let currentVisitorId = null;

        if (docInput) {
            docInput.addEventListener('blur', async () => {
                const doc = docInput.value.trim();
                if (!doc) return;
                
                const visitor = await api.getVisitorByDoc(doc);
                const extraFields = document.getElementById('new-visitor-fields');
                
                if (visitor) {
                    extraFields.style.display = 'none';
                    currentVisitorId = visitor.id;
                    document.getElementById('full_name').removeAttribute('required');
                    alert(`Visitante encontrado: ${visitor.full_name}`);
                } else {
                    extraFields.style.display = 'block';
                    currentVisitorId = null;
                    document.getElementById('full_name').setAttribute('required', 'true');
                }
            });
        }

        const visitForm = document.getElementById('new-visit-form');
        if (visitForm) {
            visitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    if (!currentVisitorId) {
                        const newVisitor = await api.createVisitor({
                            document_number: docInput.value,
                            full_name: document.getElementById('full_name').value,
                            document_type: document.getElementById('doc_type').value,
                            email: null
                        });
                        currentVisitorId = newVisitor.id;
                    }

                    await api.checkIn({
                        visitor_id: currentVisitorId,
                        department_id: parseInt(document.getElementById('dept_id').value),
                        purpose: document.getElementById('purpose').value || null
                    });

                    alert('Entrada registrada com sucesso!');
                    modalVisit.style.display = 'none';
                    visitForm.reset();
                    currentVisitorId = null;
                    await loadActiveVisits();

                } catch (err) {
                    alert(`Erro: ${err.message}`);
                }
            });
        }

        // ------------------------------------
        // Fluxo: Gerenciar Setores (Admin)
        // ------------------------------------
        const modalDept = document.getElementById('modal-dept');
        const deptForm = document.getElementById('dept-form');
        
        if(document.getElementById('new-dept-btn')) {
            document.getElementById('new-dept-btn').addEventListener('click', () => {
                deptForm.reset();
                document.getElementById('dept_id_hidden').value = '';
                document.getElementById('dept-modal-title').textContent = 'Cadastrar Novo Setor';
                document.getElementById('dept-submit-btn').textContent = 'Criar Setor';
                modalDept.style.display = 'flex';
            });
        }
        if(document.getElementById('close-modal-dept-btn')) {
            document.getElementById('close-modal-dept-btn').addEventListener('click', () => modalDept.style.display = 'none');
        }

        if (deptForm) {
            deptForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const deptId = document.getElementById('dept_id_hidden').value;
                const data = {
                    name: document.getElementById('dept_name').value,
                    phone_extension: document.getElementById('dept_phone').value || null,
                    location: document.getElementById('dept_location').value || null,
                    is_active: true
                };

                try {
                    if (deptId) {
                        await api.updateDepartment(deptId, data);
                        alert('Setor atualizado com sucesso!');
                    } else {
                        await api.createDepartment(data);
                        alert('Setor criado com sucesso!');
                    }
                    modalDept.style.display = 'none';
                    deptForm.reset();
                    await loadAdminDepartments();
                    await loadDepartments(); // Refresh dropdown
                } catch (err) {
                    alert(`Erro: ${err.message}`);
                }
            });
        }

        // ------------------------------------
        // Fluxo: Gerenciar Usuários (Admin)
        // ------------------------------------
        const modalUser = document.getElementById('modal-user');
        const userForm = document.getElementById('user-form');
        
        if(document.getElementById('new-user-btn')) {
            document.getElementById('new-user-btn').addEventListener('click', () => {
                userForm.reset();
                document.getElementById('user_id_hidden').value = '';
                document.getElementById('user-modal-title').textContent = 'Cadastrar Usuário';
                document.getElementById('user-submit-btn').textContent = 'Criar Usuário';
                document.getElementById('user_pwd').setAttribute('required', 'true');
                document.getElementById('user_active_group').style.display = 'none';
                modalUser.style.display = 'flex';
            });
        }
        if(document.getElementById('close-modal-user-btn')) {
            document.getElementById('close-modal-user-btn').addEventListener('click', () => modalUser.style.display = 'none');
        }

        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userId = document.getElementById('user_id_hidden').value;
                const pwd = document.getElementById('user_pwd').value;
                const data = {
                    username: document.getElementById('user_name').value,
                    email: document.getElementById('user_email').value || null,
                    role: document.getElementById('user_role').value
                };
                
                if (pwd) data.password = pwd;

                try {
                    if (userId) {
                        data.is_active = document.getElementById('user_active').value === 'true';
                        await api.updateUser(userId, data);
                        alert('Usuário atualizado!');
                    } else {
                        data.is_active = true;
                        await api.createUser(data);
                        alert('Usuário criado com sucesso!');
                    }
                    modalUser.style.display = 'none';
                    userForm.reset();
                    await loadUsers();
                } catch (err) {
                    alert(`Erro: ${err.message}`);
                }
            });
        }
    }

    // Carregamento de Tabelas
    async function loadDepartments() {
        const select = document.getElementById('dept_id');
        if (!select) return;
        const depts = await api.getDepartments();
        select.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    async function loadAdminDepartments() {
        const tbody = document.getElementById('departments-list');
        if (!tbody) return;
        try {
            const depts = await api.getDepartments();
            window.currentDepartmentsData = depts; // Cache para edição
            tbody.innerHTML = depts.map(d => `
                <tr>
                    <td>${d.id}</td>
                    <td>${d.name}</td>
                    <td>${d.phone_extension || '-'}</td>
                    <td>${d.location || '-'}</td>
                    <td>
                        <button class="btn-outline" style="padding:4px 8px; font-size:12px; margin-right:5px;" onclick="editDepartment(${d.id})">✏️</button>
                        <button class="btn-outline" style="padding:4px 8px; font-size:12px; color:var(--error);" onclick="deleteDepartment(${d.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch(e) { console.error(e); }
    }

    async function loadUsers() {
        const tbody = document.getElementById('users-list');
        if (!tbody) return;
        try {
            const users = await api.getUsers();
            window.currentUsersData = users; // Cache para edição
            tbody.innerHTML = users.map(u => `
                <tr>
                    <td>${u.username}</td>
                    <td>${u.email || '-'}</td>
                    <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${u.role}</span></td>
                    <td>${u.is_active ? 'Ativo' : 'Inativo'}</td>
                    <td>
                        <button class="btn-outline" style="padding:4px 8px; font-size:12px; margin-right:5px;" onclick="editUser('${u.id}')">✏️</button>
                        <button class="btn-outline" style="padding:4px 8px; font-size:12px; color:var(--error);" onclick="deleteUser('${u.id}')">🗑️</button>
                    </td>
                </tr>
            `).join('');
        } catch(e) { console.error(e); }
    }

    async function loadActiveVisits() {
        const tbody = document.getElementById('active-visits-list');
        const countSpan = document.getElementById('active-count');
        if (!tbody) return;

        const visits = await api.getActiveVisits();
        countSpan.textContent = visits.length;

        if (visits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum visitante no local</td></tr>';
            return;
        }

        tbody.innerHTML = visits.map(v => {
            const time = new Date(v.entry_datetime).toLocaleTimeString();
            return `
                <tr>
                    <td>${v.visitor_id.split('-')[0]}...</td>
                    <td>${v.department_id}</td>
                    <td>${time}</td>
                    <td>
                        <button class="btn-outline" onclick="doCheckout('${v.id}')">Marcar Saída</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

});

// Função global
window.doCheckout = async function(visitId) {
    if (confirm('Confirmar saída deste visitante?')) {
        try {
            await api.checkOut(visitId);
            alert('Saída registrada!');
            // Recarrega a tabela de visitantes
            const evt = new Event('DOMContentLoaded');
            document.dispatchEvent(evt); // Trick para reload parcial ou apenas reload
            window.location.reload(); 
        } catch (err) {
            alert(`Erro ao fazer check-out: ${err.message}`);
        }
    }
}

window.editDepartment = function(id) {
    const dept = window.currentDepartmentsData.find(d => d.id === id);
    if (!dept) return;
    
    document.getElementById('dept-form').reset();
    document.getElementById('dept_id_hidden').value = dept.id;
    document.getElementById('dept_name').value = dept.name;
    document.getElementById('dept_phone').value = dept.phone_extension || '';
    document.getElementById('dept_location').value = dept.location || '';
    
    document.getElementById('dept-modal-title').textContent = 'Editar Setor';
    document.getElementById('dept-submit-btn').textContent = 'Salvar Alterações';
    document.getElementById('modal-dept').style.display = 'flex';
}

window.deleteDepartment = async function(id) {
    if (confirm('Tem certeza que deseja inativar este setor?')) {
        try {
            await api.deleteDepartment(id);
            alert('Setor inativado com sucesso!');
            window.location.reload();
        } catch(e) {
            alert('Erro: ' + e.message);
        }
    }
}

window.editUser = function(id) {
    const user = window.currentUsersData.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('user-form').reset();
    document.getElementById('user_id_hidden').value = user.id;
    document.getElementById('user_name').value = user.username;
    document.getElementById('user_email').value = user.email || '';
    document.getElementById('user_role').value = user.role;
    
    // Na edição, a senha não é obrigatória
    document.getElementById('user_pwd').removeAttribute('required');
    
    // Status do user
    document.getElementById('user_active_group').style.display = 'block';
    document.getElementById('user_active').value = user.is_active ? 'true' : 'false';
    
    document.getElementById('user-modal-title').textContent = 'Editar Usuário';
    document.getElementById('user-submit-btn').textContent = 'Salvar Alterações';
    document.getElementById('modal-user').style.display = 'flex';
}

window.deleteUser = async function(id) {
    if (confirm('Tem certeza que deseja inativar este usuário? Ele perderá acesso ao sistema.')) {
        try {
            await api.deleteUser(id);
            alert('Usuário inativado com sucesso!');
            window.location.reload();
        } catch(e) {
            alert('Erro: ' + e.message);
        }
    }
}
