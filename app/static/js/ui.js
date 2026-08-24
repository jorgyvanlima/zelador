document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Lógica de Login ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Se já tem token, redireciona pro dashboard
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
    if (dashboardBody) {
        // Valida sessão
        if (!api.getToken()) {
            window.location.href = '/login';
            return;
        }

        // Carrega dados iniciais
        try {
            const me = await api.getMe();
            document.getElementById('current-user').textContent = `Olá, ${me.username}`;
            await loadDepartments();
            await loadActiveVisits();
        } catch (err) {
            console.error(err);
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            api.logout();
        });

        // Modal Novo Visitante
        const modal = document.getElementById('modal-visit');
        document.getElementById('new-visit-btn').addEventListener('click', () => {
            modal.style.display = 'flex';
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById('new-visit-form').reset();
            document.getElementById('new-visitor-fields').style.display = 'none';
            currentVisitorId = null;
        });

        // Busca visitante ao digitar o documento
        const docInput = document.getElementById('doc_number');
        let currentVisitorId = null;

        docInput.addEventListener('blur', async () => {
            const doc = docInput.value.trim();
            if (!doc) return;
            
            const visitor = await api.getVisitorByDoc(doc);
            const extraFields = document.getElementById('new-visitor-fields');
            
            if (visitor) {
                // Visitante já existe
                extraFields.style.display = 'none';
                currentVisitorId = visitor.id;
                document.getElementById('full_name').removeAttribute('required');
                alert(`Visitante encontrado: ${visitor.full_name}`);
            } else {
                // Novo visitante
                extraFields.style.display = 'block';
                currentVisitorId = null;
                document.getElementById('full_name').setAttribute('required', 'true');
            }
        });

        // Submeter Check-in
        document.getElementById('new-visit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Se for novo, cadastra primeiro
                if (!currentVisitorId) {
                    const newVisitor = await api.createVisitor({
                        document_number: docInput.value,
                        full_name: document.getElementById('full_name').value,
                        document_type: document.getElementById('doc_type').value,
                        email: null
                    });
                    currentVisitorId = newVisitor.id;
                }

                // Faz o check-in
                await api.checkIn({
                    visitor_id: currentVisitorId,
                    department_id: parseInt(document.getElementById('dept_id').value),
                    purpose: document.getElementById('purpose').value || null
                });

                alert('Entrada registrada com sucesso!');
                modal.style.display = 'none';
                document.getElementById('new-visit-form').reset();
                currentVisitorId = null;
                await loadActiveVisits();

            } catch (err) {
                alert(`Erro: ${err.message}`);
            }
        });
    }

    async function loadDepartments() {
        const select = document.getElementById('dept_id');
        if (!select) return;
        const depts = await api.getDepartments();
        select.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
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

// Função global para o onclick
window.doCheckout = async function(visitId) {
    if (confirm('Confirmar saída deste visitante?')) {
        try {
            await api.checkOut(visitId);
            alert('Saída registrada!');
            // Recarrega a página ou a lista via dispatch event (simplicidade: reload)
            window.location.reload(); 
        } catch (err) {
            alert(`Erro ao fazer check-out: ${err.message}`);
        }
    }
}
