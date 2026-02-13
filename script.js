document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. HELPER FUNCTIONS
    ============================================================ */
    const showError = (input, message) => {
        let inputGroup = input.parentElement;
        // Sobe niveis se necessario
        if (inputGroup.classList.contains('phone-wrapper-combo') || inputGroup.classList.contains('file-upload-wrapper')) {
            inputGroup = inputGroup.parentElement;
        }
        inputGroup.classList.add('error');
        const errorDisplay = inputGroup.querySelector('.error-msg');
        if (errorDisplay) {
            errorDisplay.innerText = message;
            errorDisplay.style.display = 'block';
        }
    };

    const clearError = (input) => {
        let inputGroup = input.parentElement;
        if (inputGroup.classList.contains('phone-wrapper-combo') || inputGroup.classList.contains('file-upload-wrapper')) {
            inputGroup = inputGroup.parentElement;
        }
        inputGroup.classList.remove('error');
        const errorDisplay = inputGroup.querySelector('.error-msg');
        if (errorDisplay) errorDisplay.style.display = 'none';
    };

    const validators = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        nome: (value) => value.trim().split(' ').length >= 2,
        linkedin: (value) => value.toLowerCase().includes("linkedin.com") && value.trim().length > 15,
        mensagem: (value) => value.trim().length >= 20,
        notEmpty: (value) => value.trim() !== "",
        pdf: (fileInput) => fileInput.files.length > 0 && fileInput.files[0].name.toLowerCase().endsWith('.pdf')
    };

    const validatePhone = (value, ddi) => {
        const clean = value.replace(/\D/g, '');
        if (ddi === '+55') return clean.length >= 10;
        if (ddi === '+351') return clean.length === 9;
        return clean.length > 5;
    };

    /* ============================================================
       2. LÓGICA DE DDI E MÁSCARA (BLINDADA)
    ============================================================ */
    const ddiSelect = document.getElementById('ddi');
    const telInput = document.getElementById('telefone');

    if (telInput) {
        telInput.addEventListener('input', function (e) {
            // Se ddiSelect for null (Trabalhe Conosco), usa +55 padrão
            const ddi = ddiSelect ? ddiSelect.value : '+55';
            let value = e.target.value.replace(/\D/g, '');

            if (ddi === '+55') {
                let x = value.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            } else if (ddi === '+351') {
                let x = value.match(/(\d{0,3})(\d{0,3})(\d{0,3})/);
                e.target.value = !x[2] ? x[1] : x[1] + ' ' + x[2] + (x[3] ? ' ' + x[3] : '');
            }
        });

        // Só adiciona evento se o select existir
        if (ddiSelect) {
            ddiSelect.addEventListener('change', function () {
                telInput.value = '';
                clearError(telInput);
                if (this.value === '+55') telInput.placeholder = "(00) 00000-0000";
                else telInput.placeholder = "000 000 000";
            });
        }
    }

    /* ============================================================
       3. VALIDAÇÃO REAL-TIME
    ============================================================ */
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'file') ? 'change' : 'input';

        input.addEventListener(eventType, function () {
            let inputGroup = this.parentElement;
            if (this.type === 'file' || this.parentElement.classList.contains('phone-wrapper-combo')) {
                inputGroup = inputGroup.parentElement;
            }

            if (inputGroup.classList.contains('error')) {
                let valid = false;
                // Pega o DDI com segurança
                const currentDDI = ddiSelect ? ddiSelect.value : '+55';

                switch (this.id) {
                    case 'nome': valid = validators.nome(this.value); break;
                    case 'email': valid = validators.email(this.value); break;
                    case 'empresa': valid = validators.notEmpty(this.value); break;
                    case 'mensagem': valid = validators.mensagem(this.value); break;
                    case 'linkedin': valid = validators.linkedin(this.value); break;
                    case 'perfil': valid = validators.notEmpty(this.value); break;
                    case 'cv': valid = validators.pdf(this); break;
                    case 'telefone': valid = validatePhone(this.value, currentDDI); break;
                    default: valid = true;
                }
                if (valid) clearError(this);
            }
        });
    });

    /* ============================================================
       4. ENVIO (ACTION DEFINIDA NO JS)
    ============================================================ */
    const handleFormSubmit = (formId, inputsId, msgId, isContact = false) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault(); // Impede o envio HTML

            // 1. Preencher Data
            const hiddenDate = form.querySelector('input[name="Data_Envio"]');
            if (hiddenDate) {
                const agora = new Date();
                hiddenDate.value = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
            }

            let isValid = true;
            let firstInvalidInput = null;

            // Coleta Elementos
            const nome = form.querySelector('#nome');
            const email = form.querySelector('#email');
            const telefone = form.querySelector('#telefone');

            // Define DDI seguro
            const ddiEl = form.querySelector('.ddi-select');
            const ddiVal = ddiEl ? ddiEl.value : '+55';

            // Validações
            if (!validators.nome(nome.value)) { showError(nome, "*Nome completo necessário"); isValid = false; if (!firstInvalidInput) firstInvalidInput = nome; }
            if (!validators.email(email.value)) { showError(email, "*E-mail inválido"); isValid = false; if (!firstInvalidInput) firstInvalidInput = email; }
            if (!validatePhone(telefone.value, ddiVal)) { showError(telefone, "*Telefone inválido"); isValid = false; if (!firstInvalidInput) firstInvalidInput = telefone; }

            if (isContact) {
                const empresa = form.querySelector('#empresa');
                const mensagem = form.querySelector('#mensagem');
                if (!validators.notEmpty(empresa.value)) { showError(empresa, "*Obrigatório"); isValid = false; if (!firstInvalidInput) firstInvalidInput = empresa; }
                if (!validators.mensagem(mensagem.value)) { showError(mensagem, "*Mínimo 20 caracteres"); isValid = false; if (!firstInvalidInput) firstInvalidInput = mensagem; }
            } else {
                const linkedin = form.querySelector('#linkedin');
                const perfil = form.querySelector('#perfil');
                const cv = form.querySelector('#cv');
                if (!validators.linkedin(linkedin.value)) { showError(linkedin, "*Link inválido"); isValid = false; if (!firstInvalidInput) firstInvalidInput = linkedin; }
                if (!validators.notEmpty(perfil.value)) { showError(perfil, "*Selecione"); isValid = false; if (!firstInvalidInput) firstInvalidInput = perfil; }
                if (!validators.pdf(cv)) { showError(cv, "*PDF obrigatório"); isValid = false; if (!firstInvalidInput) firstInvalidInput = cv; }
            }

            if (!isValid) {
                if (firstInvalidInput) firstInvalidInput.focus();
                return;
            }

            // Envio
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            const formData = new FormData(form);

            // AQUI ESTÁ O SEGREDO: Definimos a URL aqui no fetch
            fetch("https://formsubmit.co/ajax/cazuza.paiva@gmail.com", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => response.ok ? response.json() : Promise.reject())
                .then(data => {
                    // Sucesso
                    const inputsDiv = document.getElementById(inputsId);
                    const msgDiv = document.getElementById(msgId);

                    if (inputsDiv && msgDiv) {
                        inputsDiv.style.display = 'none';
                        msgDiv.style.display = 'block';
                    }
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerText = originalBtnText;
                })
                .catch(error => {
                    console.error("Erro:", error);
                    alert("Erro ao enviar. Verifique o tamanho do arquivo (Max 5MB) e sua conexão.");
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    };

    handleFormSubmit('contactForm', 'contactFormInputs', 'contactSuccessMsg', true);
    handleFormSubmit('workForm', 'workFormInputs', 'workSuccessMsg', false);

    /* ============================================================
       5. EXTRAS
    ============================================================ */
    // Input File Name
    const fileInput = document.getElementById('cv');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = "#ffffff";
                if (validators.pdf(this)) clearError(this);
            } else {
                fileNameDisplay.textContent = "Clique para selecionar...";
                fileNameDisplay.style.color = "#94a3b8";
            }
        });
    }

    // Character Count
    const msgInput = document.getElementById('mensagem');
    const charCountDisplay = document.getElementById('charCount');
    if (msgInput && charCountDisplay) {
        msgInput.addEventListener('input', function () {
            const len = this.value.length;
            charCountDisplay.textContent = `${len} / 1000`;
            if (len >= 20) {
                charCountDisplay.style.color = "#27c93f";
                clearError(this);
            } else {
                charCountDisplay.style.color = "#ffbd2e";
            }
        });
    }

    // Modais e Scroll (Seu código original mantido aqui)
    const openModal = (modal) => { if (modal) { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); document.body.style.overflow = 'hidden'; } };
    const closeModal = (modal) => { if (modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); document.body.style.overflow = 'auto'; } };

    // Listeners dos Modais...
    // (Pode manter o resto do seu código de modais e scroll aqui)
    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.close))));
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay')) closeModal(e.target); });
    const btnTermos = document.getElementById('btnTermos'); if (btnTermos) btnTermos.addEventListener('click', (e) => { e.preventDefault(); openModal(document.getElementById('modalTermos')); });
    const btnPrivacidade = document.getElementById('btnPrivacidade'); if (btnPrivacidade) btnPrivacidade.addEventListener('click', (e) => { e.preventDefault(); openModal(document.getElementById('modalPrivacidade')); });
    const btnSobreFooter = document.getElementById('btnSobreFooter'); if (btnSobreFooter) btnSobreFooter.addEventListener('click', (e) => { e.preventDefault(); openModal(document.getElementById('modalSobre')); });
    const btnSobreNav = document.getElementById('btnSobreNav'); if (btnSobreNav) btnSobreNav.addEventListener('click', (e) => { e.preventDefault(); openModal(document.getElementById('modalSobre')); });

});